/* global chrome */
import store from './store/index';
import { initState, addChannel, updateChannelFeed, setSettins } from './actions/index'

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.clear();
  chrome.storage.local.clear();
  store.dispatch(setSettins({ 
    theme: 'light', 
    version: chrome.runtime.getManifest().version, 
    source: 'https://github.com/xs9627/rss-reader'
  }));
  store.dispatch(addChannel({ name: 'CN - 1', url: 'https://www.feng.com/rss.xml' }));
  store.dispatch(addChannel({ name: 'CN - 2', url: 'http://zhihurss.miantiao.me/dailyrss' }));
  store.getState().channels.forEach(channel => {
    //console.log(channel);
    store.dispatch(updateChannelFeed(channel.id));
  });
  
  chrome.alarms.create("refreshAll", {
    delayInMinutes: 1,
    periodInMinutes: 10,
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
  }
});