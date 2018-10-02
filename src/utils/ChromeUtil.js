/* global chrome */
let ChromeUtil = {
    putIntoArray: (arrayName, item, isReplace) => {
        return new Promise((resolve, reject) => {
            ChromeUtil.get(arrayName).then(array => {
                if (!array) {
                    array = [];
                }
                if (!item.id) {
                    const uuidv4 = require('uuid/v4');
                    item.id = uuidv4();
                }
                if (isReplace) {
                    array = array.filter(arrayItem => arrayItem.id !== item.id);
                }
                array.push(item);
                let newArrayObj = {};
                newArrayObj[arrayName] = array;
                chrome.storage.local.set(newArrayObj, () => {
                    resolve(item);
                });
            });
        });
    },
    findArrayById: (arrayName, id) => {
        return ChromeUtil.get(arrayName).then(array => {
            if(array) {
                return array.filter(arrayItem => arrayItem.id === id)[0];
            }
        });
    },
    deleteArrayById: (arrayName, id) => {
        return ChromeUtil.get(arrayName).then(array => {
            if(array) {
                array = array.filter(arrayItem => arrayItem.id !== id);
                return new Promise((resolve, reject) => {
                    chrome.storage.local.set({[arrayName]: array}, () => {
                        resolve(array);
                    });
                });
            }
        });
    },
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
    set: (key, value) => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({[key]: value}, () => {
                resolve(value);
            });
        });
    },
    openTab: url => {
        chrome.tabs.create({url:url});
    }
};

export default ChromeUtil;