/* global chrome */
/* global RSSParser */
import 'rss-parser/dist/rss-parser.min.js'

export default {
    fetchFeed: (url, callback) => {
        let parser = new RSSParser();
        const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";
        parser.parseURL(CORS_PROXY + url, callback);
    }
}