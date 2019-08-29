import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import Reader from './Reader';
import { Provider } from "react-redux";
import store from '../store';

it('renders without crashing', async () => {
  await act(async () => {
    const div = document.createElement('div');
    ReactDOM.render(<Provider store={store}><Reader /></Provider>, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
