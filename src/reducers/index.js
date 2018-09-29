import * as types from "../constants/action-types";

const initialState = {
    channels: []
};
const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.ADD_CHANNEL:
            return { ...state, channels: [...state.channels, action.payload] };
        case types.SET_CHANNELS:
            return { ...state, channels: action.payload };
        case types.DELETE_CHANNELS:
            return { ...state, channels: state.channels.filter(c => c.id !== action.payload) };
        case types.SET_CHANNEL_SELECTOR_EDITMODE:
            return { ...state, channelSelectorEditMode: action.payload };
        case types.UPDATE_UNREAD_COUNT:
            return { ...state, 
                channels: state.channels.map(channel => ({ ...channel, unreadCount: action.payload.feedsCount[channel.id] })), 
                allUnreadCount: action.payload.allCount };
        case types.TOGGLE_CHANNEL_SELECTOR_EDITMODE:
            return { ...state, channelSelectorEditMode: !state.channelSelectorEditMode };
        default:
            return state;
    }
};
export default rootReducer;