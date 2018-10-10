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
                resolve(obj);
            });
        });
    },
    openTab: url => {
        chrome.tabs.create({url:url});
    },
    connect: (state, messageCallback) => {
        const port = chrome.runtime.connect({name: "reader"});
        port.state = state;
        port.onMessage.addListener(msg => {
            console.log(msg);
            messageCallback(msg);
        });
    }
};

export default ChromeUtil;