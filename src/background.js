/* global chrome */
import FeedUtil from './utils/FeedUtil';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.clear();
  chrome.storage.local.clear();
  FeedUtil.addChannel('CN - 1', 'https://www.feng.com/rss.xml').then(
    (channel) => {
      FeedUtil.updateChannelFeed(channel.id);
      FeedUtil.addChannel('CN - 2', 'http://zhihurss.miantiao.me/dailyrss').then(channel => {
        FeedUtil.updateChannelFeed(channel.id).then(() => {
          console.log("Init feeds");
        });
      });
    }
  );
});