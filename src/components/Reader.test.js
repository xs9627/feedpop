import React from 'react';
import ReactDOM from 'react-dom';
import Reader from './Reader';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<Reader />, div);
  ReactDOM.unmountComponentAtNode(div);
});
