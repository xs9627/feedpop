import thunkMiddleware from 'redux-thunk'
import { createStore, applyMiddleware } from "redux";
import rootReducer from "../reducers/index";

const store = createStore(rootReducer, applyMiddleware(thunkMiddleware));
export default store;