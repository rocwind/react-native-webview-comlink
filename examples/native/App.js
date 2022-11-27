import { types } from '@babel/core';
import React from 'react';
import { StyleSheet, Alert, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { withJavascriptInterface, CoreJSInterface } from 'react-native-webview-comlink';

export default class App extends React.Component {
  constructor(props) {
    super(props);


    const jsInterface = {
        webToMobile(event) {
          console.log("event ::"+event);
      }

    }

    // the root obj to be exposed to web
    const rootObj = {
      alert: (title, message, onYes, onNo) => {
        const withCleanup = (cb) => () => {
          cb();
          onYes.release();
          onNo.release();
        };
        Alert.alert(title, message, [
          {
            text: 'YES',
            onPress: withCleanup(onYes),
          },
          {
            text: 'NO',
            onPress: withCleanup(onNo),
          },
        ]);
      },
      someMethodWithError: () =>
        Promise.reject(Object.assign(new Error('something wrong'), { code: -1 })),
    };

    // create higher-order WebView component
    this.WebViewComponent = withJavascriptInterface(jsInterface, 'CoreJSInterface', {
      forwardRef: true,
      log: true,
    })(WebView);

    this.ref = React.createRef();
  }

  render() {
    // localhost works for ios simulator and
    // android device with port forwarding by `adb reverse tcp:3000 tcp:3000`
    // you can also use your host ip address by editting `uri`
    // const uri = 'http://<you host ip address>:3000';
    const uri = 'http://localhost:3000';
    //const uri = 'https://638082b614b0af602674e1bf--capable-lollipop-05625d.netlify.app/';
    return (
      <SafeAreaView style={styles.container}>
        <this.WebViewComponent
          style={styles.container}
          source={{ uri }}
          ref={this.ref}
          onLoadStart={(evt) => {
            console.log('onLoadStart', evt.nativeEvent.url);
          }}
          onLoadEnd={(evt) => {
            console.log('onLoadEnd', evt.nativeEvent.url);
          }}
          injectedJavaScriptBeforeContentLoaded={`console.log('hello world!');`}
        ></this.WebViewComponent>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
