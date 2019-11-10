/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import rpc, { rpcReady } from './rpc';


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rpcStatus: 'checking...',
      userSelected: 'not started',
    };

    // detect rpc ready status
    rpcReady().then(() => {
      this.setState({ rpcStatus: 'ready' });
    }).catch(() => {
      this.setState({ rpcStatus: 'failed' })
    })
  }

  handleClick = () => {
    rpc.alert('Web', 'Called by web page, please select', this.onUserSelectedYes, this.onUserSelectedNo);
  }
  handleError = () => {
    rpc.someMethodWithError().catch(err => alert(JSON.stringify(err)));
  }

  onUserSelectedYes = () => {
      this.setState({ userSelected: 'YES' });
  }

  onUserSelectedNo = () => {
      this.setState({ userSelected: 'NO' });
  }

  render() {
    const { userSelected, rpcStatus } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>{`rpc status: ${rpcStatus}`}</p>
          <p>{`selected in native: ${userSelected}`}</p>
          <a
            className="App-link"
            href="#"
            onClick={this.handleClick}
          >
            Call Native Alert
          </a>
          <a
            className="App-link"
            href="#"
            onClick={this.handleError}
          >
            Call Native With Error
          </a>
        </header>
      </div>
    );
  }
}

export default App;
