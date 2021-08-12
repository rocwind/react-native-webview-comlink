# react-native-webview-comlink ![Node.js CI](https://github.com/rocwind/react-native-webview-comlink/workflows/Node.js%20CI/badge.svg)

`react-native-webview-comlink` brings `addJavascriptInterface` to `react-native-webview`, supports both `Android` and `iOS`. Its implemention is inspired by the [Comlink](https://github.com/GoogleChromeLabs/comlink) project.

## Install

-   Install the package: `npm i --save react-native-webview-comlink`

## Usage

### Native

```
import { WebView } from 'react-native-webview';
import { withJavascriptInterface } from 'react-native-webview-comlink';
// it's not necessary but recommended to put the interface definition at some common
// place to share it between native and web projects if you use TypeScript
import { MyJSInterface } from './common/types';

// root api object for web side to call
const rootObj: MyJSInterface = {
    someMethod() {
        console.warn('someMethod called');
        return 42;
    },
    someMethodWithCallbackSupport(cb) {
        cb('invoke callback from native');

        // release the callback, so it can be garbage collected at the web side.
        // callbacks maintain reference count inside, each time we got a callback instance
        // from the method argument, there should be a corresponding release() call when it
        // is no longer needed.
        // this can be safely skipped if FinalizationRegistry and WeakRef is supported at
        // native Javascript runtime.
        // however, since GC timing is unpredictable, it's still recommended to handle the
        // release() manually to get a lower memory footprint at the web side. (and avoids
        // possible lagging if lots of proxied method being cleaned up during GC - which causes
        // the same amount of messages being sent to web side)
        cb.release();
    },
};
const WebViewComponent = withJavascriptInterface(rootObj, 'MyJSInterface')(WebView);

// render web page with the <WebViewComponent />
```

### Web

```
import { JavascriptInterface } from 'react-native-webview-comlink';
import { MyJSInterface } from './common/types';

declare global {
    interface Window {
        MyJSInterface: JavascriptInterface<MyJSInterface>;
    }
}

// call native side method
MyJSInterface.someMethod().then((result) => {
    console.log(result);
});

// callbacks are supported
MyJSInterface.someMethodWithCallbackSupport((msg) => {
    console.log(msg);
});
```

## Examples

There are example [React Native project](examples/native) and [Web project(React)](examples/web) in [examples directory](examples)

## API

### Native

#### `withJavascriptInterface(obj, name, options)(WebView)`

> Returns a higher-order React WebView component class that has `obj` exposed as `name`.

-   [`options`] _(Object)_: if specified, customized the behavior of the higher-order WebView component.
    -   [`whitelistURLs`] _(String or RegExp Array)_: white list urls where the `JavascriptInterface` enabled, default is `null`
    -   [`isEnabled`] _(Function)_: for gain more control on enable or disable status besides `whitelistURLs`, it gets called in sending and receiving each message, returns `true` to let the message pass, default is `null`
    -   [`forwardRef`] _(Boolean)_: forward ref to the wrapped WebView component, default is `false`
    -   [`log`] _(Boolean)_: print debug log to console, default is `false`

### Web

Just call `JavascriptInterface` methods on window.`name`.

## Compatibility

-   Android 5+
-   iOS 10+
