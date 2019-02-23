import 'message-port-polyfill';
import { Endpoint } from 'comlinkjs';
import { wrap } from 'comlinkjs/messagechanneladapter';
import { beginWait } from 'wait-ready';

export function createEndpoint(): Endpoint {
    return wrap({
        send(data) {
            window.postMessage(data, '*');
        },
        addEventListener(type, listener) {
            document.addEventListener(type, listener);
        },
        removeEventListener(type, listener) {
            document.removeEventListener(type, listener);
        },
        dispatchEvent(event) {
            return document.dispatchEvent(event);
        }
    });
}

const { wait, setReady, setFailed } = beginWait();
export const waitEndpointReady = wait;

const ENDPOINT_CHECK_INTERVAL: number = 200;
const ENDPOINT_CHECK_TIMEOUT: number = 10000;
const startTimestamp: number = Date.now();
function checkEndpointReady() {
    // react-native webview will replace the default postMessage method.
    // originalPostMessage will be set when it's done.
    // it means the rpc protocol is ready
    if ((<any>window).originalPostMessage) {
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


// TODO: handle ios9 message port issue
