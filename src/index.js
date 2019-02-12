import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router'
import { Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/index";
import 'typeface-roboto-material';
import Reader from './components/Reader';
import {unregister} from './registerServiceWorker';
import GA from './utils/GA';
import history from './utils/History';
import './i18n';

ReactDOM.render(
    <Provider store={store}>
        <Router history={history}>
            <Route path="/:path?" component={Reader} />
        </Router>
    </Provider>,
    document.getElementById('root')
);
unregister();

GA.sendAppView('MainView');