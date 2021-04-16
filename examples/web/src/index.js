// to polyfill proxy on Android 5 default browser (Chrome 38)
// Proxy has been supported on Chrome 49+ - https://caniuse.com/?search=Proxy
// it's not necessary to include this polyfill if targets to morden browers
import 'proxy-polyfill';
import 'core-js';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
