/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';

// to polyfill proxy on Android 5 default browser (Chrome 38)
// Proxy has been supported on Chrome 49+ - https://caniuse.com/?search=Proxy
// it's not necessary to include this polyfill if targets to morden browers
import 'proxy-polyfill';
// to polyfill Object.assign and other ES2015 api that used by comlink
// it's not necessary to include this polyfill if targets to morden browers
import 'core-js';

// import { waitFor } from 'wait-ready';
import { waitFor } from 'wait-ready/lib/bundle'; // include the cjs es5 compatible bundle to work with Android 5 device
import logo from './logo.svg';
import './App.css';

console.log('app script loaded');
// detect rpc ready status by checking if window.MyJSInterface exists
// do check each 200 ms and timeout after 3s
export const rpcReady = waitFor(() => window.MyJSInterface, { checkInterval: 200, timeout: 3000 });

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rpcStatus: 'checking...',
      userSelected: 'not started',
    };
    console.log('app constructor');

    rpcReady
      .then(() => {
        this.setState({ rpcStatus: 'ready' });
      })
      .catch(() => {
        this.setState({ rpcStatus: 'failed' });
      });
  }

  handleClick = () => {
    window.MyJSInterface.alert(
      'Web',
      'Called by web page, please select',
      // callbacks can be handled
      () => this.setState({ userSelected: 'YES' }),
      () => this.setState({ userSelected: 'NO' }),
    );
  };

  render() {
    const { userSelected, rpcStatus } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>{`rpc status: ${rpcStatus}`}</p>
          <p>{`selected in native: ${userSelected}`}</p>
          <a className="App-link" href="#" onClick={this.handleClick}>
            Call Native Alert
          </a>
          <br />
          <a
            className="App-link"
            href="#"
            onClick={() => {
              // errors in native can be handled
              window.MyJSInterface.someMethodWithError().catch((err) => alert(err.message));
            }}
          >
            Call Native With Error
          </a>
          <br />
          <a
            className="App-link"
            href="#"
            onClick={() => {
              // checks for method exists or not directly
              if (window.MyJSInterface.someMethodThatNotExists) {
                window.MyJSInterface.someMethodThatNotExists().catch((err) => alert(err.message));
              } else {
                alert('method is not exist: someMethodThatNotExists()');
              }
            }}
          >
            Call Native Not Provided Method
          </a>
        </header>
      </div>
    );
  }
}

export default App;
