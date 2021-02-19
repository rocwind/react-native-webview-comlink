# react-native-webview-comlink ![Node.js CI](https://github.com/rocwind/react-native-webview-comlink/workflows/Node.js%20CI/badge.svg)

`react-native-webview-comlink`'s goal is to integrate the [Comlink](https://github.com/GoogleChromeLabs/comlink) with React Native WebView component, allow the js in web browser calls native API.

## Install

-   Install the package: `npm i --save react-native-webview-comlink`
-   Eject expo project: if React Native project is created by `expo-cli`, it needs to be ejected by `npm run eject`
-   For Android: Since comlink needs ES6 features to work, it is recommended to use [Hermes](https://reactnative.dev/docs/hermes) or [up-to-date JavaScriptCore](https://github.com/react-native-community/jsc-android-buildscripts) for Android build. However, proxy-polyfill is needed to work with Hermes currently, check out [this issue](https://github.com/facebook/hermes/issues/33) for updates

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
import { createComlinkProxy } from 'react-native-webview-comlink';

const proxyObj = createComlinkProxy();
// call native side method
proxyObj.someMethod();
```

## Examples

There are example [React Native project](examples/native) and [Web project(React)](examples/web) in [examples directory](examples)

## API

### Native

#### `withComlinkExpose(obj, options)(WebView)`

> Returns a higher-order React WebView component class that has `obj` exposed via `comlink`.

-   [`options`] _(Object)_: if specified, customized the behavior of the higher-order WebView component.
    -   [`forwardRef`] _(Boolean)_: forward ref to the wrapped component, default is `false`
    -   [`whitelistUrls`] _(String or RegExp Array)_: white list urls where `Comlink` enabled, default is `null`
    -   [`isEnabled`] _(Function)_: for control Comlink enable or disable status, it gets called in sending and receiving each message, returns `true` to let the message pass, default is `null`
    -   [`log`] _(Boolean)_: print debug log to console, default is `false`

### Web

#### `createComlinkProxy(target)`

> Returns a Comlink `proxy` of exposed `obj` from native to use.

-   [`target`] _(Object)_: it's needed to work with proxy-polyfill. Since the proxy-polyfill requires proxy properties known at creation time.

#### `proxyValue()`

> To create a proxy to send for callbacks

#### `getEndpointStatus()`

> Returns current Comlink endpoint status in `ReadyStatusEnum` described below. It doesn't matter to create comlink proxy or invoke it's methods before Comlink ready.

```
ReadyStatusEnum {
    Pending = 0,
    Ready = 1,
    Failed = -1,
}
```

#### `waitEndpointReady()`

> Returns a `Promise` that resolves when Comlink endpoint is ready or rejects on timeout.

## Polyfills

`comlink` depends on some ES6+ features such as [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy), [Generator Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*), [Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol). [babel-polyfill](https://babeljs.io/docs/en/babel-polyfill) and [proxy-polyfill](https://github.com/GoogleChrome/proxy-polyfill) may need to be included to get it work with legacy browsers.
