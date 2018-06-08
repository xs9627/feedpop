import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Reader from './components/Reader';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<Reader />, document.getElementById('root'));
registerServiceWorker();
