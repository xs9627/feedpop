/* global chrome */
import store from './store/index';
import { syncState, updateChannelFeed, updateLastActiveTime, cleanCache, markAllChannelAsRead, saveConfig } from './actions/index';
import { BACKGROUND_UPDATE_CHANNEL } from './constants/action-types';
import ChromeUtil from './utils/ChromeUtil';

const ports = [];
const refreshAll = state => {
    const promises = [];
    state.channels.forEach(channel => {
        promises.push(store.dispatch(updateChannelFeed(channel.id)));
    });
    Promise.all(promises).then(() => {
        ports.forEach(port => {
            port.postMessage({ type: BACKGROUND_UPDATE_CHANNEL });
        });
    });
}
chrome.runtime.onInstalled.addListener(() => {
    store.dispatch(syncState()).then(() => {
        const state = store.getState();
        chrome.browserAction.setBadgeText({text: state && state.allUnreadCount > 0 ? `${state.allUnreadCount}` : ''});
        chrome.browserAction.setBadgeBackgroundColor({ color: '#424242' });
        chrome.contextMenus.removeAll();
        chrome.contextMenus.create({id: "markAllAsRead", "title": chrome.i18n.getMessage('markAllAsRead'), contexts: ["browser_action"]});
        chrome.contextMenus.create({id: "cleanCache", "title": chrome.i18n.getMessage('cleanCache'), contexts: ["browser_action"]});
        refreshAll(state);
        ChromeUtil.recreateAlarm("refreshAll", state.refreshPeriod);
    });
});

chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === "refreshAll") {
        console.log('Starting update all channels - ' + Date());
        store.dispatch(syncState(true)).then(() => {
            const state = store.getState();
            //store.dispatch(log('Starting update all channels'));
            refreshAll(state);
        });
    }
});

chrome.runtime.onConnect.addListener(externalPort => {
    ports.push(externalPort);
    externalPort.onDisconnect.addListener(() => {
        ports.splice(ports.indexOf(externalPort), 1);
        store.dispatch(syncState()).then(() => {
            store.dispatch(updateLastActiveTime());
            store.dispatch(saveConfig());
        });
    });
})

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    switch(info.menuItemId) {
        case "markAllAsRead": {
            store.dispatch(syncState()).then(() => {
                store.dispatch(markAllChannelAsRead());
            });
            break;
        }
        case "cleanCache": {
            store.dispatch(syncState()).then(() => {
                store.dispatch(cleanCache());
            });
            break;
        }
        default:
    }
});