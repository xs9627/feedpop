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
        case types.SET_INIT_STATE:
            return { ...state, ...action.state };
        case types.SELECT_CHANNEL:
            let id = action.id;
            if (!id) {
                id = state.channels[0].id;
            }
            return { ...state, currentChannelId: id, currentFeeds: state.feeds ? state.feeds.find(f => f.id === id) : { feed: {items: []} } };
        case types.ADD_CHANNEL:
            action.payload.id = require('uuid/v4')();
            let channels = [...state.channels, action.payload];
            ChromeUtil.set("channels", channels);
            return { ...state, channels: channels };
        case types.SET_CHANNELS:
            return { ...state, channels: action.payload };
        case types.DELETE_CHANNELS:
            return { ...state, channels: state.channels.filter(c => c.id !== action.payload) };
        case types.SET_CHANNEL_SELECTOR_EDITMODE:
            return { ...state, channelSelectorEditMode: action.payload };
        case types.RECEIVE_FEED:
            const feed = action.payload;
            let feeds;
            if (state.feeds) {
                const oldFeedObj = state.feeds.find(f => f.id === action.payload);
                if (oldFeedObj) {
                    let mergedItems = mergeFeed(oldFeedObj.feed.items, feed.items);
                    feed.items = mergedItems;
                }
                feeds = [ ...state.feeds.filter(f => f.id !== action.id), {id: action.id, feed: feed} ];
            }
            const uuidv4 = require('uuid/v4');
            feed.items.forEach(item => {
                if (!item.readerId) {
                    item.readerId = uuidv4();
                }
            });
            const feedObj = {id: action.id, feed: feed};
            const newFeeds = state.feeds ? [ ...state.feeds.filter(f => f.id !== action.id), feedObj ] : [feedObj];
            ChromeUtil.set("feeds", newFeeds);
            return { ...state, feeds: newFeeds};
        case types.SET_FEED_READ_STATUS:
            const feedReadStatus = state.feedReadStatus.some(s => s.channelId === action.payload.channelId) ?
                state.feedReadStatus.map(s => s.channelId === action.payload.channelId ? { ...s, feedIds: [...s.feedIds, action.payload.feedId] } : s) :
                [...state.feedReadStatus, { channelId: action.payload.channelId, feedIds: [action.payload.feedId]}]
            ChromeUtil.set("feedReadStatus", feedReadStatus);
            return { ...state, feedReadStatus };
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