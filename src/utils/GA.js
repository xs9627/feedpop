/* global analytics */
const service = analytics.getService('feedpop');
// service.getConfig().addCallback(config => {
//     console.log(config.isTrackingPermitted());
//     config.setTrackingPermitted(true);
// });
const Config = require('Config');
const tracker = service.getTracker(Config.trackingId);

export default {
    sendAppView: view => {
        tracker.sendAppView(view);
    }
}