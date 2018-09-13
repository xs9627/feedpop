/* global chrome */
import FeedUtil from './utils/FeedUtil';

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.clear();
  chrome.storage.local.clear();
  FeedUtil.setSettings({ darkTheme: false });
  // For testing
  FeedUtil.addChannel('CN - 1', 'https://www.feng.com/rss.xml').then(
    (channel1) => {
      FeedUtil.updateChannelFeed(channel1.id).then(() => {
        console.log(channel1.name + ' updated');
      });
      FeedUtil.addChannel('CN - 2', 'http://zhihurss.miantiao.me/dailyrss').then(channel2 => {
        console.log("Init feeds");
        FeedUtil.updateChannelFeed(channel2.id).then(() => {
          console.log(channel2.name + ' updated');
        });
      });
    }
  );
  chrome.alarms.create("refreshAll", {
    delayInMinutes: 1,
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