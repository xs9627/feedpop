import * as types from "../constants/action-types";
import ChromeUtil from "../utils/ChromeUtil";
import { stat } from "fs";

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
    ChromeUtil.set(updated);
    return { ...state,  ...updated };
}

const initialState = {
    channel: [],
    currentFeeds: {
      feed: {
        items: []
      }
    },
    currentFeedItem: {},
    showContent: false,
    settings: {},
    feedReadStatus: [],
};

const rootReducer = (state = initialState, action) => {
    switch (action.type) {
        case types.SET_INIT_STATE: {
            return { ...state, ...action.state };
        }
        case types.SELECT_CHANNEL: {
            let id = action.id;
            if (!id) {
                id = state.channels[0].id;
            }
            const updated = { currentChannelId: id, currentFeeds: state.feeds ? state.feeds.find(f => f.id === id) : { feed: {items: []} }};
            return persistence(state, updated);
        }
        case types.ADD_CHANNEL: {
            action.payload.id = require('uuid/v4')();
            const updated = { channels: [...state.channels, action.payload]};
            if (updated.channels.length === 1) {
                updated.currentChannelId = action.payload.id;
            }
            return persistence(state, updated);
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
                    updated.currentFeeds = updated.feeds.find(f => f.id === updated.currentChannelId);
                } else {
                    updated.currentChannelId = null;
                    updated.currentFeeds = null;
                }
            }
            return persistence(state, updated);
        }
        case types.SET_CHANNEL_SELECTOR_EDITMODE:
            return { ...state, channelSelectorEditMode: action.payload };
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
            const updated = { feeds: state.feeds ? [ ...state.feeds.filter(f => f.id !== action.payload.id), feedObj ] : [feedObj]};
            if (state.channels.length === 1 && state.channels[0].id === action.payload.id) {
                updated.currentFeeds = feedObj;
            }
            return persistence(state, updated);
        }
        case types.SET_FEED_READ_STATUS:
            const feedReadStatus = state.feedReadStatus.some(s => s.channelId === action.payload.channelId) ?
                state.feedReadStatus.map(s => s.channelId === action.payload.channelId ? { ...s, feedIds: [...s.feedIds, action.payload.feedId] } : s) :
                [...state.feedReadStatus, { channelId: action.payload.channelId, feedIds: [action.payload.feedId]}]
            ChromeUtil.set({ feedReadStatus });
            return { ...state, feedReadStatus };
        case types.OPEN_FEED:
            ChromeUtil.set({ currentFeedItem: action.payload, showContent: true });
            return { ...state, currentFeedItem: action.payload, showContent: true };
        case types.CLOSE_FEED:
            ChromeUtil.set({ showContent: false });
            return { ...state, showContent: false };
        case types.OPEN_ACTION_MENU: {
            const updated = { isShowActionMenu: true, actionName: action.payload };
            return persistence(state, updated);
        }
        case types.CLOSE_ACTION_MENU: {
            const updated = { isShowActionMenu: false, actionName: null };
            return persistence(state, updated);
        }
        case types.UPDATE_UNREAD_COUNT:
            let allCount = 0;
            let feedsCount = {};
            const readStatus = state.feedOpenStatus;
            state.feeds.forEach(feedObj => {
                let count = feedObj.feed.items.length;
                if (readStatus) {
                    const statusObj = readStatus.find(t => t.id === feedObj.id);
                    if (statusObj) {
                        feedObj.feed.items.forEach(f => {
                            if (statusObj.status.some(status => status === f.readerId)) {
                                count--;
                            }
                        });
                    }
                }

                feedsCount[feedObj.id] = count;
                allCount += count;
            });
            return { ...state, 
                channels: state.channels.map(channel => ({ ...channel, unreadCount: feedsCount[channel.id] })), 
                allUnreadCount: allCount };
        case types.TOGGLE_CHANNEL_SELECTOR_EDITMODE:
            return { ...state, channelSelectorEditMode: !state.channelSelectorEditMode };
        default:
            return state;
    }
};
export default rootReducer;