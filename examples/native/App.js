import { types } from '@babel/core';
import React from 'react';
import { StyleSheet, Alert, SafeAreaView, Button } from 'react-native';
import { WebView } from 'react-native-webview';
import { withJavascriptInterface } from 'react-native-webview-comlink';

var webInterface

const onButtonClick = () => {
  console.log("onButtonClick ::");
    // TODO
    // if(webInterface){
    //   console.log("onButtonClick :: webInterface is not null");
    //   webInterface.mobileToWeb("Mobile To Web");
    // } else {
    //   console.log("onButtonClick :: webInterface is null");
    // }
}

// the root obj to be exposed to web
const jsInterface = {
    webToMobile(event) {
      console.log("event ::"+event);
  },
  setMobileInterface( webInterface ) {
    console.log("setMobileInterface :: before "+this.webInterface)


    setTimeout(() => {
      webInterface("mobile to Web 1")
    }, 2000)

    setTimeout(() => {
      webInterface("mobile to Web 2")
    }, 4000)
      // TODO
      // this.webInterface = webInterface
      // console.log("setMobileInterface :: after "+this.webInterface)
  }
}
export default class App extends React.Component {
  constructor(props) {
    super(props);

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
    //const uri = 'http://172.20.10.11:3000'; // on Work Mac connected to public wifi and no proxy in emulator
    //const uri = 'https://638082b614b0af602674e1bf--capable-lollipop-05625d.netlify.app/';
    return (
      <SafeAreaView style={styles.container}>
        <Button style={styles.button} title='Test Button' onPress={() => {
          onButtonClick();
        }}/>
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
  button: {
    flex: 1,
  },
});




