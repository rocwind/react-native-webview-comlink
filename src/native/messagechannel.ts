import { StringMessageChannel } from 'comlinkjs/messagechanneladapter';
import { WebView, WebViewMessageEvent } from './webview';

export default class WebViewMessageChannel implements StringMessageChannel {
    private webview: WebView;
    private listeners: EventListenerOrEventListenerObject[] = [];

    constructor(private debug: boolean) {

    }

    send(data: string) {
        if (this.debug) {
            console.log(`[WebViewComlink] sending message to webview:`);
            console.log(data);
        }
        this.webview.postMessage(data);
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
        if (this.debug) {
            console.log(`[WebViewComlink] received message from webview:`);
            console.log(JSON.stringify(event.nativeEvent.data));
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
