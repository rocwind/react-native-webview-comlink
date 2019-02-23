import React from 'react';
import { StyleSheet, WebView, Alert } from 'react-native';
import { withComlinkExpose } from './lib/native';

export default class App extends React.Component {
  constructor(props) {
    super(props);

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
    };

    this.WebViewComponent = withComlinkExpose(rootObj)(WebView);
  }

  render() {
    const uri = 'http://localhost:3000';
    return (
      <this.WebViewComponent
        style={styles.container}
        source={{ uri }}
        >
      </this.WebViewComponent>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
