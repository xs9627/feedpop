/* global chrome */
import store from './store/index';
import { initState, updateChannelFeed, setSettins, log } from './actions/index';
import { BACKGROUND_UPDATE_CHANNEL } from './constants/action-types';

this.ports = [];

chrome.runtime.onInstalled.addListener(() => {
  // chrome.storage.sync.clear();
  // chrome.storage.local.clear();
  // store.dispatch(addChannel({ name: 'CN - 1', url: 'https://www.feng.com/rss.xml' }));
  // store.dispatch(addChannel({ name: 'CN - 2', url: 'http://zhihurss.miantiao.me/dailyrss' }));
  // store.getState().channels.forEach(channel => {
    //   //console.log(channel);
    //   store.dispatch(updateChannelFeed(channel.id));
    // });
    
  store.dispatch(setSettins({ 
    theme: 'light', 
    version: chrome.runtime.getManifest().version, 
    source: 'https://github.com/xs9627/rss-reader'
  }));

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
      state.silentPersistent = true;
      state.channels.forEach(channel => {
        //console.log(channel);
        store.dispatch(updateChannelFeed(channel.id, () => {
          this.ports.forEach(port => {
            port.postMessage({ type: BACKGROUND_UPDATE_CHANNEL, channelId: channel.id });
          });
        }));
      });
    }));
  }
});

chrome.runtime.onConnect.addListener(externalPort => {
  this.ports.push(externalPort);
  externalPort.onDisconnect.addListener(() => {
    this.ports.splice(this.ports.indexOf(externalPort), 1);
    store.getState().silentPersistent = false;
    store.dispatch(initState(() => {
      store.dispatch(log("Disconnect"));
    }));
  });
  console.log("onConnect")
})