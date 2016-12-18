var app = app || {};
app.events = {};

(function() {
    'use strict';

    var cultural = true;
    var technical = true;
    var $events;

    app.events.init = function() {
        $events = $('.events-page');

        filterByHash();

        $('.js-technical').on('click', technicalToggle);
        $('.js-cultural').on('click', culturalToggle);

        ['.js-cse', '.js-civil', '.js-mech', '.js-ec'].forEach(function(cls) {
            $(cls).on('click', technicalSubToggle);
        });

        $('.s-right').on('click', tagClicked);
        $(window).on('hashchange', filterByHash);
    };

    function filterByHash() {
        var hash = window.location.hash.substring(1);
        if (hash === 'technical') {
            onlyTechnical();
        } else if (hash === 'cultural') {
            onlyCultural();
        } else {
            showAll();
        }
    }

    function showAll() {
        console.log($events);
        $events.addClass([
            'filter-cse', 'filter-ec',
            'filter-civil', 'filter-mech',
            'filter-cultural', 'filter-technical'
        ].join(' '));
    }

    function onlyTechnical() {
        $events.addClass([
            'filter-cse', 'filter-ec',
            'filter-civil', 'filter-mech',
        ].join(' '));

        $events.removeClass('filter-cultural');
    }

    function onlyCultural() {
        $events.removeClass([
            'filter-cse', 'filter-ec',
            'filter-civil', 'filter-mech',
            'filter-technical'
        ].join(' '));

        $events.addClass('filter-cultural');
    }

    function tagClicked(e) {
        if (!$(e.target).hasClass('tag')) {
            return;
        }

        $events.removeClass([
            'filter-cse', 'filter-ec',
            'filter-civil', 'filter-mech',
            'filter-cultural'
        ].join(' '));

        $events.addClass('filter-' + e.target.classList[1]);
    }

    function culturalToggle(e) {
        $events.toggleClass('filter-cultural');
        cultural = !cultural;
    }

    function technicalToggle(e) {
        var fn;

        if (technical) {
            fn = $events.removeClass;
        } else {
            fn = $events.addClass;
        }

        fn.call($events, 'filter-cse filter-ec filter-civil filter-mech filter-technical');

        technical = !technical;
    }

    function technicalSubToggle(e) {
        var li = $(e.target).closest('li');

        var filter;
        li.attr('class').split(' ').forEach(function(cls) {
            if (cls.indexOf('js') !== -1) {
                filter = cls.substring(3);
            }
        });

        $events.toggleClass('filter-' + filter);
    }

})();
