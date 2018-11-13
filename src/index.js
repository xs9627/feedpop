import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import store from "./store/index";
import 'typeface-roboto-material';
import Reader from './components/Reader';
import {unregister} from './registerServiceWorker';

ReactDOM.render(
    <Provider store={store}>
        <Reader />
    </Provider>,
    document.getElementById('root')
);
unregister();
