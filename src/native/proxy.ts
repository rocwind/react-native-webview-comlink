import { Exposable } from 'comlinkjs';

type PropType = string | number | symbol;

const createNotExistsPropErrorHandler = (prop: PropType) => () => Promise.reject({
    message: `prop: ${String(prop)} is not exsits`,
});

const promisify = (rpcMethod: Function) => (...args: any[]) => Promise.resolve()
    .then(() => rpcMethod(...args))
    .catch((err) => {
        if (err instanceof Error) {
            const { message,
                // read-only properties, may cause error on iOS9 webview
                name, stack,
                line, column, sourceURL,
                ...rest
            } = err as any;
            throw {
                message,
                ...rest,
            };
        }
        throw err;
    });

const RESERVED_PROPS: PropType[] = [
    'then', // used in promise.resolve()@es6-extensions
];

const createExposableProxy = (target: Exposable): Exposable => {
    if (typeof target === 'function') {
        return promisify(target);
    }
    return new Proxy(target, {
        get: (target, prop) => {
            if (prop in target) {
                // prop exists
                const source = target[prop];
                if (typeof source === 'function') {
                    return promisify(source);
                }
                return source;
            }
            // prop not exists
            if (RESERVED_PROPS.includes(prop)) {
                return undefined;
            }
            return createNotExistsPropErrorHandler(prop);
        }
    });
};

export default createExposableProxy;
