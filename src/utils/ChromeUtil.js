/* global chrome */
let port
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
        window.close();
    },
    connect: (state, receiveMessage) => {
        port = chrome.runtime.connect({name: "reader"});
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
    createNotification: (id, options) => {
        return new Promise((resolve, reject) => {
            chrome.notifications.create(id, {
                type: "basic", 
                iconUrl: "icon128.png", 
                ...options
            }, notificationId => {
                if (notificationId) {
                    resolve(notificationId)
                } else {
                    reject()
                }
            })
        })
    },
    clearNotification: (id) => {
        return new Promise((resolve, reject) => {
            chrome.notifications.clear(id, notificationId => {
                if (notificationId) {
                    resolve(notificationId)
                } else {
                    reject()
                }
            })
        })
    },
    getMessage: (messageName, substitutions) => {
        return chrome.i18n.getMessage(messageName, substitutions)
    },
    sendMessageToBackground: message => {
        if (port) {
            port.postMessage(message)
        }
    },
    popOut: (extendView) => {
        const config = {'url': '/index.html', 'type': 'popup'}
        const size = extendView ? {width: 800, height: 650} : {width: 340, height: 650}
        chrome.windows.create({...config, ...size})
        window.close()
    },
    updatePopoutSize: (extendView) => {
        const views = chrome.extension.getViews({ type: "popup" });
        if (views.length === 0) {
            const size = extendView ? {width: 800, height: 650} : {width: 340, height: 650}
            chrome.windows.update(-2, size)
        }
    }
};

export default ChromeUtil;