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
                }
                resolve(obj);
            });
        });
    },
    openTab: url => {
        chrome.tabs.create({url:url});
    },
    connect: (state, receiveMessage) => {
        const port = chrome.runtime.connect({name: "reader"});
        port.state = state;
        port.onMessage.addListener(msg => {
            receiveMessage(msg);
        });
    }
};

export default ChromeUtil;