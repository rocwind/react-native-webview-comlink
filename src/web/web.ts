import './polyfill';
import { JavascriptInterface, MessageEvent } from './types';
import { MessageHub } from '../common/MessageHub';
import { createRemoteFunction } from '../common/message';
import { createLogger } from '../common/logger';

// place holders
declare var $EXPOSED_TARGET: any;
declare var $LOG_ENABLED: boolean;

const logger = createLogger($LOG_ENABLED);
/**
 * create Javascript interface object
 * @param target
 */
function createInterface<T>(name: string, target: T, os: string): JavascriptInterface<T> {
    const hub = new MessageHub(name, window.ReactNativeWebView, logger);
    let initialized = false;
    const init = () => {
        if (initialized) {
            return;
        }
        initialized = true;
        const listener = (evt: MessageEvent) => {
            const msg = evt.data;
            if (hub.canHandleMessage(msg)) {
                logger(`received message from native ${msg}`);
                hub.handleMessage(msg);
            }
        };

        if (os === 'android') {
            document.addEventListener('message', listener);
        } else if (os === 'ios') {
            window.addEventListener('message', listener);
        }
    };

    return Object.keys(target).reduce((obj, key) => {
        const remoteFunction = createRemoteFunction(target[key], 0, hub);
        obj[key] = (...args: unknown[]) => {
            init();
            return remoteFunction(...args);
        };
        return obj;
    }, {} as JavascriptInterface<T>);
}

/**
 * for native bundle to inject
 */
if (!window['$EXPOSED_NAME']) {
    logger('"$EXPOSED_NAME" injected');
    window['$EXPOSED_NAME'] = createInterface('$EXPOSED_NAME', $EXPOSED_TARGET, '$PLATFORM_OS');
}
