/* global RSSParser */
import * as types from "../constants/action-types";
import ChromeUtil from '../utils/ChromeUtil';

const fetchFeed = url => {
    return new Promise((resolve, reject) => {
        let parser = new RSSParser();
        parser.parseURL(url, (err, feed) => {
            if(err) {
                reject(err);
            }
            resolve(feed);
        });
    });
}

export const initState = callback => (dispatch) => {
    ChromeUtil.get(null).then(state => {
        console.log(state); // TODO for test
        dispatch(setInitState(state));
        if (callback) {
            callback(state);
        }
    });
}
export const selectChannel = id => ({ type: types.SELECT_CHANNEL, id: id });
export const setInitState = state => ({type: types.SET_INIT_STATE, state: state });
export const addChannel = channel => ({ type: types.ADD_CHANNEL, payload: channel });
export const setChannels = channels => ({ type: types.SET_CHANNELS, payload: channels });
export const deleteChannel = id => ({ type: types.DELETE_CHANNELS, payload: id });
export const receiveFeed = (feed, id) => ({ type: types.RECEIVE_FEED, payload: { feed, id } });
export const updateChannelFeed = (id, callback) => (dispatch, getState) => {
    const channel = getState().channels.find(c => c.id === id);
    fetchFeed(channel.url).then(feed => {
        dispatch(receiveFeed(feed, id));
        dispatch(updateUnreadCount());
        if (callback) {
            callback();
        }
    });
}
export const setFeedReadStatus = (channelId, feedId) => ({ type: types.SET_FEED_READ_STATUS, payload: { channelId, feedId } });
export const openFeed = feed => ({ type: types.OPEN_FEED, payload: feed });
export const closeFeed = () => ({ type: types.CLOSE_FEED })
export const updateUnreadCount = () => ({ type: types.UPDATE_UNREAD_COUNT });

export const openActionMenu = actionName => ({ type: types.OPEN_ACTION_MENU, payload: actionName });
export const closeActionMenu = () => ({ type: types.CLOSE_ACTION_MENU });
export const setChannelSelectorEditMode = isEditMode => ({ type: types.SET_CHANNEL_SELECTOR_EDITMODE, payload: isEditMode });
export const toggleChannelSelectorEditMode = () => ({ type: types.TOGGLE_CHANNEL_SELECTOR_EDITMODE });