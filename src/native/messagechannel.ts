import { StringMessageChannel } from '../common/messagechanneladapter';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Logger } from './logger';

export interface isEnabledGetter {
    (): boolean;
}

export default class WebViewMessageChannel implements StringMessageChannel {
    private webview: WebView;
    private listeners: EventListenerOrEventListenerObject[] = [];

    constructor(private isEnabled: isEnabledGetter, private logger: Logger) {}

    send(data: string) {
        this.logger(`sending message to webview: ${data}`);
        if (!this.isEnabled()) {
            this.logger('MessageChannel is disabled, skip sending message');
            return;
        }
        if (!this.webview) {
            this.logger('WebView is missing, skip sending message');
            return;
        }
        (this.webview as any).postMessage(data);
    }

    addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
        if (type !== 'message') {
            throw Error(`unsupported event type: ${type}`);
        }

        if (this.listeners.includes(listener)) {
            return;
        }
        this.listeners.push(listener);
    }

    removeEventListener(type: string, listener: EventListenerOrEventListenerObject) {
        if (type !== 'message') {
            throw Error(`unsupported event type: ${type}`);
        }

        const index = this.listeners.indexOf(listener);
        if (index === -1) {
            return;
        }
        this.listeners.splice(index, 1);
    }

    onMessage(event: WebViewMessageEvent) {
        this.logger(`received message from webview: ${JSON.stringify(event.nativeEvent.data)}`);
        if (!this.isEnabled()) {
            this.logger('MessageChannel is disabled, drop received message');
            return;
        }

        this.listeners.forEach((listener) => {
            if (typeof listener === 'function') {
                listener(event.nativeEvent);
            } else {
                listener.handleEvent(event.nativeEvent);
            }
        });
    }

    setWebview(webview: WebView) {
        this.webview = webview;
    }
}
