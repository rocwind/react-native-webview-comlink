/* eslint-disable import/first */
import { applyPolyfill } from 'message-port-polyfill';
applyPolyfill(); // need to force applyPolyfill for ios issue

import { Endpoint, proxy, ProxyResult } from 'comlinkjs';
import { wrap } from '../common/messagechanneladapter';
import { wait } from 'wait-ready';

const { afterReady, getStatus, setReady, setFailed } = wait<void>();

export { proxyValue } from 'comlinkjs';
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
export function createComlinkProxy<T>(target?: T): ProxyResult<T> {
    return proxy(createEndpoint(), target);
}
