import { MessageHub } from '../common/MessageHub';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Logger } from '../common/logger';

export type isEnabledGetter = () => boolean;

export class InterfaceProvider {
    private webview: WebView;
    private hub: MessageHub;

    constructor(
        name: string,
        rootObj: any,
        private isEnabled: isEnabledGetter,
        private logger: Logger,
    ) {
        this.hub = new MessageHub(name, this);
        Object.keys(rootObj).forEach((key) => {
            const property: unknown = rootObj[key];
            if (typeof property !== 'function') {
                return;
            }
            this.hub.registerReceiver(key, (...args: unknown[]) => {
                return property.apply(rootObj, args);
            });
        });
    }

    postMessage(data: string) {
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

    onMessage(event: WebViewMessageEvent): boolean {
        const { data } = event.nativeEvent;
        if (!this.hub.canHandleMessage(data)) {
            return false;
        }

        this.logger(`received message from webview: ${data}`);
        if (!this.isEnabled()) {
            this.logger('MessageChannel is disabled, drop received message');
            return true;
        }

        this.hub.handleMessage(data);
        return true;
    }

    setWebview(webview: WebView) {
        this.webview = webview;
    }
}
