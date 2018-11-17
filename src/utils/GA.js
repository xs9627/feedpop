/* global analytics */
const service = analytics.getService('feedpop');
// service.getConfig().addCallback(config => {
//     console.log(config.isTrackingPermitted());
//     config.setTrackingPermitted(true);
// });
const tracker = service.getTracker('UA-129361090-1');

export default {
    sendAppView: view => {
        tracker.sendAppView(view);
    }
}