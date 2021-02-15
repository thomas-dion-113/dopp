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
import './css/releve.css';
import './css/item.css';

import App from './components/App';

ReactDOM.render(<Router><App /></Router>, document.getElementById('root'));