import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter as Router, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/index";
import 'typeface-roboto-material';
import Reader from './components/Reader';
import {unregister} from './registerServiceWorker';
import GA from './utils/GA';
import './i18n';

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <Route path="/:content?" component={Reader} />
        </Router>
    </Provider>,
    document.getElementById('root')
);
unregister();

GA.sendAppView('MainView');