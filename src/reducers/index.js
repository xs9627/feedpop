import * as types from "../constants/action-types";
import {ChannelFixedID} from "../constants/index";
import ChromeUtil from "../utils/ChromeUtil";

const recentCount = 30;
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

const splitFeedsToRecent = feeds => {
    return [{...feeds, items: feeds.items.slice(0, recentCount)},
        {items: feeds.items.slice(recentCount)}
    ]
}

const mergeUpdatedReadStatus = (readStatus, updatedReadStatus = []) => {
    return [...readStatus, ...(updatedReadStatus.filter(urs => 
        !readStatus.find(crs => crs.channelId === urs.channelId && crs.link === urs.link)))].slice(0, 100);
}

const persistence = (state, updated) => {
    const newState = { ...state,  ...updated };
    const { getComponentState, currentFeeds, mergedFeed, source, version, tmp, tourOption, ...persistenceState } = newState;
    ChromeUtil.set({ state: persistenceState });
    ChromeUtil.setUnreadCount(newState.allUnreadCount);
    return newState;
}

const defaultState = {
    showContent: false,
    feedContentTop: 0,
    isShowActionMenu: false,
    currentFeedItemId: null,
    channelSelectorEditMode: false,
    historyFeedsLoaded: false,
    channelFeedUpdating: false,
    channelSelector: {
        editOpen: false,
        isCheckingUrl: false,
        isUrlInvalid: false,
    }
}

