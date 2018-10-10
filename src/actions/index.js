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
            }
            resolve(feed);
        });
    });
}

export const log = msg => ({ type: types.LOG, payload: msg });
export const initState = callback => dispatch => {
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
    dispatch(log("Start update feed: " + channel.url));
    fetchFeed(channel.url).then(feed => {
        dispatch(log("Update successed: " + channel.url));
        dispatch(receiveFeed(feed, id));
        if (callback) {
            callback();
        }
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
export const setDefaultState = () => ({ type: types.SET_DEFAULT_STATE });

export const connectBackground = messageCallback => ({ type: types.CONNECT_BACKGROUND, payload: messageCallback });
export const setupBackgroundConnection = () => (dispatch, getState) => {
    dispatch(connectBackground(msg => {
        if (msg.type === types.BACKGROUND_UPDATE_CHANNEL) {
            dispatch(initState(() => {
                dispatch(log('Update from background ' + msg.channelId));
            }));
        }
    }));
}

export const setComponentState = (componentName, state) => ({ type: types.SET_COMPONENT_STATE, payload: { componentName, state }});