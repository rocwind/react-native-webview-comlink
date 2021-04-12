/* eslint-disable import/first */
import { applyPolyfill } from 'message-port-polyfill';
applyPolyfill(); // need to force applyPolyfill for ios issue

import { Endpoint, proxy, ProxyResult, proxyValue, ProxyValue } from 'comlinkjs';
import { wrap } from '../common/messagechanneladapter';
import { wait } from 'wait-ready';

export { ProxyValue };

const { afterReady, getStatus, setReady, setFailed } = wait<void>();

/**
 * check if Comlink endpoint is ready for sending & received message
 */
export const getEndpointStatus = getStatus;
/**
 * wait for Comlink endpont ready, returns a promise that resolve or reject on endpoint ready/failed
 */
export const waitEndpointReady = afterReady;

const ENDPOINT_CHECK_INTERVAL: number = 200;
const ENDPOINT_CHECK_TIMEOUT: number = 10000;
const startTimestamp: number = Date.now();
function checkEndpointReady() {
    // react-native-webview will add window.ReactNativeWebView
    if ((<any>window).ReactNativeWebView) {
        setReady();
        return;
    }

    if (Date.now() - startTimestamp > ENDPOINT_CHECK_TIMEOUT) {
        setFailed();
        return;
    }

    setTimeout(checkEndpointReady, ENDPOINT_CHECK_INTERVAL);
}

checkEndpointReady();

/**
 * create a Comlink endpoint
 * @deprecated please use createComlinkProxy() instead, createEndpoint() will be made private in future version
 */
export function createEndpoint(): Endpoint {
    return wrap({
        send(data) {
            // make sure the message delivered to native
            afterReady().then(() => {
                (<any>window).ReactNativeWebView.postMessage(data);
            });
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
export function createComlinkProxy<T>(target: T): ProxyResult<T> {
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
