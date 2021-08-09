// T => Promise<T> and Promise<T> => Promise<T>
type Promisify<T> = T extends Promise<unknown>
    ? T
    : T extends boolean
    ? Promise<boolean>
    : Promise<T>;

export type JavascriptInterface<T> = {
    [P in keyof T]: T[P] extends (...args: infer Arguments) => infer R
        ? (...args: Arguments) => Promisify<R>
        : never;
};

// simplified DOM standard interface
interface Event {}

export interface EventListener {
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

declare global {
    var window: Window & typeof globalThis;
    var document: Document;
}

export interface MessageEvent {
    data: string;
}
