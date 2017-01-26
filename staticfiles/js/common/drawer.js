var app = app || {};

(function() {
    'use strict';

    if (!app.mobile) {
        return;
    }

    $('.js-drawer').on('click', function(e) {
        openDrawer();
        e.preventDefault();
    });

    var scrollable = false;
    var $menu = $('.slide-menu');
    if ($menu.height() > window.innerHeight) {
        $menu.addClass('scrollable');
        $menu.height(window.innerHeight);
        scrollable = true;
    }

    function openDrawer() {
        $(document.body).addClass('slide-menu-active');
        $(document.body).on('touchmove', cancelEvent);

        $(document.body).delegate('.slide-menu a, .slide-menu-cover',
                'click', closeDrawer);

        $('.js-slide-close').on('click', closeDrawer);
    }

    function closeDrawer() {
        $(document.body).removeClass('slide-menu-active');
        $(document.body).off('touchmove', cancelEvent);
    }

    function cancelEvent(e) {
        var isMenu = $(e.target).closest('.slide-menu').length != 0;
        if (!scrollable || !isMenu) {
            e.preventDefault();
            return;
        }
    }
})();
