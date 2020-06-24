/* global chrome */
let ChromeUtil = {
    get: key => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(key, data => {
                if (key) {
                    resolve(data[key]);
                } else {
                    resolve(data);
                }
            });
        });
    },
    set: obj => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set(obj, () => {
                const error = chrome.runtime.lastError;  
                if (error) {
                    reject(error);
                } else {
                    resolve(obj);
                }
            });
        });
    },
    getSync: key => {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.get(key, data => {
                if (key) {
                    resolve(data[key]);
                } else {
                    resolve(data);
                }
            });
        });
    },
    setSync: obj => {
        return new Promise((resolve, reject) => {
            chrome.storage.sync.set(obj, () => {
                const error = chrome.runtime.lastError;  
                if (error) {
                    console.log(error) // Ignore error, not reject
                } 
                resolve(obj);
            });
        });
    },
    clear: () => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.clear(() => {
                const error = chrome.runtime.lastError;  
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });
    },
    openTab: (url, active = true) => {
        chrome.tabs.create({url, active});
    },
    connect: (state, receiveMessage) => {
        const port = chrome.runtime.connect({name: "reader"});
        port.state = state;
        port.onMessage.addListener(msg => {
            receiveMessage(msg);
        });
    },
    setUnreadCount: count => {
        chrome.browserAction.setBadgeText({text: count > 0 ? `${count}` : ''});
    },
    getVersion: () => {
        return chrome.runtime.getManifest().version;
    },
    recreateAlarm: (name, periodInMinutes, delayInMinutes = 1) => {
        chrome.alarms.clear(name, (wasCleared) => {
            chrome.alarms.create(name, {
                delayInMinutes,
                periodInMinutes,
            });
        })
    },
    download: config => {
        chrome.downloads.download(config);
    },
    createNotification: (id, options, callback) => {
        chrome.notifications.create(id, options, callback)
    },
    clearNotification: (id, callback) => {
        chrome.notifications.clear(id, callback)
    },
};

export default ChromeUtil;