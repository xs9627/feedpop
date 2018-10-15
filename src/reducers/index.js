import * as types from "../constants/action-types";
import ChromeUtil from "../utils/ChromeUtil";

const mergeFeed = (oldFeed, newFeed) => {
    let merged = newFeed.concat(oldFeed);
    for(let i = 0; i < merged.length; ++i) {
        for(let j = i+1; j < merged.length; ++j) {
            if((merged[i].isoDate && merged[i].isoDate === merged[j].isoDate) ||
                (merged[i].pubDate && merged[i].pubDate === merged[j].pubDate)) {
                merged[i].readerId = merged[j].readerId;
                merged.splice(j--, 1);
            }
        }
    }
    return merged;
}

const persistence = (state, updated) => {
    if (!state.silentPersistent) {
        updated.lastActiveTime = (new Date()).toISOString();
    }
    ChromeUtil.set(updated);
    return { ...state,  ...updated };
}

const initialState = {
    channels: [],
    settings: {},
    feedReadStatus: [],
    logs: [],
    ...defaultState,
    getComponentState(componentName, stateName) {
        return this[componentName] ? this[componentName][stateName] : null;
    },
}

const defaultState = {
    showContent: false,
    isShowActionMenu: false,
    currentFeedItemId: null,
    channelSelectorEditMode: false,
    channelSelector: {
        editOpen: false,
        isCheckingUrl: false,
        isUrlValid: true,
    }
}

