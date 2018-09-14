/* global RSSParser */
import 'rss-parser/dist/rss-parser.min.js';
import ChromeUtil from './ChromeUtil';

const CHANNELS_ARRAY_NAME = 'channels';
const FEEDS_ARRAY_NAME = 'feeds';
const SETTINGS_NAME = 'settings';
const FEED_OPEN_STATUS = 'feedOpenStatus';

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

let FeedUtil =  {
    addChannel: (name, url) => {
        return ChromeUtil.putIntoArray(CHANNELS_ARRAY_NAME, {name: name, url: url});
    },
    deleteChannel: id => {
        return Promise.all([ChromeUtil.deleteArrayById(CHANNELS_ARRAY_NAME, id),
            ChromeUtil.deleteArrayById(FEEDS_ARRAY_NAME, id),
            ChromeUtil.deleteArrayById(FEED_OPEN_STATUS, id),
        ]);
    },
    updateChannelFeed: id => {
        return ChromeUtil.findArrayById(CHANNELS_ARRAY_NAME, id).then(channel => {
            return fetchFeed(channel.url).then(feed => {
                return FeedUtil.getChannelFeed(id).then(oldFeedObj => {
                    if(oldFeedObj) {
                        let mergedItems = mergeFeed(oldFeedObj.feed.items, feed.items);
                        feed.items = mergedItems;
                    }
                    const uuidv4 = require('uuid/v4');
                    feed.items.forEach(item => {
                        if (!item.readerId) {
                            item.readerId = uuidv4();
                        }
                    });
                    let feedObj = {id: id, feed: feed};
                    return ChromeUtil.putIntoArray(FEEDS_ARRAY_NAME, feedObj, true);
                });
            });
        });
    },
    getAllChannels: () => {
        return ChromeUtil.get(CHANNELS_ARRAY_NAME);
    },
    getChannelFeed: (id) => {
        return ChromeUtil.findArrayById(FEEDS_ARRAY_NAME, id);
    },
    getAllUnreadCount: () => {
        return Promise.all([ChromeUtil.get(FEEDS_ARRAY_NAME), ChromeUtil.get(FEED_OPEN_STATUS)])
            .then(values => {
                let count = 0;
                const feeds = values[0];
                const readStatus = values[1];
                feeds.forEach(feedObj => {
                    const statusObj = readStatus.find(t => t.id === feedObj.id);
                    feedObj.feed.items.forEach(f => {
                        if (!statusObj.status.some(status => status === f.readerId)) {
                            count++;
                        }
                    })
                    
                });
                return count;
            });
    },
    setSettings: settings => {
        return ChromeUtil.set(SETTINGS_NAME, settings);
    },
    getSettings: () => {
        return ChromeUtil.get(SETTINGS_NAME);
    },
    setFeedOpenStatus: (channedId, feedId) => {
        return ChromeUtil.findArrayById(FEED_OPEN_STATUS, channedId).then(feedOpenStatus => {
            if (!feedOpenStatus) {
                feedOpenStatus = {
                    id: channedId,
                    status: []
                };
            }
            feedOpenStatus.status.push(feedId);
            return ChromeUtil.putIntoArray(FEED_OPEN_STATUS, feedOpenStatus, true);
        });
    },
    getFeedOpenStatus: channedId => {
        return ChromeUtil.findArrayById(FEED_OPEN_STATUS, channedId).then(statusObj => {
            if (statusObj) {
                return statusObj.status;
            } else {
                return [];
            }
        });
    }
};

export default FeedUtil;