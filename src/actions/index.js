/* global RSSParser */
import 'rss-parser/dist/rss-parser.min.js';
import * as types from "../constants/action-types";
import ChromeUtil from '../utils/ChromeUtil';

const fetchFeed = url => {
    return new Promise((resolve, reject) => {
        let parser = new RSSParser();
        parser.parseURL(url, (err, feed) => {
            if(err) {
                reject(err);
            } else {
                resolve(feed);
            }
        });
    });
}

export const log = msg => ({ type: types.LOG, payload: msg });
export const syncState = () => dispatch => {
    return ChromeUtil.get('state').then(state => {
        console.log(state);
        dispatch(setSyncState(state));
        return state;
    });
}
export const selectChannel = id => ({ type: types.SELECT_CHANNEL, id: id });
export const setSyncState = state => ({type: types.SET_SYNC_STATE, state: state });
export const setDefaultState = () => ({ type: types.SET_DEFAULT_STATE });
export const addChannel = url => (dispatch, getState) => {
    dispatch({ type: types.ADD_CHANNEL_BEGIN });
    return fetchFeed(url).then(feed => {
        const channel = { url, name: feed.title };
        dispatch({ type: types.ADD_CHANNEL, payload: channel });
        dispatch(receiveFeed(feed, channel.id));
    }, (reason) => {
        dispatch({ type: types.ADD_CHANNEL_ERROR, payload: reason });
    });
};
export const setChannels = channels => ({ type: types.SET_CHANNELS, payload: channels });
export const deleteChannel = id => ({ type: types.DELETE_CHANNELS, payload: id });
export const moveChannel = (from, to) => ({ type: types.MOVE_CHANNEL, payload: { from, to } });
export const receiveFeed = (feed, id) => ({ type: types.RECEIVE_FEED, payload: { feed, id } });
export const updateChannelFeed = id => (dispatch, getState) => {
    const channel = getState().channels.find(c => c.id === id);
    return fetchFeed(channel.url).then(feed => {
        return dispatch(syncState()).then(() => {
            dispatch(receiveFeed(feed, id));
        });
    }, (reason) => {
        console.log(reason);
    });
}
export const setFeedReadStatus = (channelId, feedId) => ({ type: types.SET_FEED_READ_STATUS, payload: { channelId, feedId } });
export const openFeed = feedItemId => ({ type: types.OPEN_FEED, payload: feedItemId });
export const closeFeed = () => ({ type: types.CLOSE_FEED });

export const openActionMenu = actionName => ({ type: types.OPEN_ACTION_MENU, payload: actionName });
export const closeActionMenu = () => ({ type: types.CLOSE_ACTION_MENU });
export const setChannelSelectorEditMode = isEditMode => ({ type: types.SET_CHANNEL_SELECTOR_EDITMODE, payload: isEditMode });
export const toggleChannelSelectorEditMode = () => ({ type: types.TOGGLE_CHANNEL_SELECTOR_EDITMODE });

export const setSettins = settings => ({ type: types.SET_SETTINGS, payload: settings });

export const connectBackground = messageCallback => ({ type: types.CONNECT_BACKGROUND, payload: messageCallback });
export const setupBackgroundConnection = () => (dispatch, getState) => {
    dispatch(connectBackground(msg => {
        if (msg.type === types.BACKGROUND_UPDATE_CHANNEL) {
            dispatch(syncState()).then(() => {
                dispatch(log('Update reader by background'));
            });
        }
    }));
}
export const cleanCache = () => ({ type: types.CLEAN_CACHE });
export const updateLastActiveTime = () => ({ type: types.UPDATE_LAST_ACTIVE_TIME });
export const closeMessageBar = () => ({ type: types.CLOSE_MESSAGE_BAR });

export const triggerAction = type => ({ type: type });
export const setComponentState = (componentName, state) => ({ type: types.SET_COMPONENT_STATE, payload: { componentName, state }});