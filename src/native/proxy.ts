import { Exposable } from 'comlinkjs';

const createNotExistsPropErrorHandler = (prop: string | number | symbol) => () => Promise.reject({
    message: `prop: ${String(prop)} is not exsits`,
});


const promisify = (rpcMethod: (...args: any[]) => any) => (...args: any[]) => Promise.resolve()
    .then(() => rpcMethod(...args))
    .catch((err) => {
        if (err instanceof Error) {
            throw Object.assign({}, err, {
                message: err.message,
                name: err.name,
            });
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
