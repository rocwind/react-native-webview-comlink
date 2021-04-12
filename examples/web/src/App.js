/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Component } from 'react';
import { waitFor } from 'wait-ready';
import logo from './logo.svg';
import './App.css';

export const rpcReady = waitFor(() => window.MyJSInterface, { checkInterval: 200, timeout: 3000 });

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rpcStatus: 'checking...',
      userSelected: 'not started',
    };

    // detect rpc ready status
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
      this.onUserSelectedYes,
      this.onUserSelectedNo,
    );
  };

  onUserSelectedYes = () => {
    this.setState({ userSelected: 'YES' });
  };

  onUserSelectedNo = () => {
    this.setState({ userSelected: 'NO' });
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
