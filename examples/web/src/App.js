/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';

import logo from './logo.svg';
import './App.css';

console.log('app script loaded');

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rpcStatus: window.MyJSInterface ? 'ready' : 'failed',
      userSelected: 'not started',
    };
    console.log('app constructor');
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
              const perf = window.performance ? performance : Date;
              const start = perf.now();
              window.MyJSInterface.someMethodWithError().catch((err) =>
                alert(`${err.message} [${err.code}]\nperf: ${(perf.now() - start).toFixed(2)}`),
              );
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
