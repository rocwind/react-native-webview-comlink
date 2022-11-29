/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from 'react';

import logo from './logo.svg';
import './App.css';

console.log('app script loaded');

const onMobileToWebEvent = (data) => {
  // TODO
  console.log("onMobileToWebEvent :: data :"+data);

}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rpcStatus: window.CoreJSInterface ? 'ready' : 'failed',
      userSelected: 'not started',
    };
    console.log('app constructor');
    window.CoreJSInterface.setMobileInterface( onMobileToWebEvent )
  }

  handleClick = () => {
    window.CoreJSInterface.webToMobile("Testing My Event");
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
              console.log("perf now: "+start)
              window.CoreJSInterface.someMethodWithError().catch((err) =>
              console.log("someMethodWithError is invalid ")
                //alert(`${err.message} [${err.code}]\nperf: ${(perf.now() - start).toFixed(2)}`),
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
              if (window.CoreJSInterface.someMethodThatNotExists) {
                window.CoreJSInterface.someMethodThatNotExists().catch((err) => 
                    //alert(err.message)
                    console.log(err.message)
                  );
              } else {
                console.log("method is not exist: someMethodThatNotExists()")
                //alert('method is not exist: someMethodThatNotExists()');
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
