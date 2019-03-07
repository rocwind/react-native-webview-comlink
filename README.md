# react-native-webview-comlink [![Build Status](https://travis-ci.org/rocwind/react-native-webview-comlink.svg?branch=master)](https://travis-ci.org/rocwind/react-native-webview-comlink)

`react-native-webview-comlink`'s goal is to integrate the Comlink with React Native WebView component, allow the js in web browser calls native API.

## Install
* Install the package and `Comlink`: `npm i --save react-native-webview-comlink comlinkjs`
* Eject expo project: if React Native project is created by `expo-cli`, it needs to be ejected by `npm run eject`
* For Android: Since comlink needs ES6 features to work, it is recommended to use up-to-date JavaScriptCore for Android build, check out [JSC build scripts](https://github.com/react-native-community/jsc-android-buildscripts) for more details about how to integrate jsc to React Native project

## Usage

### Native
```
import { WebView } from 'react-native-webview';
import { withComlinkExpose } from 'react-native-webview-comlink';

// root api object for web side to call
const rootObj = {
    someMethod() {
        console.warn('someMethod called');
    },
};
const WebViewComponent = withComlinkExpose(rootObj)(WebView);

// render with the <WebViewComponent />
```

### Web
```
import { createEndpoint } from 'react-native-webview-comlink';
import { proxy } from 'comlinkjs';

const proxyObj = proxy(createEndpoint());
// call native side method
proxyObj.someMethod();
```

## Examples
There are example [React Native project](examples/native) and [Web project(React)](examples/web) in [examples directory](examples)

## API
### Native
#### `withComlinkExpose(obj, options)(WebView)`
> Returns a higher-order React WebView component class that has `obj` exposed via `comlink`.

* [`options`] _(Object)_: if specified, customized the behavior of the higher-order WebView component.
    - [`forwardRef`] _(Boolean)_: forward ref to the wrapped component, default is `false`
    - [`whitelistUrls`] _(String or RegExp Array)_: white list urls where `Comlink` enabled, default is `null`
    - [`isEnabled`] _(Function)_: for control Comlink enable or disable status, it gets called in sending and receiving each message, returns `true` to let the message pass, default is `null`
    - [`debug`] _(Boolean)_: print debug log to console, default is `false`

### Web
#### `createEndpoint()`
> Returns an `endpoint` for `comlink` to use.

#### `getEndpointStatus()`
> Returns current `endpoint` status in `ReadyStatusEnum` described below.

```
ReadyStatusEnum {
    Pending = 0,
    Ready = 1,
    Failed = -1,
}
```

#### `waitEndpointReady()`
> Returns a `Promise` that resolves when `endpoint` is ready or rejects on timeout.

## Polyfills
`comlink` depends on some ES6+ features such as [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), [Generator Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*), [Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol). [babel-polyfill](https://babeljs.io/docs/en/babel-polyfill) and [proxy-polyfill](https://github.com/GoogleChrome/proxy-polyfill) may need to be included to get it work with legacy browsers.