const initialState = {
    channels: [],
    recentFeeds: [],
    theme: 'system',
    fontSize: 14,
    maxFeedsCount: 500,
    source: require('Config').sourceRepository,
    version: ChromeUtil.getVersion(),
    logs: [],
    allUnreadCount: 0,
    refreshPeriod: 15,
    recentChannelIndex: 0,
    showRecentUpdate: true,
    currentChannelId: ChannelFixedID.RECENT,
    tourOption: {},
    tmp: {},
    ...defaultState,
    getComponentState(componentName, stateName) {
        return this[componentName] ? this[componentName][stateName] : null;
    },
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
                const { currentChannelId, currentFeedItemId, showContent, feedContentTop, historyFeedsLoaded, showRecentUpdate, recentChannelIndex, channels } = state;
                const showGoBack = showContent && lastActiveSpan <= 5 * 60 * 1000;
                const updated = { ...defaultState,
                    lastActiveState: { currentChannelId, currentFeedItemId, showContent, feedContentTop, historyFeedsLoaded },
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
                if (showRecentUpdate && recentChannelIndex === 0) {
                    updated.currentChannelId = ChannelFixedID.RECENT;
                } else if (channels.length > 0) {
                    updated.currentChannelId = channels[0].id;
                } else {
                    updated.currentChannelId = null;
                }
                return persistence(state, updated);
            } else {
                return {...state, channelFeedUpdating: false};
            }   
        }
        case types.SELECT_CHANNEL: {
            let id = action.id;
            if (!id) {
                id = state.channels[0].id;
            }
            const updated = { currentChannelId: id, historyFeedsLoaded: false };
            return persistence(state, updated);
        }
        case types.ADD_CHANNEL_BEGIN: {
            return persistence(state, { channelSelector: { ...state.channelSelector, isCheckingUrl: true } });
        }
        case types.ADD_CHANNEL: {
            const { channel, feeds } = action.payload;
            channel.id = require('uuid/v4')();
            channel.unreadCount = feeds.items.length;
            const splitedFeeds = splitFeedsToRecent(feeds);
            const recentFeeds = [...state.recentFeeds, {channelId: channel.id, feed: splitedFeeds[0]}];
            const updated = { recentFeeds, mergedFeed:splitedFeeds[1], channels: [...state.channels, channel], allUnreadCount: (state.allUnreadCount || 0) + channel.unreadCount };
            feeds.items.sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
            const uuidv4 = require('uuid/v4');
            feeds.items.forEach((item, i) => {
                if (!item.readerId) {
                    item.readerId = uuidv4();
                    item.isoDate = isInvalidDateStr(item.isoDate) ? getIsoDateNow(i) : item.isoDate;
                }
            });
            if (!state.showRecentUpdate && updated.channels.length === 1) {
                updated.currentChannelId = channel.id;
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
            if (state.currentChannelId === ChannelFixedID.RECENT) {
                const allItems = state.recentFeeds.reduce((r, a) => ([...r, ...a.feed.items.map(i => ({...i, channelId: a.channelId}))]), [])
                    .sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate));
                return { ...state, currentFeeds: { items: allItems } };
            } else {
                const recentChannelFeeds = state.recentFeeds.find(rf => rf.channelId === state.currentChannelId);
                const currentFeeds = recentChannelFeeds && recentChannelFeeds.feed;
                return { ...state, currentFeeds };
            }
        }
        case types.LOAD_HISTORY_FEEDS: {
            const {currentFeeds} = state;
            const historyFeeds = action.payload;
            return persistence(state, { currentFeeds: historyFeeds ? {...currentFeeds, items: [...currentFeeds.items, ...historyFeeds.items]} : currentFeeds, historyFeedsLoaded: true });
        }
        case types.SYNC_BACKGROUND_UPDATE: {
            const { channels, allUnreadCount, recentFeeds } = action.payload.state;
            return { ...state, channels, allUnreadCount, recentFeeds };
        }
        case types.SET_CHANNELS:
            return { ...state, channels: action.payload };
        case types.DELETE_CHANNELS: {
            if (action.payload === ChannelFixedID.RECENT) {
                return persistence(state, {showRecentUpdate: false, currentChannelId: state.channels.length > 0 ? state.channels[0].id : null});
            }

            const updated = {
                channels: state.channels.filter(c => c.id !== action.payload),
                recentFeeds: state.recentFeeds.filter(rf => rf.channelId !== action.payload),
            };
            if (state.currentChannelId === action.payload) {
                if (state.showRecentUpdate && state.recentChannelIndex === 0) {
                    updated.currentChannelId = ChannelFixedID.RECENT;
                } else if (updated.channels.length > 0) {
                    updated.currentChannelId = updated.channels[0].id;
                } else {
                    updated.currentChannelId = null;
                }
            }
            return persistence(state, { ...updated, allUnreadCount: updated.channels.reduce((r, a) => (r + a.unreadCount), 0) });
        }
        case types.MOVE_CHANNEL: {
            let order = action.payload;
            const updated = {}
            if (state.showRecentUpdate) {
                const recentChannelIndex = state.recentChannelIndex;
                updated.recentChannelIndex = order.indexOf(recentChannelIndex);
                order = order.filter(i => i !== recentChannelIndex).map(i => i < recentChannelIndex ? i : i - 1);
            }
            const channels = [];
            order.forEach(index => channels.push(state.channels[index]));
            updated.channels = channels;
            return persistence(state, updated);
        }
        case types.SET_CHANNEL_SELECTOR_EDITMODE: {
            const updated = { channelSelectorEditMode: action.payload };
            return persistence(state, updated);
        }
        case types.UPDATE_CHANNEL_FEED_BEGIN: {
            return persistence(state, {channelFeedUpdating: true});
        }
        case types.UPDATE_CHANNEL_FEED_END: {
            return persistence(state, {channelFeedUpdating: false});
        }
        case types.UPDATE_CHANNEL_FEED: {
            const { feeds, oldFeeds, channelId} = action.payload;
            const recentChannelFeeds = state.recentFeeds.find(rf => rf.channelId === channelId);
            const oldFeedsWithRecent = recentChannelFeeds ? 
            (oldFeeds ? {...recentChannelFeeds.feed, items: [...recentChannelFeeds.feed.items, ...oldFeeds.items]} : recentChannelFeeds.feed)
            : oldFeeds;
            mergeFeed(oldFeedsWithRecent, feeds);
            if (state.maxFeedsCount && state.maxFeedsCount > 0) {
                feeds.items = feeds.items.slice(0, state.maxFeedsCount);
            }
            const splitedFeeds = splitFeedsToRecent(feeds);
            const recentFeeds = [...state.recentFeeds.filter(rf => (rf.channelId !== channelId)), {channelId, feed: splitedFeeds[0]}];
            return persistence(state, {
                recentFeeds,
                currentFeeds: state.currentChannelId === channelId ? feeds : state.currentFeeds,
                mergedFeed: splitedFeeds[1],
                ...updateUnreadCount(feeds, state.channels, channelId) 
            });
        }
        case types.SET_FEED_READ_STATUS: {
            const {channelId, feedId, isRead, needUpdateHistoryReadStatus, historyFeeds} = action.payload;
            
            const channels = state.channels.map(channel => channel.id === channelId ? { ...channel, unreadCount: channel.unreadCount - (isRead ? 1 : -1) } : channel);

            let update = {channels, allUnreadCount: state.allUnreadCount - (isRead ? 1 : -1)};

            if (state.currentFeeds) {
                const items = state.currentFeeds.items.map(i => (i.readerId === feedId ? { ...i, isRead } : i));
                const currentFeeds = { ...state.currentFeeds, items };
                update.currentFeeds = currentFeeds;
            }
            
            if (!needUpdateHistoryReadStatus) {
                const recentFeeds = state.recentFeeds.map(rf => rf.channelId !== channelId ? rf : 
                    {
                        ...rf, 
                        feed: {
                            ...rf.feed, 
                            items: rf.feed.items.map(i => (i.readerId === feedId ? { ...i, isRead } : i))
                        }
                    }
                );
                update = {...update, recentFeeds};
            } else {
                update.mergedFeed = {...historyFeeds, items: historyFeeds.items.map(i => (i.readerId === feedId ? { ...i, isRead: isRead } : i))}
            }

            const {link} = (!needUpdateHistoryReadStatus ? state.recentFeeds.find(rf => rf.channelId === channelId).feed : historyFeeds)
            .items.find(i => i.readerId === feedId);

            update.tmp = {...state.tmp, updateReadStatus: mergeUpdatedReadStatus([{channelId, link, isRead}], state.tmp.updateReadStatus)}
            
            return persistence(state, update);
        }
        case types.SET_HISTORY_FEED_READ_STATUS: {
            const {historyFeeds, feedId, isRead} = action.payload;
            return {...state, mergedFeed: {...historyFeeds, items: historyFeeds.items.map(i => (i.readerId === feedId ? { ...i, isRead: isRead } : i))}};
        }
        case types.MARK_ALL_AS_READ: {
            const {channelId} = action.payload;
            let update = {};
            if (state.currentFeeds) {
                // For update in background
                update.currentFeeds = {
                    ...state.currentFeeds,
                    items: state.currentFeeds.items.map(i => ({ ...i, isRead: true }))
                };
            }
            if (ChannelFixedID.RECENT === channelId) {
                const newChannels = state.channels.map(channel => {
                    const recentFeed = state.recentFeeds.find(rf => rf.channelId === channel.id)
                    return {
                        ...channel,
                        unreadCount: recentFeed ? (channel.unreadCount - recentFeed.feed.items.filter(i => !i.isRead).length) : channel.unreadCount
                    };
                });
                update = {
                    ...update,
                    channels: newChannels,
                    recentFeeds: state.recentFeeds.map(rf => ({
                        ...rf,
                        feed: {
                            ...rf.feed,
                            items: rf.feed.items.map(i => ({
                                ...i,
                                isRead: true
                            }))
                        }
                    })),
                    allUnreadCount: newChannels.reduce((r, a) => (r + a.unreadCount), 0),
                    tmp: {...state.tmp, needUpdateHistoryReadStatus: false}
                }
            } else {
                update = {
                    ...update,
                    channels: state.channels.map(channel => channel.id === channelId ? {...channel, unreadCount: 0} : channel),
                    recentFeeds: state.recentFeeds.map(rf => rf.channelId === channelId ? {
                        ...rf,
                        feed: {
                            ...rf.feed,
                            items: rf.feed.items.map(i => ({
                                ...i,
                                isRead: true
                            }))
                        }
                    } : rf),
                    allUnreadCount: state.channels.filter(c => c.id !== channelId).reduce((r, a) => (r + a.unreadCount), 0),
                    tmp: {...state.tmp, needUpdateHistoryReadStatus: true}
                }
            }

            return persistence(state, update);
        }
        case types.MARK_History_ALL_AS_READ: {
            const {historyFeeds} = action.payload;
            return {...state, mergedFeed: {...historyFeeds, items: historyFeeds.items.map(i => ({ ...i, isRead: true }))}};      
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
                recentFeeds: [],
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
            return persistence(state, {tourOption: {...state.tourOption, ...action.payload}});
        }
        case types.TOGGLE_SHOW_RECENT_UPDATE: {
            const showRecentUpdate = action.payload;
            return persistence(state, {
                showRecentUpdate,
                currentChannelId: showRecentUpdate ? ChannelFixedID.RECENT : state.currentChannelId === ChannelFixedID.RECENT && state.channels.length > 0 ? state.channels[0].id : state.currentChannelId,
                recentChannelIndex: 0
            });
        }
        case types.SAVE_CONFIG: {
            const {configSyncTime: oriSyncTime, ...oriConfig} = action.payload || {};
            const {recentChannelIndex, theme, fontSize, maxFeedsCount, refreshPeriod, showRecentUpdate} = state;
            const curConfig = {
                channels: state.channels.map(c => {
                    const {unreadCount, ...syncChannel} = c;
                    return syncChannel;
                }),
                recentChannelIndex, theme, fontSize, maxFeedsCount, refreshPeriod, showRecentUpdate
            };
            const sortedKey = [...(Object.keys(oriConfig).sort()), 'id', 'name', 'url']
            if ((curConfig.channels.length > 0 || action.payload)
            && (JSON.stringify(oriConfig, sortedKey) !== JSON.stringify(curConfig, sortedKey))
            ) {
                const configSyncTime = (new Date()).toISOString();
                return persistence(state, {
                    configSyncTime, 
                    tmp: {
                        ...state.tmp,
                        newConfig: {
                            configSyncTime,
                            ...curConfig
                        }
                    }
                });
            } else {
                const {newConfig, ...tmp} = state.tmp;
                return {...state, tmp};
            }
        }
        case types.SAVE_READ_STATUS: {
            
        }
        case types.LOAD_CONFIG: {
            const {channels: configChannels, ...restConfig} = action.payload;
            const channels = configChannels.map(c => {
                const stateChannel = state.channels.find(sc => sc.id === c.id);
                return {
                    ...c,
                    unreadCount: stateChannel ? stateChannel.unreadCount : 0
                }
            });
            const currentChannelId = channels.find(c => c.id === state.currentChannelId) ? state.currentChannelId :
            channels.length > 0 ? channels[0].id : null;
            const recentFeeds = configChannels.map(c => (state.recentFeeds.find(rf => rf.channelId === c.id))).filter(Boolean);
            return persistence(state, {channels, currentChannelId, recentFeeds, allUnreadCount: channels.reduce((r, a) => (r + a.unreadCount), 0), ...restConfig});
        }
        default:
            return state;
    }
};
export default rootReducer;