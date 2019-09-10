const analytics = {
    getService: () => ({getTracker: jest.fn()}),
}
global.analytics = analytics;

// chrome
const chrome = require('sinon-chrome');
chrome.runtime.getManifest.returns({version: "1.*.*"});
chrome.runtime.connect.returns({onMessage: { addListener: () => {}}});
chrome.storage.local.get.yields({});
chrome.storage.local.set.yields({});

global.chrome = chrome;

// mocks
jest.mock('Config');
jest.mock('react-i18next', () => ({
    // this mock makes sure any components using the translate HoC receive the t function as a prop
    withTranslation: () => Component => {
        Component.defaultProps = { ...Component.defaultProps, t: () => "" };
        return Component;
    },
}));

window.matchMedia = jest.fn().mockImplementation(query => {
    return {
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
    };
});