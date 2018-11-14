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

const getChannelFeeds = channelId => {
    return ChromeUtil.get('f-' + channelId);
}

const saveChannelFeeds = (channelId, feeds) => {
    return ChromeUtil.set({ ['f-' + channelId]: feeds });
}

export const log = msg => ({ type: types.LOG, payload: msg });
export const syncState = () => dispatch => {
    return ChromeUtil.get('state').then(state => {
        //console.log(state);
        dispatch(setSyncState(state));
        return state;
    });
}
export const selectChannel = id => ({ type: types.SELECT_CHANNEL, id: id });
export const setSyncState = state => ({type: types.SET_SYNC_STATE, state: state });
export const setDefaultState = () => ({ type: types.SET_DEFAULT_STATE });
export const addChannel = url => async (dispatch, getState) => {
    dispatch({ type: types.ADD_CHANNEL_BEGIN });
    try {
        const feeds = await fetchFeed(url);
        const channel = { url, name: feeds.title };
        dispatch({ type: types.ADD_CHANNEL, payload: { channel, feeds } });
        await saveChannelFeeds(channel.id, feeds);
        dispatch({ type: types.ADD_CHANNEL_END });
    }
    catch (reason) {
        dispatch({ type: types.ADD_CHANNEL_ERROR, payload: reason });
    }
};
export const editChannel = channel => async (dispatch, getState) => {
    dispatch({ type: types.ADD_CHANNEL_BEGIN });
    let feeds;
    try {
        feeds = await fetchFeed(channel.url);
    }
    catch (reason) {
        dispatch({ type: types.ADD_CHANNEL_ERROR, payload: reason });
        return;
    }
    const oldFeeds = await getChannelFeeds(channel.id);
    dispatch({ type: types.UPDATE_CHANNEL_FEED, payload: { oldFeeds, feeds, channelId: channel.id } });
    dispatch({ type: types.EDIT_CHANNEL, payload: channel });
    await saveChannelFeeds(channel.id, getState().mergedFeed);
    dispatch({ type: types.ADD_CHANNEL_END });
}
export const setCurrentFeeds = () => async (dispatch, getState) => {
    dispatch({ type: types.SET_CURRENT_FEEDS_BEGIN });
    const feeds = await getChannelFeeds(getState().currentChannelId);
    dispatch({ type: types.SET_CURRENT_FEEDS, payload: feeds });
}
export const setChannels = channels => ({ type: types.SET_CHANNELS, payload: channels });
export const deleteChannel = id => async (dispatch, getState) => {
    dispatch({ type: types.DELETE_CHANNELS, payload: id });
    if (getState().currentChannelId && getState().currentChannelId !== id) {
        await dispatch(setCurrentFeeds()); 
    }
}
export const moveChannel = (from, to) => ({ type: types.MOVE_CHANNEL, payload: { from, to } });
export const updateChannelFeed = id => async (dispatch, getState) => {
    const channel = getState().channels.find(c => c.id === id);
    let feeds;
    try {
        feeds = await fetchFeed(channel.url);
    }
    catch (reason) {
        console.log(reason);
        return;
    }
    const oldFeeds = await getChannelFeeds(id);
    dispatch({ type: types.UPDATE_CHANNEL_FEED, payload: { oldFeeds, feeds, channelId: id } });
    await saveChannelFeeds(id, getState().mergedFeed);
}
export const setFeedReadStatus = (channelId, feedId) => async (dispatch, getState) => {
    dispatch({ type: types.SET_FEED_READ_STATUS, payload: { channelId, feedId } });
    await saveChannelFeeds(channelId, getState().currentFeeds);
}
export const openFeed = feedItemId => ({ type: types.OPEN_FEED, payload: feedItemId });
export const closeFeed = () => ({ type: types.CLOSE_FEED });
export const scrollFeedContent = top => ({ type: types.SCROLL_FEED_CONTENT, payload: top });

export const openActionMenu = actionName => ({ type: types.OPEN_ACTION_MENU, payload: actionName });
export const closeActionMenu = () => ({ type: types.CLOSE_ACTION_MENU });
export const setChannelSelectorEditMode = isEditMode => ({ type: types.SET_CHANNEL_SELECTOR_EDITMODE, payload: isEditMode });
export const toggleChannelSelectorEditMode = () => ({ type: types.TOGGLE_CHANNEL_SELECTOR_EDITMODE });

export const setSettins = settings => ({ type: types.SET_SETTINGS, payload: settings });

export const connectBackground = messageCallback => ({ type: types.CONNECT_BACKGROUND, payload: messageCallback });
export const setupBackgroundConnection = () => (dispatch, getState) => {
    dispatch(connectBackground(msg => {
        if (msg.type === types.BACKGROUND_UPDATE_CHANNEL) {
            dispatch(setCurrentFeeds()).then(() => {
                dispatch(log('Update reader by background'));
            });
        }
    }));
}
export const cleanCache = () => async (dispatch, getState) => {
    dispatch({ type: types.CLEAN_CACHE });
    await ChromeUtil.clear();
    await ChromeUtil.set({ state: getState() });
};
export const updateLastActiveTime = () => ({ type: types.UPDATE_LAST_ACTIVE_TIME });
export const closeMessageBar = () => ({ type: types.CLOSE_MESSAGE_BAR });

export const triggerAction = type => async (dispatch, getState) => {
    switch(type) {
        case types.GO_BACK_LAST_READ: {
            dispatch({ type });
            await dispatch(setCurrentFeeds());
            break;
        }
        default:
            dispatch({ type: type });
    };
}
export const setComponentState = (componentName, state) => ({ type: types.SET_COMPONENT_STATE, payload: { componentName, state }});