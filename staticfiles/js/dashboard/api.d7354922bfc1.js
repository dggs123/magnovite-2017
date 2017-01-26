var app = app || {};
app.dashboard = app.dashboard || {};
app.dashboard.api = {};

(function() {
    'use strict';

    var analyticsLock = false;

    /**
     * Gets analytics data from the server
     * @param  {array} ids array of ids to fetch
     * @param {function} callback callback on success
     */
    app.dashboard.api.getAnalytics = function(ids, callback) {
        var idsStr = ids.join(',');

        analyticsLock = true;
        NProgress.start();

        $.get('/dashboard/api/analytics/?ids=' + idsStr)
            .done(function(data) {
                callback(data);
            })
            .fail(function() {
                app.notification.notify({
                    text: 'Sorry! There was an error',
                    type: 'error',
                });
            })
            .always(function() {
                analyticsLock = false;
                NProgress.done();
            });
    }

})();
