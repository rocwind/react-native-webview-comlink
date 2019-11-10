import { createEndpoint, waitEndpointReady } from 'react-native-webview-comlink';
import { proxy, proxyValue } from 'comlinkjs';

export const rpcReady = waitEndpointReady;

// pre-define the rpc target
// it's a limitation of the proxy-polyfill that properties to proxy must be known at creation time: https://github.com/GoogleChrome/proxy-polyfill;
const target = {
  alert: () => {},
  someMethodWithError: () => {},
};

// create a comlink proxy for the rpc call
const targetProxy = proxy(createEndpoint(), target);

// to make sure the callback functions go through proxy
const rpc = Object.keys(target).reduce((obj, key) => {
  obj[key] = (...args) => {
    const wrappedArgs = args.map(value => {
      // callback functions need to be wrapped by proxyValue() to work
      if (typeof value !== 'function') {
        return value;
      }

      const valueProxy = proxyValue(value);
      return valueProxy;
    });

    return targetProxy[key].apply(target, wrappedArgs);
  };

  return obj;
}, {});

// return the wrapped rpc object
export default rpc;
