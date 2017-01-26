var app = app || {};
app.dashboard = app.dashboard || {};
app.dashboard.store = {};

(function() {
    'use strict';

    var cache = {};

    /**
     * Returns summaryData
     * @param  {Function} callback callback on success
     * @param  {boolean}   noCache  if true, cache will not be used
     */
    app.dashboard.store.summaryData = function(callback, noCache) {
        if (!noCache && cache['_summary']) {
            return cache['_summary'];
        }

        fetch(function() {
            callback(cache['_summary']);
        })
    }

    app.dashboard.store.eventData = function(title, callback, noCache) {
        function _callback(data) {
            var out = {
                dates: [],
                views: [],
                registrations: []
            }

            data.forEach(function(day) {
                day.events.forEach(function(event) {
                    if (event.title === title) {
                        out.dates.push(day.date);
                        out.views.push(event.views);
                        out.registrations.push(event.registrations);
                    }
                });
            });

            callback(out);
        }

        if (!noCache && cache['_data']) {
            return _callback(cache['_raw']);
        }

        fetch(function() {
            _callback(cache['_raw']);
        });
    }

    /**
     * Gets the event ids from the global DASH
     * @return {Array} array of ids
     */
    function eventIds() {
        var ids = [];
        window.DASH['events'].forEach(function(event) {
            ids.push(event.id);
        });

        return ids;
    }

    function fetch(callback) {
        app.dashboard.api.getAnalytics(eventIds(), function(data) {
            buildCache(data);
            callback();
        });
    }

    function buildCache(raw) {
        // build summary data
        var out = {
            dates: [],
            events: {},
        };

        var summary = {
            registrations: [],
            views: [],
        };

        raw.sort();

        raw.forEach(function(day) {
            out.dates.push(day.date);
            summary.registrations.push(0);
            summary.views.push(0);

            day.events.forEach(function(event) {
                if (!out.events[event.title]) {
                    out.events[event.title] = {
                        registrations: [],
                        views: []
                    };
                }

                var obj = out.events[event.title];

                obj.registrations.push(event.registrations);
                obj.views.push(event.views);

                summary.registrations[summary.registrations.length-1]
                    += event.registrations;
                summary.views[summary.views.length-1]
                    += event.views;
            });
        });

        summary.dates = out.dates;

        // cache
        cache['_time'] = new Date();
        cache['_raw'] = raw;
        cache['_data'] = out;
        cache['_summary'] = summary;
    }

})();
