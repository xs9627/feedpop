/* global chrome */
import FeedUtil from './utils/FeedUtil';
import ChromeUtil from './utils/ChromeUtil';
import store from './store/index';
import { initState, updateChannelFeed } from './actions/index'

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.clear();
  chrome.storage.local.clear();
  FeedUtil.setSettings({ 
    darkTheme: false, 
    version: chrome.runtime.getManifest().version, 
    source: 'https://github.com/xs9627/rss-reader'
  });
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
    periodInMinutes: 1,
  });
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === "refreshAll") {
    console.log('Starting update all channels - ' + Date());
    store.dispatch(initState(() => {
      const state = store.getState();
      state.channels.forEach(channel => {
        //console.log(channel);
        store.dispatch(updateChannelFeed(channel.id));
      });
    }));
    // FeedUtil.getAllChannels().then(channels => {
    //   if (channels) {
    //     channels.forEach(channel => {
    //       FeedUtil.updateChannelFeed(channel.id).then(() => {
    //         console.log(channel.name + ' updated');
    //       })
    //     });
    //   }
    // });
  }
});