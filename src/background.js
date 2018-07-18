/* global chrome */
import FeedUtil from './utils/FeedUtil';

chrome.runtime.onInstalled.addListener(function() {
    FeedUtil.fetchFeed('https://www.feng.com/rss.xml', (err, feed) => {
        if (err) {
          alert(err.message);
        } else {
          chrome.storage.local.get('feeds', (data) => {
            let feeds = data.feeds;
            if (!feeds) {
                feeds = [];
            }
            feeds.push({time: Date.now(), feed: feed});
            chrome.storage.local.set({'feeds': feeds});
            console.log("Init feeds");
          });
        }
    });
});