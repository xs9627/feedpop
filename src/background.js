/* global chrome */
import FeedUtil from './utils/FeedUtil';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.clear();
  chrome.storage.local.clear();
  FeedUtil.addChannel('CN - 1', 'https://www.feng.com/rss.xml').then((() => {
    FeedUtil.addChannel('CN - 2', 'http://zhihurss.miantiao.me/dailyrss');
  }));
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