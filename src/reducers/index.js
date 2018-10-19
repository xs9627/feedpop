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
    const newState = { ...state,  ...updated };
    const { getComponentState, currentFeeds, ...persistenceState } = newState;
    ChromeUtil.set({ state: persistenceState });
    return newState;
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
    const { feedReadStatus, currentFeeds, currentChannelId, channels } = { ...state, ...updated };
    let count = currentFeeds.items.length;
    if (feedReadStatus) {
        const statusObj = feedReadStatus.find(t => t.channelId === currentChannelId);
        if (statusObj) {
            currentFeeds.items.forEach(f => {
                if (statusObj.feedIds.some(id => id === f.readerId)) {
                    count--;
                }
            });
        }
    }
    const updatedChannels = channels.map(channel => channel.id === currentChannelId ? { ...channel, unreadCount: count } : channel);
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
            const { channel, feeds } = action.payload;
            channel.id = require('uuid/v4')();
            channel.unreadCount = feeds.items.length;
            const updated = { channels: [...state.channels, channel], allUnreadCount: state.allUnreadCount + channel.unreadCount };
            if (updated.channels.length === 1) {
                updated.currentChannelId = channel.id;
                updated.currentFeeds = feeds;
            }
            return persistence(state, updated);
        }
        case types.ADD_CHANNEL_END: {
            return persistence(state, { channelSelector: { ...state.channelSelector, isCheckingUrl: false, isUrlValid: true, editOpen: false } });
        }
        case types.ADD_CHANNEL_ERROR: {
            return persistence(state, { channelSelector: { ...state.channelSelector, isCheckingUrl: false, isUrlValid: false, urlErrorMessage: action.payload } });
        }
        case types.SET_CURRENT_FEEDS: {
            return { ...state, currentFeeds: action.payload };
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
            const { feeds, oldFeeds} = action.payload;
            feeds.items.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
            if (oldFeeds) {
                let mergedItems = mergeFeed(oldFeeds.items, feeds.items);
                feeds.items = mergedItems;
            }
            const uuidv4 = require('uuid/v4');
            feeds.items.forEach(item => {
                if (!item.readerId) {
                    item.readerId = uuidv4();
                }
            });
            return persistence(state, { currentFeeds: feeds, ...updateUnreadCount(state, { currentFeeds: feeds }) });
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