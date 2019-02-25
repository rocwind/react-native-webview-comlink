/* eslint-disable import/first */
import { applyPolyfill } from 'message-port-polyfill';
applyPolyfill(); // need to force applyPolyfill for ios issue

import { Endpoint } from 'comlinkjs';
import { wrap } from 'comlinkjs/messagechanneladapter';
import { beginWait } from 'wait-ready';

const { wait, setReady, setFailed } = beginWait();
export const waitEndpointReady = wait;

const ENDPOINT_CHECK_INTERVAL: number = 200;
const ENDPOINT_CHECK_TIMEOUT: number = 10000;
const startTimestamp: number = Date.now();
function checkEndpointReady() {
    // react-native-webview will add window.ReactNativeWebView
    // react-native built-in webview will save original window.postMessage to window.originalPostMessage
    // when either of them exists, means the endpoint is ready
    if ((<any>window).ReactNativeWebView || (<any>window).originalPostMessage) {
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

export function createEndpoint(): Endpoint {
    return wrap({
        send(data) {
            // make sure the message delivered to native
            waitEndpointReady().then(() => {
                if ((<any>window).ReactNativeWebView) {
                    // react-native-webview
                    (<any>window).ReactNativeWebView.postMessage(data);
                } else {
                    // lagacy react-native built-in webview
                    window.postMessage(data, '*');
                }
            });
        },
        addEventListener(type, listener) {
            if (type !== 'message') {
                throw Error(`unsupported event type: ${type}`);
            }
            // react-native-webview
            window.addEventListener(type, listener);
            // lagacy react-native built-in webview
            document.addEventListener(type, listener);
        },
        removeEventListener(type, listener) {
            if (type !== 'message') {
                throw Error(`unsupported event type: ${type}`);
            }
            window.addEventListener(type, listener);
            document.removeEventListener(type, listener);
        },
        dispatchEvent(event) {
            return window.dispatchEvent(event);
        }
    });
}
