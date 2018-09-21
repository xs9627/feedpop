import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";
import store from "./store/index";
import 'typeface-roboto';
import './index.scss';
import Reader from './components/Reader';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
    <Provider store={store}>
        <Reader />
    </Provider>,
    document.getElementById('root')
);
registerServiceWorker();
