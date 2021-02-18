// since react-native global types conflicts with dom types
// we need to exclude dom lib to compile, however, there are some types are
// referenced by comlinkjs, to get it compile, add those types here
interface Event {}

interface EventListenerObject {
    handleEvent(evt: Event): void;
}

interface EventListener {
    (evt: Event): void;
}

declare type EventListenerOrEventListenerObject = EventListener | EventListenerObject;

interface EventTarget {
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
    dispatchEvent?(event: Event): void;
}

interface Window extends EventTarget {}
declare var window: Window & typeof globalThis;

interface Document extends EventTarget {}
declare var document: Document;

interface MessageEvent {
    data: any;
}

interface MessagePort extends EventTarget {
    onmessage: ((this: MessagePort, ev: MessageEvent) => any) | null;
    onmessageerror: ((this: MessagePort, ev: MessageEvent) => any) | null;
    /**
     * Disconnects the port, so that it is no longer active.
     */
    close(): void;
    /**
     * Posts a message through the channel. Objects listed in transfer are
     * transferred, not just cloned, meaning that they are no longer usable on the sending side.
     * Throws a "DataCloneError" DOMException if
     * transfer contains duplicate objects or port, or if message
     * could not be cloned.
     */
    postMessage(message: any, transfer?: any[]): void;
    /**
     * Begins dispatching messages received on the port.
     */
    start(): void;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void;
}

declare var MessagePort: {
    prototype: MessagePort;
    new (): MessagePort;
};

interface MessageChannel {
    readonly port1: MessagePort;
    readonly port2: MessagePort;
}

declare var MessageChannel: {
    prototype: MessageChannel;
    new (): MessageChannel;
};

type Transferable = ArrayBuffer | MessagePort;

declare function setTimeout(handler: () => void, timeout?: number, ...arguments: any[]): number;
