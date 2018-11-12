/* global chrome */
import store from './store/index';
import { syncState, updateChannelFeed, setSettins, log, updateLastActiveTime } from './actions/index';
import { BACKGROUND_UPDATE_CHANNEL } from './constants/action-types';

const ports = [];

chrome.runtime.onInstalled.addListener(() => {
    store.dispatch(syncState()).then(() => {
        store.dispatch(setSettins({ 
            theme: 'light', 
            version: chrome.runtime.getManifest().version, 
            source: 'https://github.com/xs9627/rss-reader'
        }));    
    });
    
    chrome.alarms.create("refreshAll", {
        delayInMinutes: 1,
        periodInMinutes: 10,
    });

    chrome.browserAction.setBadgeBackgroundColor({ color: '#424242' });
});

chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === "refreshAll") {
        console.log('Starting update all channels - ' + Date());
        store.dispatch(syncState()).then(() => {
            const state = store.getState();
            store.dispatch(log('Starting update all channels'));
            const promises = [];
            state.channels.forEach(channel => {
                promises.push(store.dispatch(updateChannelFeed(channel.id)));
            });
            Promise.all(promises).then(() => {
                ports.forEach(port => {
                    port.postMessage({ type: BACKGROUND_UPDATE_CHANNEL });
                });
            });
        });
    }
});

chrome.runtime.onConnect.addListener(externalPort => {
    ports.push(externalPort);
    externalPort.onDisconnect.addListener(() => {
        ports.splice(ports.indexOf(externalPort), 1);
        store.dispatch(syncState()).then(() => {
            store.dispatch(updateLastActiveTime());
        });
    });
})