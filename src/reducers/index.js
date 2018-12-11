import * as types from "../constants/action-types";
import ChromeUtil from "../utils/ChromeUtil";

const mergeFeed = (oldFeed, newFeed) => {
    const uuidv4 = require('uuid/v4');
    if (oldFeed) {
        const mergedItems = [...oldFeed.items];
        newFeed.items.forEach((ni, i) => {
            if (!mergedItems.find(mi => mi.link === ni.link)) {
                mergedItems.push({
                    ...ni,
                    readerId: uuidv4(),
                    isoDate: isInvalidDateStr(ni.isoDate) ? getIsoDateNow(i) : ni.isoDate
                });
            }
        });
        newFeed.items = mergedItems;
    } else {
        newFeed.items.forEach((item, i) => {
            if (!item.readerId) {
                item.readerId = uuidv4();
            }
            if (isInvalidDateStr(item.isoDate)) {
                item.isoDate = getIsoDateNow(i);
            }
        });
    }

    newFeed.items.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
}

const isInvalidDateStr = dateStr => {
    return isNaN(new Date(dateStr));
}

const getIsoDateNow = index => {
    const now = new Date();
    now.setMilliseconds(now.getMilliseconds() - index);
    return now.toString();
}

const persistence = (state, updated) => {
    const newState = { ...state,  ...updated };
    const { getComponentState, currentFeeds, mergedFeed, source, version, ...persistenceState } = newState;
    ChromeUtil.set({ state: persistenceState });
    ChromeUtil.setUnreadCount(newState.allUnreadCount);
    return newState;
}

const initialState = {
    channels: [],
    theme: 'light',
    maxFeedsCount: 500,
    source: 'https://github.com/xs9627/feedpop',
    version: ChromeUtil.getVersion(),
    logs: [],
    allUnreadCount: 0,
    refreshPeriod: 15,
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
    isTourOpen: false,
    channelSelector: {
        editOpen: false,
        isCheckingUrl: false,
        isUrlInvalid: false,
    }
}

const updateUnreadCount = (feeds, channels, channelId) => {
    let count = feeds.items.filter(i => !i.isRead).length;
    
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
            if (lastActiveSpan > .5 * 60 * 1000) {
                const { currentChannelId, currentFeedItemId, showContent, feedContentTop } = state;
                const showGoBack = showContent && lastActiveSpan <= 5 * 60 * 1000;
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
            feeds.items.forEach((item, i) => {
                if (!item.readerId) {
                    item.readerId = uuidv4();
                    item.isoDate = isInvalidDateStr(item.isoDate) ? getIsoDateNow(i) : item.isoDate;
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
        case types.SYNC_BACKGROUND_UPDATE: {
            const { channels, allUnreadCount } = action.payload.state;
            const currentFeeds = action.payload.currentFeeds;
            return { ...state, channels, allUnreadCount, currentFeeds };
        }
        case types.SET_CHANNELS:
            return { ...state, channels: action.payload };
        case types.DELETE_CHANNELS: {
            const updated = {
                channels: state.channels.filter(c => c.id !== action.payload),
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
            const channels = [...state.channels];
            const newChannels = [];
            action.payload.forEach(index => newChannels.push(channels[index]));
            return persistence(state, { channels: newChannels });
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
            return persistence(state, { currentFeeds: state.currentChannelId === channelId ? feeds : state.currentFeeds, mergedFeed: feeds, ...updateUnreadCount(feeds, state.channels, channelId) });
        }
        case types.SET_FEED_READ_STATUS: {
            const items = state.currentFeeds.items.map(i => (i.readerId === action.payload.feedId ? { ...i, isRead: true } : i));
            const currentFeeds = { ...state.currentFeeds, items };
            return persistence(state, { currentFeeds, ...updateUnreadCount(currentFeeds, state.channels, state.currentChannelId) });
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
        case types.TOGGLE_TOUR_OPEN: {
            return persistence(state, { isTourOpen: action.payload });
        }
        default:
            return state;
    }
};
export default rootReducer;