import { createEndpoint, waitEndpointReady } from 'react-native-webview-comlink/lib/web';
import { proxy, proxyValue } from 'comlinkjs';

export const rpcReady = waitEndpointReady;

// pre-define the rpc target
const target = {
  alert() {}
};

// create a comlinkjs proxy for the rpc call
const targetProxy = proxy(createEndpoint(), target);

// to make sure the callback functions go through proxy
const rpc = Object.keys(target).reduce((obj, key) => {
  obj[key] = (...args) => {
    const wrappedArgs = args.map(value => {
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

export default rpc;
