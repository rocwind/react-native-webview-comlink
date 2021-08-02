import { StringMessageChannel } from '../common/messagechanneladapter';
import { MessageChannelHub } from '../common/messagechannelhub';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Logger } from './logger';

export type isEnabledGetter = () => boolean;
export class WebViewMessageChannel implements StringMessageChannel {
    private webview: WebView;
    private hub: MessageChannelHub;

    constructor(name: string, private isEnabled: isEnabledGetter, private logger: Logger) {
        this.hub = new MessageChannelHub(name);
    }

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
        (this.webview as any).postMessage(this.hub.encodeMessage(data));
    }

    addEventListener(type: string, listener: EventListenerOrEventListenerObject) {
        if (type !== 'message') {
            throw Error(`unsupported event type: ${type}`);
        }

        this.hub.addEventListener(listener);
    }

    removeEventListener(type: string, listener: EventListenerOrEventListenerObject) {
        if (type !== 'message') {
            throw Error(`unsupported event type: ${type}`);
        }

        this.hub.removeEventListener(listener);
    }

    onMessage(event: WebViewMessageEvent): boolean {
        if (!this.hub.canHandleMessageEvent(event.nativeEvent)) {
            return false;
        }

        this.logger(`received message from webview: ${event.nativeEvent.data}`);
        if (!this.isEnabled()) {
            this.logger('MessageChannel is disabled, drop received message');
            return true;
        }

        this.hub.handleMessageEvent(event.nativeEvent);
        return true;
    }

    setWebview(webview: WebView) {
        this.webview = webview;
    }
}
