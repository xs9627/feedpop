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

const updateSingleChannelFeed = async (id, dispatch, getState) => {
    dispatch({type: types.UPDATE_CHANNEL_FEED_BEGIN});
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

const getChannelFeeds = channelId => {
    return ChromeUtil.get('f-' + channelId);
}

const saveChannelFeeds = (channelId, feeds) => {
    return ChromeUtil.set({ ['f-' + channelId]: feeds });
}

const mergeRecentReadStatus = async (readStatus) => {
    const recentReadStatus = await ChromeUtil.getSync('recentReadStaus') || [];
    const newReadStatus = [...readStatus, ...(recentReadStatus.filter(rss => 
        !readStatus.find(crs => crs.channelId === rss.channelId && crs.link === rss.link)))].slice(0, 100)
    await ChromeUtil.setSync({recentReadStaus: newReadStatus});
}

export const log = msg => ({ type: types.LOG, payload: msg });
export const syncState = isloadConfig => async dispatch => {
    const state = await ChromeUtil.get('state');
    dispatch(setSyncState(state));
    if (isloadConfig) {
        await dispatch(loadConfig());
    }
}
export const selectChannel = id => ({ type: types.SELECT_CHANNEL, id: id });
export const setSyncState = state => ({type: types.SET_SYNC_STATE, state});
export const setDefaultState = () => ({ type: types.SET_DEFAULT_STATE });
export const addChannel = url => async (dispatch, getState) => {
    dispatch({ type: types.ADD_CHANNEL_BEGIN });
    try {
        const feeds = await fetchFeed(url);
        const channel = { url, name: feeds.title };
        dispatch({ type: types.ADD_CHANNEL, payload: { channel, feeds } });
        await dispatch(setCurrentFeeds()); 
        await saveChannelFeeds(channel.id, getState().mergedFeed);
        dispatch({ type: types.ADD_CHANNEL_END });
    }
    catch (reason) {
        console.log(reason);
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
    dispatch({ type: types.SET_CURRENT_FEEDS });
    if (getState().historyFeedsLoaded) {
        await dispatch(loadHistoryFeeds()); 
    }
}
export const loadHistoryFeeds = () => async (dispatch, getState) => {
    const feeds = await getChannelFeeds(getState().currentChannelId);
    dispatch({ type: types.LOAD_HISTORY_FEEDS, payload: feeds });
}
export const setChannels = channels => ({ type: types.SET_CHANNELS, payload: channels });
export const deleteChannel = id => async (dispatch, getState) => {
    dispatch({ type: types.DELETE_CHANNELS, payload: id });
    await dispatch(setCurrentFeeds());
}
export const moveChannel = order => ({ type: types.MOVE_CHANNEL, payload: order });
export const updateChannelFeed = id => async (dispatch, getState) => {
    dispatch({type: types.UPDATE_CHANNEL_FEED_BEGIN});
    await updateSingleChannelFeed(id, dispatch, getState);
    dispatch({type: types.UPDATE_CHANNEL_FEED_END});
}
export const updateAllChannelsFeed = () => async (dispatch, getState) => {
    dispatch({type: types.UPDATE_CHANNEL_FEED_BEGIN});
    const promises = [];
    getState().channels.forEach(channel => {
        promises.push(updateSingleChannelFeed(channel.id, dispatch, getState));
    });
    await Promise.all(promises);
    await dispatch(setCurrentFeeds());
    dispatch({type: types.UPDATE_CHANNEL_FEED_END});
}
export const setFeedReadStatus = (channelId, feedId, isRead = true) => async (dispatch, getState) => {
    const recentChannelFeed = getState().recentFeeds.find(rf => rf.channelId === channelId);
    let feedItem = recentChannelFeed && recentChannelFeed.feed.items.find(i => i.readerId === feedId);
    let needUpdateHistoryReadStatus, historyFeeds;
    if (feedItem) {
        if (feedItem.isRead === isRead) {
            return;
        }
    } else {
        needUpdateHistoryReadStatus = true;
        historyFeeds = await getChannelFeeds(channelId);
        feedItem = historyFeeds.items.find(i => i.readerId === feedId);
        if (!feedItem || feedItem.isRead === isRead) {
            return;
        }
    }

    dispatch({ type: types.SET_FEED_READ_STATUS, payload: { channelId, feedId: feedItem.readerId, isRead, needUpdateHistoryReadStatus, historyFeeds } });
    //await saveChannelFeeds(channelId, getState().currentFeeds);
    if (needUpdateHistoryReadStatus) {
        // dispatch({ type: types.SET_HISTORY_FEED_READ_STATUS, payload: { historyFeeds, feedId: feedItem.readerId, isRead }});
        await saveChannelFeeds(channelId, getState().mergedFeed);
    }
}
export const markAllAsRead = channelId => async (dispatch, getState) => {
    const recentChannelFeed = getState().recentFeeds.find(rf => rf.channelId === channelId) || [];
    const channelReadStatus = recentChannelFeed.feed.items.filter(i => !i.isRead)
        .map(i => ({channelId, link: i.link, isRead: true}));
    let channelHistoryReadStatus = [];
    
    dispatch({ type: types.MARK_ALL_AS_READ, payload: { channelId } });
    if (getState().tmp.needUpdateHistoryReadStatus) {
        channelHistoryReadStatus = await dispatch(markAllHistoryAsRead(channelId));
    }
    await mergeRecentReadStatus([...channelReadStatus, ...channelHistoryReadStatus]);
};
export const markAllHistoryAsRead = channelId => async (dispatch, getState) => {
    const historyFeeds = await getChannelFeeds(channelId);
    if (historyFeeds) {
        const channelReadStatus = historyFeeds.items.filter(i => !i.isRead).map(i => ({channelId, link: i.link, isRead: true}));
        dispatch({ type: types.MARK_History_ALL_AS_READ, payload: { historyFeeds } });
        await saveChannelFeeds(channelId, getState().mergedFeed);
        return channelReadStatus;
    }
};
export const markAllChannelAsRead = () => async (dispatch, getState) => {
    getState().channels.forEach(async (channel) => {
        await dispatch(markAllAsRead(channel.id));
    });
}
export const loadSyncReadStatus = () => async (dispatch, getState) => {
    const recentReadStatus = await ChromeUtil.getSync('recentReadStaus');
    recentReadStatus && recentReadStatus.forEach(async rrs => {
        const {channelId, link, isRead} = rrs;
        await dispatch(setFeedReadStatus(channelId, null, isRead, true, link));
    });
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
    dispatch(connectBackground(async msg => {
        if (msg.type === types.BACKGROUND_UPDATE_CHANNEL) {
            const state = await ChromeUtil.get('state');
            dispatch({ type: types.SYNC_BACKGROUND_UPDATE, payload: { state } });
            await dispatch(setCurrentFeeds());
            const {showContent, currentChannelId, currentFeedItemId, currentFeeds} = getState();
            if (showContent && currentFeeds.items.find(i => (i.readerId === currentFeedItemId && !i.isRead))) {
                await dispatch(setFeedReadStatus(currentChannelId, currentFeedItemId, true));
                dispatch(log('Fix sync loss of read status'));
            }
            // dispatch(log('Update reader by background'));
        }
    }));
}
export const cleanCache = () => async (dispatch, getState) => {
    dispatch({ type: types.CLEAN_CACHE });
    await ChromeUtil.clear();
    dispatch(updateLastActiveTime()); //Reset state to storage
};
export const updateLastActiveTime = () => ({ type: types.UPDATE_LAST_ACTIVE_TIME });
export const closeMessageBar = () => ({ type: types.CLOSE_MESSAGE_BAR });
export const toggleTourOpen = option => ({ type: types.TOGGLE_TOUR_OPEN, payload: option });
export const toggleShowRecentUpdate = showRecentUpdate => async (dispatch, getState) => {
    dispatch({ type: types.TOGGLE_SHOW_RECENT_UPDATE, payload: showRecentUpdate });
    await dispatch(setCurrentFeeds());
};
export const saveConfig = () => async (dispatch, getState) => {
    const config = await ChromeUtil.getSync('config');
    if (config && config.configSyncTime !== getState().configSyncTime) {
        // Config update by other end, ignore current change
        return;
    }
    dispatch({type: types.SAVE_CONFIG, payload: config});
    const {newConfig} = getState().tmp;
    newConfig && await ChromeUtil.setSync({config: newConfig});
};
export const saveReadStatus = () => async (dispatch, getState) => {
    const readStatus = await ChromeUtil.getSync('readStatus');
    if (readStatus && readStatus.configSyncTime !== getState().readStatusSyncTime) {
        // Config update by other end, ignore current change
        return;
    }
    dispatch({type: types.SAVE_READ_STATUS, payload: readStatus});
    const {newReadStatus} = getState().tmp;
    newReadStatus && await ChromeUtil.setSync({readStatus: newReadStatus});
};
export const loadConfig = () => async (dispatch, getState) => {
    const {configSyncTime} = getState();
    const config = await ChromeUtil.getSync('config');
    if (config && config.configSyncTime !== configSyncTime) {
        dispatch({type: types.LOAD_CONFIG, payload: config});
    }
    //await dispatch(loadSyncReadStatus());
}

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