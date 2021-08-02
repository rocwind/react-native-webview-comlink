export class MessageChannelHub {
    private listeners: EventListenerOrEventListenerObject[] = [];
    private tag: string;

    constructor(name: string) {
        this.tag = `RNWC|${name}|`;
    }

    addEventListener(listener: EventListenerOrEventListenerObject): boolean {
        if (this.listeners.indexOf(listener) !== -1) {
            return false;
        }
        this.listeners.push(listener);
        return true;
    }

    removeEventListener(listener: EventListenerOrEventListenerObject): boolean {
        const index = this.listeners.indexOf(listener);
        if (index === -1) {
            return false;
        }
        this.listeners.splice(index, 1);
        return true;
    }

    getListenersCount(): number {
        return this.listeners.length;
    }

    encodeMessage(data: string): string {
        return this.tag + data;
    }

    canHandleMessageEvent(evt: { data: string }): boolean {
        return evt?.data && evt.data.startsWith(this.tag);
    }

    handleMessageEvent(evt: { data: string }): void {
        const decoded = {
            data: evt.data.slice(this.tag.length),
        };
        this.listeners.forEach((listener) => {
            if (typeof listener === 'function') {
                listener(decoded);
            } else {
                listener.handleEvent(decoded);
            }
        });
    }
}
