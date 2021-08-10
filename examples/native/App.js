import React from 'react';
import { StyleSheet, Alert, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { withJavascriptInterface } from 'react-native-webview-comlink';

export default class App extends React.Component {
  constructor(props) {
    super(props);

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
    this.WebViewComponent = withJavascriptInterface(rootObj, 'MyJSInterface', {
      forwardRef: true,
      log: true,
    })(WebView);

    this.ref = React.createRef();
  }

  render() {
    const uri = 'http://localhost:3000';
    // localhost works for ios simulator, for other case please use host address
    // const uri = 'http://<you host ip address>:3000';
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
