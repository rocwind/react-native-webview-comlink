// to get web script pass compile

// simplified DOM standard interface
interface Event {}

interface EventListener {
    (evt: Event): void;
}

interface EventTarget {
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
}

interface Window extends EventTarget {
    // injected by React Native WebView
    ReactNativeWebView: {
        postMessage(message: string): void;
    };
}
interface Document extends EventTarget {}

declare const window: Window & typeof globalThis;
declare const document: Document;
