import { WebView } from 'react-native-webview';
import { script } from './script';

export class Injector {
    private webview: WebView;
    private targetScript: string;
    constructor(name: string, exposedObj: any) {
        // assum exposedObj to be an object with function props
        const exposedTarget = `{${Object.keys(exposedObj)
            .map((key) => `${key}: function(){}`)
            .join(',')}}`;

        this.targetScript = script
            .replace(/\$EXPOSED_NAME/g, `"${name}"`)
            .replace('$EXPOSED_TARGET', exposedTarget);
    }

    inject() {
        if (!this.webview) {
            return;
        }
        this.webview.injectJavaScript(this.targetScript);
    }

    setWebview(webview: WebView) {
        this.webview = webview;
    }
}
