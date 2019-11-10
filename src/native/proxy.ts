import { Exposable } from 'comlinkjs';

const createNotExistsPropErrorHandler = (prop: string | number | symbol) => () => Promise.reject({
    message: `prop: ${String(prop)} is not exsits`,
});


const promisify = (rpcMethod: (...args: any[]) => any) => (...args: any[]) => Promise.resolve()
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



const createExposableProxy = (target: Exposable): Exposable => new Proxy(target, {
    get: (target, prop) => {
        if (prop in target) {
            return promisify(target[prop]);
        }
        return createNotExistsPropErrorHandler(prop);
    }
});


export default createExposableProxy;
