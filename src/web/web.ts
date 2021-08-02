import 'message-port-polyfill';
import { Endpoint, proxy, ProxyResult, proxyValue } from 'comlinkjs';
import { wrap } from '../common/messagechanneladapter';
import { MessageChannelHub } from '../common/messagechannelhub';

/**
 * create a Comlink endpoint
 */
function createEndpoint(name: string): Endpoint {
    const hub = new MessageChannelHub(name);
    const listenerProxy = (evt: MessageEvent) => {
        if (hub.canHandleMessageEvent(evt)) {
            hub.handleMessageEvent(evt);
        }
    };

    return wrap({
        send(data) {
            (<any>window).ReactNativeWebView.postMessage(hub.encodeMessage(data));
        },

        addEventListener(type, listener) {
            if (type !== 'message') {
                throw Error(`unsupported event type: ${type}`);
            }

            if (!hub.addEventListener(listener)) {
                return;
            }
            if (hub.getListenersCount() === 1) {
                // android
                document.addEventListener(type, listenerProxy);
                // ios
                window.addEventListener(type, listenerProxy);
            }
        },
        removeEventListener(type, listener) {
            if (type !== 'message') {
                throw Error(`unsupported event type: ${type}`);
            }
            if (!hub.removeEventListener(listener)) {
                return;
            }

            if (hub.getListenersCount() === 0) {
                // android
                document.removeEventListener(type, listenerProxy);
                // ios
                window.addEventListener(type, listenerProxy);
            }
        },
    });
}

/**
 * create Comlink proxy object
 * @param target
 */
function createComlinkProxy<T>(name: string, target: T): ProxyResult<T> {
    const keys = Object.keys(target);
    const proxied = proxy(createEndpoint(name), target);
    // auto proxy function arg
    return keys.reduce((result, key) => {
        result[key] = (...args) => {
            return proxied[key].apply(
                null,
                args.map((arg) => (typeof arg === 'function' ? proxyValue(arg) : arg)),
            );
        };
        return result;
    }, {} as ProxyResult<T>);
}

/**
 * for native bundle to inject
 */
declare var $EXPOSED_NAME: any;
declare var $EXPOSED_TARGET: any;
if (typeof $EXPOSED_NAME === 'string' && !window[$EXPOSED_NAME]) {
    console.log('[WebViewComlink] $EXPOSED_NAME injected');
    window[$EXPOSED_NAME] = createComlinkProxy($EXPOSED_NAME, $EXPOSED_TARGET);
}