const updateUnreadCount = (state, updated) => {
    const { feedReadStatus, feeds, channels } = { ...state, ...updated };
    let allCount = 0;
    let feedsCount = {};
    feeds.forEach(feedObj => {
        let count = feedObj.feed.items.length;
        if (feedReadStatus) {
            const statusObj = feedReadStatus.find(t => t.channelId === feedObj.id);
            if (statusObj) {
                feedObj.feed.items.forEach(f => {
                    if (statusObj.feedIds.some(id => id === f.readerId)) {
                        count--;
                    }
                });
            }
        }

        feedsCount[feedObj.id] = count;
        allCount += count;
    });
    return {
        channels: channels.map(channel => ({ ...channel, unreadCount: feedsCount[channel.id] })),
        allUnreadCount: allCount
    };
}

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.SET_SYNC_STATE: {
            return { ...state, ...action.state };
        }
        case types.LOG: {
            const updated = { logs: [...state.logs, { date: (new Date()).toLocaleString(), msg: action.payload }] };
            return persistence(state, updated)
        }
        case types.SET_DEFAULT_STATE: {
            const { lastActiveTime } = state;
            const lastActiveSpan = new Date() - new Date(lastActiveTime);
            if (lastActiveSpan > .1 * 60 * 1000) {
                const { currentChannelId, currentFeedItemId, showContent } = state;
                const showGoBack = showContent && lastActiveSpan <= .5 * 60 * 1000;
                const updated = { ...defaultState,
                    lastActiveState: { currentChannelId, currentFeedItemId, showContent },
                    readerMessageBar: showGoBack ? {
                        open: true,
                        mainActionName: 'GO',
                        mainActionType: types.GO_BACK_LAST_READ,
                        cloaseActionType: types.DELETE_LAST_READ,
                        message: 'Continue reading?',
                        autoHideDuration: 15000,
                    } : {
                        open: false,
                    }
                };
                if (state.channels.length > 0) {
                    updated.currentChannelId = state.channels[0].id;
                } else {
                    updated.currentChannelId = null;
                }
                return persistence(state, updated);
            } else {
                return state;
            }   
        }
        case types.SELECT_CHANNEL: {
            let id = action.id;
            if (!id) {
                id = state.channels[0].id;
            }
            const updated = { currentChannelId: id };
            return persistence(state, updated);
        }
        case types.ADD_CHANNEL_BEGIN: {
            return persistence(state, { channelSelector: { ...state.channelSelector, isCheckingUrl: true } });
        }
        case types.ADD_CHANNEL: {
            action.payload.id = require('uuid/v4')();
            const updated = { channels: [...state.channels, action.payload], isCheckingUrl: false, isUrlValid: true };
            if (updated.channels.length === 1) {
                updated.currentChannelId = action.payload.id;
            }
            return persistence(state, updated);
        }
        case types.ADD_CHANNEL_ERROR: {
            return persistence(state, { channelSelector: { ...state.channelSelector, isCheckingUrl: false, isUrlValid: false, urlErrorMessage: action.payload } });
        }
        case types.SET_CHANNELS:
            return { ...state, channels: action.payload };
        case types.DELETE_CHANNELS: {
            const updated = {
                channels: state.channels.filter(c => c.id !== action.payload),
                feeds: state.feeds.filter(f => f.id !== action.payload),
                feedReadStatus: state.feedReadStatus.filter(rs => rs.channelId !== action.payload),
            };
            if (state.currentChannelId === action.payload) {
                if (updated.channels.length > 0) {
                    updated.currentChannelId = updated.channels[0].id;
                } else {
                    updated.currentChannelId = null;
                }
            }
            return persistence(state, { ...updated, ...updateUnreadCount(state, updated) });
        }
        case types.SET_CHANNEL_SELECTOR_EDITMODE: {
            const updated = { channelSelectorEditMode: action.payload };
            return persistence(state, updated);
        }
        case types.RECEIVE_FEED: {
            const feed = action.payload.feed;
            if (state.feeds) {
                const oldFeedObj = state.feeds.find(f => f.id === action.payload.id);
                if (oldFeedObj) {
                    let mergedItems = mergeFeed(oldFeedObj.feed.items, feed.items);
                    feed.items = mergedItems;
                }
            }
            const uuidv4 = require('uuid/v4');
            feed.items.forEach(item => {
                if (!item.readerId) {
                    item.readerId = uuidv4();
                }
            });
            const feedObj = {id: action.payload.id, feed: feed};
            const updated = { feeds: state.feeds ? [ ...state.feeds.filter(f => f.id !== action.payload.id), feedObj ] : [feedObj] };
            return persistence(state, { ...updated, ...updateUnreadCount(state, updated) });
        }
        case types.SET_FEED_READ_STATUS: {
            const feedReadStatus = state.feedReadStatus.some(s => s.channelId === action.payload.channelId) ?
                state.feedReadStatus.map(s => s.channelId === action.payload.channelId ? { ...s, feedIds: [...s.feedIds, action.payload.feedId] } : s) :
                [...state.feedReadStatus, { channelId: action.payload.channelId, feedIds: [action.payload.feedId]}];
            return persistence(state, { feedReadStatus, ...updateUnreadCount(state, { feedReadStatus }) });
        }
        case types.OPEN_FEED:
            return persistence(state, { currentFeedItemId: action.payload, showContent: true });
        case types.CLOSE_FEED:
            return persistence(state, { showContent: false });
        case types.OPEN_ACTION_MENU: {
            const updated = { isShowActionMenu: true, actionName: action.payload };
            return persistence(state, updated);
        }
        case types.CLOSE_ACTION_MENU: {
            const updated = { isShowActionMenu: false };
            return persistence(state, updated);
        }
        case types.TOGGLE_CHANNEL_SELECTOR_EDITMODE: {
            const updated = { channelSelectorEditMode: !state.channelSelectorEditMode };
            return persistence(state, updated);
        }
        case types.SET_SETTINGS: {
            const updated = { settings: { ...state.settings, ...action.payload } };
            return persistence(state, updated);
        }
        case types.CONNECT_BACKGROUND: {
            ChromeUtil.connect(state, action.payload);
            return state;
        }
        case types.CLEAN_CACHE: {
            const updated = { 
                logs: [], 
                showContent: false, 
                feeds: [], 
                feedReadStatus: [],
                allUnreadCount: 0,
                channels: state.channels.map(c => ({ ...c, unreadCount: 0 }))
            };
            return persistence(state, updated);
        }
        case types.UPDATE_LAST_ACTIVE_TIME: {
            return persistence(state, {});
        }
        case types.GO_BACK_LAST_READ:
            return persistence(state, { ...state.lastActiveState, lastActiveState: {} });
        case types.DELETE_LAST_READ:
            return persistence(state, { lastActiveState: {} });
        case types.CLOSE_MESSAGE_BAR:
            return persistence(state, { readerMessageBar: { open: false } });
        case types.SET_COMPONENT_STATE: {
            let newState;
            if (typeof action.payload.state === "function") {
                newState = action.payload.state(state[action.payload.componentName] || {});
            } else {
                newState = action.payload.state;
            }
            const updated = { [action.payload.componentName]: state[action.payload.componentName] ? { ...state[action.payload.componentName], ...newState } :  { ...newState } };
            return persistence(state, updated);
        }
        default:
            return state;
    }
};
export default rootReducer;