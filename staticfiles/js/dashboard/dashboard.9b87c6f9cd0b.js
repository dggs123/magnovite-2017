var app = app || {};
app.dashboard = app.dashboard || {};

(function() {
    'use strict';

    if (!$(document.body).hasClass('page-dashboard')) {
        return;
    }

    $('.js-scene-menu').on('click', 'li', function(e) {
        var target = $(e.target).closest('li');
        showView(target.data('view'));
    })

    var summaryChart;
    function showSummaryPage() {
        app.dashboard.store.summaryData(function(obj) {
            summaryChart = showChart('#chart-summary', obj);
        });
    }

    var eventChart;
    function showView(view) {
        if (view === 'summary') {
            showSummaryPage();
            return;
        }

        app.dashboard.store.eventData(view, function(obj) {
            eventChart = showChart('#chart-event', obj);

            $('.event-scene').find('h1').text(view);
        });
    }

    function showChart(el, obj) {
        return c3.generate({
            bindto: el,
            data: {
                x: 'x',
                columns: [
                    ['x'].concat(obj.dates),
                    ['registrations'].concat(obj.registrations),
                    ['views'].concat(obj.views),
                ]
            },
            axis: {
                x: {
                    type: 'timeseries',
                    tick: {
                        format: '%d/%m'
                    }
                }
            }
        });
    }

})();
