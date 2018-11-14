import * as types from "../constants/action-types";
import ChromeUtil from "../utils/ChromeUtil";

const mergeFeed = (oldFeed, newFeed) => {
    const uuidv4 = require('uuid/v4');
    newFeed.items.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
    if (oldFeed) {
        const newItems = newFeed.items;
        const mergedItems = oldFeed.items;
        for(let i = newItems.length - 1; i >= 0; i--) {
            if (newItems[i].isoDate) {
                for(let j = 0; j < mergedItems.length; j++) {
                    const diff = new Date(newItems[i].isoDate) - new Date(mergedItems[j].isoDate);
                    if (diff === 0) {
                        break;
                    } else if (diff > 0 || j === (mergedItems.length - 1)) {
                        newItems[i].readerId = uuidv4();
                        mergedItems.splice(j, 0, newItems[i]);
                        break;
                    }
                }
            } else {
                if (!mergedItems.some(o => o.title === newItems[i].title)) {
                    mergedItems.splice(0, 0, newItems[i]);
                }
            }
        }
        newFeed.items = mergedItems;
    } else {
        newFeed.items.forEach(item => {
            if (!item.readerId) {
                item.readerId = uuidv4();
            }
        });
    }
}

const persistence = (state, updated) => {
    const newState = { ...state,  ...updated };
    const { getComponentState, currentFeeds, mergedFeed, version, ...persistenceState } = newState;
    ChromeUtil.set({ state: persistenceState });
    ChromeUtil.setUnreadCount(newState.allUnreadCount);
    return newState;
}

const initialState = {
    channels: [],
    theme: 'light',
    maxFeedsCount: 500,
    source: 'https://github.com/xs9627/rss-reader',
    version: ChromeUtil.getVersion(),
    feedReadStatus: [],
    logs: [],
    allUnreadCount: 0,
    ...defaultState,
    getComponentState(componentName, stateName) {
        return this[componentName] ? this[componentName][stateName] : null;
    },
}

const defaultState = {
    showContent: false,
    feedContentTop: 0,
    isShowActionMenu: false,
    currentFeedItemId: null,
    channelSelectorEditMode: false,
    channelSelector: {
        editOpen: false,
        isCheckingUrl: false,
        isUrlInvalid: false,
    }
}

