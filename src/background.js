/* global chrome */
import store from './store/index';
import { syncState, updateAllChannelsFeed, updateLastActiveTime, cleanCache, markAllChannelAsRead, saveConfig, setFeedReadStatus } from './actions/index';
import { BACKGROUND_UPDATE_CHANNEL, CLEAR_NOTIFICATION } from './constants/action-types';
import ChromeUtil from './utils/ChromeUtil';

const ports = [];
const refreshAll = async () => {
    await store.dispatch(updateAllChannelsFeed(true))
    ports.forEach(port => {
        port.postMessage({ type: BACKGROUND_UPDATE_CHANNEL });
    });
}
chrome.runtime.onInstalled.addListener(() => {
    store.dispatch(syncState(true)).then(() => {
        const state = store.getState();
        chrome.browserAction.setBadgeText({text: state && state.allUnreadCount > 0 ? `${state.allUnreadCount}` : ''});
        chrome.browserAction.setBadgeBackgroundColor({ color: '#424242' });
        chrome.contextMenus.removeAll();
        chrome.contextMenus.create({id: "markAllAsRead", "title": chrome.i18n.getMessage('markAllAsRead'), contexts: ["browser_action"]});
        chrome.contextMenus.create({id: "cleanCache", "title": chrome.i18n.getMessage('cleanCache'), contexts: ["browser_action"]});
        refreshAll();
        ChromeUtil.recreateAlarm("refreshAll", state.refreshPeriod);
    });
});

chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name === "refreshAll") {
        console.log('Starting update all channels - ' + Date());
        store.dispatch(syncState(true)).then(() => {
            //store.dispatch(log('Starting update all channels'));
            refreshAll();
        });
    }
});

chrome.notifications.onClicked.addListener(notificationId => {
    store.dispatch(syncState(true)).then(() => {
        const notification = store.getState().notifications.find(n => n.id === notificationId)
        if (notification && notification.data) {
            const {link, readerId, channelId} = notification.data
            if (link) {
                ChromeUtil.openTab(link)
                store.dispatch(setFeedReadStatus(channelId, readerId))
            }
        }
        store.dispatch({type: CLEAR_NOTIFICATION, payload: {id: notificationId}})
    })
})

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