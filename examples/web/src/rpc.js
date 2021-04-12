import { createComlinkProxy, waitEndpointReady } from 'react-native-webview-comlink';

export const rpcReady = waitEndpointReady;

// pre-define the rpc target
const target = {
  alert: () => {},
  someMethodWithError: () => {},
  someMethodThatNotExists: () => {},
};

// create a comlink proxy for the rpc call
export const rpc = createComlinkProxy(target);
