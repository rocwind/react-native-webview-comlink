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

export interface MessageEvent {
    data: string;
}
