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
import {messageSW, Workbox} from "workbox-window";

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

console.log('toto0');

if ('serviceWorker' in navigator) {
    const wb = new Workbox(process.env.SITE_URL + '/sw.js');
    let registration;

    const showSkipWaitingPrompt = (event) => {
        console.log('UPDATE');
        wb.addEventListener('controlling', (event) => {
            console.log('RELOAD');
            // window.location.reload();
        });

        console.log(registration);
        console.log(registration.waiting);
        if (registration && registration.waiting) {
            console.log("messageSW");
            messageSW(registration.waiting, {type: 'SKIP_WAITING'});
            console.log("END messageSW");
        } else {
            console.log("NO REGISTRATION WAITING");
        }

        console.log('END UPDATE');
    };

    wb.addEventListener('waiting', showSkipWaitingPrompt);
    wb.addEventListener('externalwaiting', showSkipWaitingPrompt);

    console.log('REGISTER');
    wb.register().then((r) => registration = r).then(() => {
        console.log('END REGISTER');
    });
}
