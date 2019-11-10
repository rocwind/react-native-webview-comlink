// proxy-polyfill is needed to support iOS 9 and below
import 'proxy-polyfill';
import React from 'react';
import { StyleSheet, Alert, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
// import { WebView } from 'react-native'; // the built-in WebView is also supported
import { withComlinkExpose } from 'react-native-webview-comlink';

export default class App extends React.Component {
  constructor(props) {
    super(props);

    // the root obj to be exposed to web
    const rootObj = {
      alert: (title, message, onYes, onNo) => {
        Alert.alert(title, message, [{
          text: 'YES',
          onPress: onYes,
        }, {
          text: 'NO',
          onPress: onNo,
        }]);
      },
      someMethodWithError: () => Promise.reject(new Error('something wrong')),
    };

    // create higher-order WebView component
    this.WebViewComponent = withComlinkExpose(rootObj, { forwardRef: true, debug: true })(WebView);

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
          >
        </this.WebViewComponent>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
