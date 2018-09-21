import { ADD_CHANNEL, SET_CHANNELS, DELETE_CHANNELS } from "../constants/action-types";

const initialState = {
    channels: []
};
const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_CHANNEL:
            return { ...state, channels: [...state.channels, action.payload] };
        case SET_CHANNELS:
            return { ...state, channels: action.payload };
        case DELETE_CHANNELS:
            return { ...state, channels: state.channels.filter(c => c.id !== action.payload) };
        default:
            return state;
    }
};
export default rootReducer;