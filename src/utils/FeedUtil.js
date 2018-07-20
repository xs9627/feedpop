/* global chrome */
/* global RSSParser */
import 'rss-parser/dist/rss-parser.min.js' 

export default {
    addChannel: (name, url) => {
        const uuidv4 = require('uuid/v4');
        return new Promise((resolve, reject) => {
            chrome.storage.local.get('channels', (data) => {
                let channels = data.channels;
                if (!channels) {
                    channels = [];
                }
                console.log(name);
                channels.push({id: uuidv4(), name: name, url: url});
                chrome.storage.local.set({'channels': channels});
                resolve();
            });
        }); 
    },
    getAllChannels: (callback) => {
        chrome.storage.local.get('channels', (data) => {
            callback(data.channels);
        });
    },
    fetchFeed: (url, callback) => {
        let parser = new RSSParser();
        const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
        parser.parseURL(CORS_PROXY + url, callback);
    }
}