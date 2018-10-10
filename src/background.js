/* global chrome */
import store from './store/index';
import { syncState, updateChannelFeed, setSettins, log } from './actions/index';
import { BACKGROUND_UPDATE_CHANNEL } from './constants/action-types';

this.ports = [];

chrome.runtime.onInstalled.addListener(() => {
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
        store.dispatch(syncState()).then(() => {
            const state = store.getState();
            state.silentPersistent = true;
            store.dispatch(log('Starting update all channels'));
            const promises = [];
            state.channels.forEach(channel => {
                promises.push(store.dispatch(updateChannelFeed(channel.id)));
            });
            Promise.all(promises).then(() => {
                this.ports.forEach(port => {
                    port.postMessage({ type: BACKGROUND_UPDATE_CHANNEL });
                });
            });
        });
    }
});

chrome.runtime.onConnect.addListener(externalPort => {
    this.ports.push(externalPort);
    externalPort.onDisconnect.addListener(() => {
        this.ports.splice(this.ports.indexOf(externalPort), 1);
        store.getState().silentPersistent = false;
        store.dispatch(syncState()).then(() => {
            store.dispatch(log("Disconnect"));
        });
    });
    console.log("onConnect")
})