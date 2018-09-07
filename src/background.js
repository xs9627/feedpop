/* global chrome */
import FeedUtil from './utils/FeedUtil';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.clear();
  chrome.storage.local.clear();
  FeedUtil.setSettings({ darkTheme: false });
  FeedUtil.addChannel('CN - 1', 'https://www.feng.com/rss.xml').then(
    (channel) => {
      FeedUtil.addChannel('CN - 2', 'http://zhihurss.miantiao.me/dailyrss').then(channel => {
        console.log("Init feeds");
      });
    }
  );
  chrome.alarms.create("refreshAll", {
    delayInMinutes: 0.1,
    periodInMinutes: 30
  });
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === "refreshAll") {
    console.log('Starting update all channels - ' + Date());
    FeedUtil.getAllChannels().then(channels => {
      if (channels) {
        channels.forEach(channel => {
          FeedUtil.updateChannelFeed(channel.id).then(() => {
            console.log(channel.name + ' updated');
          })
        });
      }
    });
  }
});