const updateUnreadCount = (feedReadStatus, feeds, channels, channelId) => {
    let count = feeds.items.length;
    if (feedReadStatus) {
        const statusObj = feedReadStatus.find(t => t.channelId === channelId);
        if (statusObj) {
            feeds.items.forEach(f => {
                if (statusObj.feedIds.some(id => id === f.readerId)) {
                    count--;
                }
            });
        }
    }
    const updatedChannels = channels.map(channel => channel.id === channelId ? { ...channel, unreadCount: count } : channel);
    return {
        channels: updatedChannels,
        allUnreadCount: updatedChannels.reduce((r, a) => (r + a.unreadCount), 0)
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
                const { currentChannelId, currentFeedItemId, showContent, feedContentTop } = state;
                const showGoBack = showContent && lastActiveSpan <= .5 * 60 * 1000;
                const updated = { ...defaultState,
                    lastActiveState: { currentChannelId, currentFeedItemId, showContent, feedContentTop },
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
            const { channel, feeds } = action.payload;
            channel.id = require('uuid/v4')();
            channel.unreadCount = feeds.items.length;
            const updated = { channels: [...state.channels, channel], allUnreadCount: (state.allUnreadCount || 0) + channel.unreadCount };
            feeds.items.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
            const uuidv4 = require('uuid/v4');
            feeds.items.forEach(item => {
                if (!item.readerId) {
                    item.readerId = uuidv4();
                }
            });
            if (updated.channels.length === 1) {
                updated.currentChannelId = channel.id;
                updated.currentFeeds = feeds;
            }
            return persistence(state, updated);
        }
        case types.EDIT_CHANNEL: {
            const channel = action.payload;
            return persistence(state, { channels: state.channels.map(c => c.id === channel.id ? { ...c, ...channel } : c) });
        }
        case types.ADD_CHANNEL_END: {
            return persistence(state, { channelSelector: { ...state.channelSelector, isCheckingUrl: false, isUrlInvalid: false, editOpen: false } });
        }
        case types.ADD_CHANNEL_ERROR: {
            return persistence(state, { channelSelector: { ...state.channelSelector, isCheckingUrl: false, isUrlInvalid: true, urlErrorMessage: action.payload } });
        }
        case types.SET_CURRENT_FEEDS_BEGIN: {
            return { ...state, currentFeeds: null };
        }
        case types.SET_CURRENT_FEEDS: {
            return { ...state, currentFeeds: action.payload };
        }
        case types.SET_CHANNELS:
            return { ...state, channels: action.payload };
        case types.DELETE_CHANNELS: {
            const updated = {
                channels: state.channels.filter(c => c.id !== action.payload),
                feedReadStatus: state.feedReadStatus.filter(rs => rs.channelId !== action.payload),
            };
            if (state.currentChannelId === action.payload) {
                updated.currentFeeds = null;
                if (updated.channels.length > 0) {
                    updated.currentChannelId = updated.channels[0].id;
                } else {
                    updated.currentChannelId = null;
                }
            }
            return persistence(state, { ...updated, allUnreadCount: updated.channels.reduce((r, a) => (r + a.unreadCount), 0) });
        }
        case types.MOVE_CHANNEL: {
            const { from, to } = action.payload;
            const movedChannel = state.channels[from];
            const channels = [...state.channels];
            channels.splice(from, 1);
            channels.splice(to, 0, movedChannel);
            return persistence(state, { channels });
        }
        case types.SET_CHANNEL_SELECTOR_EDITMODE: {
            const updated = { channelSelectorEditMode: action.payload };
            return persistence(state, updated);
        }
        case types.UPDATE_CHANNEL_FEED: {
            const { feeds, oldFeeds, channelId} = action.payload;
            mergeFeed(oldFeeds, feeds);
            if (state.maxFeedsCount && state.maxFeedsCount > 0) {
                feeds.items = feeds.items.slice(0, state.maxFeedsCount);
            }
            return persistence(state, { currentFeeds: state.currentChannelId === channelId ? feeds : state.currentFeeds, mergedFeed: feeds, ...updateUnreadCount(state.feedReadStatus, feeds, state.channels, channelId) });
        }
        case types.SET_FEED_READ_STATUS: {
            const feedReadStatus = state.feedReadStatus.some(s => s.channelId === action.payload.channelId) ?
                state.feedReadStatus.map(s => s.channelId === action.payload.channelId ? { ...s, feedIds: [...s.feedIds, action.payload.feedId] } : s) :
                [...state.feedReadStatus, { channelId: action.payload.channelId, feedIds: [action.payload.feedId]}];
            return persistence(state, { feedReadStatus, ...updateUnreadCount(feedReadStatus, state.currentFeeds, state.channels, state.currentChannelId) });
        }
        case types.OPEN_FEED:
            return persistence(state, { currentFeedItemId: action.payload, showContent: true });
        case types.CLOSE_FEED:
            return persistence(state, { showContent: false, feedContentTop: 0 });
        case types.SCROLL_FEED_CONTENT: {
            return persistence(state, { feedContentTop: action.payload });
        }
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
            return persistence(state, action.payload );
        }
        case types.CONNECT_BACKGROUND: {
            ChromeUtil.connect(state, action.payload);
            return state;
        }
        case types.CLEAN_CACHE: {
            ChromeUtil.setUnreadCount(0);
            return {...state,
                logs: [],
                showContent: false,
                currentFeeds: null,
                feedReadStatus: [],
                allUnreadCount: 0,
                channels: state.channels.map(c => ({ ...c, unreadCount: 0 }))
            };
        }
        case types.UPDATE_LAST_ACTIVE_TIME: {
            return persistence(state, { lastActiveTime: (new Date()).toISOString() });
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