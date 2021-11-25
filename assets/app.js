import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import './css/app.css';
import './css/home.css';
import './css/nav.css';
import './css/form.css';
import './css/pluvio.css';
import './css/item.css';
import './css/daterangepicker.css';
import './css/stats.css';

import App from './components/App';

ReactDOM.render(<Router><App /></Router>, document.getElementById('root'));

// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', function() {
//         navigator.serviceWorker.register(process.env.SITE_URL + '/sw.js').then(function(registration) {
//             console.log('Worker registration successful', registration.scope);
//         }, function(err) {
//             console.log('Worker registration failed', err);
//         }).catch(function(err) {
//             console.log(err);
//         });
//     });
// } else {
//     console.log('Service Worker is not supported by browser.');
// }