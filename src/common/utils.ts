// 2^53 is large enough here
let nextID = 0;
export function generateID(): number {
    return nextID++;
}

// WeakRef - but not actually weak, just a wrapper
export interface WeakRefType<T> {
    deref(): T;
}
export class FakeWeakRef<T> implements WeakRefType<T> {
    constructor(private element: T) {}

    deref(): T {
        return this.element;
    }
}

// Map - for Android 5 browser where Map is not available
export class ArrayMap<K, V> {
    private keys: K[] = [];
    private values: V[] = [];
    private slots: number[] = [];
    set(key: K, value: V) {
        let index = this.findIndex(key);
        // alreay exists
        if (index !== -1) {
            this.values[index] = value;
            return;
        }
        // reuse a slot
        if (this.slots.length > 0) {
            const index = this.slots.pop();
            this.keys[index] = key;
            this.values[index] = value;
            return;
        }
        // push to the tail
        this.keys.push(key);
        this.values.push(value);
    }

    get(key: K): V {
        const index = this.findIndex(key);
        if (index === -1) {
            return undefined;
        }
        return this.values[index];
    }

    delete(key: K): void {
        const index = this.findIndex(key);
        if (index === -1) {
            return;
        }
        this.slots.push(index);
        this.keys.splice(index, 1);
        this.values.splice(index, 1);
    }

    private findIndex(key: K): number {
        return this.keys.indexOf(key);
    }
}
