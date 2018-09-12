import React from 'react';
import ReactDOM from 'react-dom';
import 'typeface-roboto';
import './index.scss';
import Reader from './components/Reader';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Reader />, document.getElementById('root'));
registerServiceWorker();
