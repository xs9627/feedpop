/* global chrome */
let ChromeUtil = {
    putIntoArray: (arrayName, item, isReplace) => {
        return new Promise((resolve, reject) => {
            ChromeUtil.getArray(arrayName).then(array => {
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
        return ChromeUtil.getArray(arrayName).then(array => {
            if(array) {
                return array.filter(arrayItem => arrayItem.id === id)[0];
            }
        });
    },
    getArray: arrayName => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(arrayName, data => {
                resolve(data[arrayName]);
            });
        });
    }
};

export default ChromeUtil;