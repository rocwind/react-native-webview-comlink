/* eslint-disable import/first */
import 'message-port-polyfill';

import { Endpoint, proxy, ProxyResult, proxyValue } from 'comlinkjs';
import { wrap } from '../common/messagechanneladapter';

/**
 * create a Comlink endpoint
 */
function createEndpoint(): Endpoint {
    return wrap({
        send(data) {
            (<any>window).ReactNativeWebView.postMessage(data);
        },
        addEventListener(type, listener) {
            if (type !== 'message') {
                throw Error(`unsupported event type: ${type}`);
            }
            // android
            document.addEventListener(type, listener);
            // ios
            window.addEventListener(type, listener);
        },
        removeEventListener(type, listener) {
            if (type !== 'message') {
                throw Error(`unsupported event type: ${type}`);
            }
            // android
            document.removeEventListener(type, listener);
            // ios
            window.addEventListener(type, listener);
        },
        dispatchEvent(event) {
            window.dispatchEvent(event);
            return document.dispatchEvent(event);
        },
    });
}

/**
 * create Comlink proxy object
 * @param target
 */
function createComlinkProxy<T>(target: T): ProxyResult<T> {
    const keys = Object.keys(target);
    const proxied = proxy(createEndpoint(), target);
    // auto proxy function arg
    return keys.reduce((result, key) => {
        result[key] = (...args) => {
            return proxied[key].apply(
                target,
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
    window[$EXPOSED_NAME] = createComlinkProxy($EXPOSED_TARGET);
}
