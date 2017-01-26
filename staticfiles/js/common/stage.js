(function() {
    'use strict';

    // guard block
    if (!$(document.body).hasClass('stage-view')) {
        return;
    }

    var $menu = $('.js-scene-menu');
    var $scene = $('.s-right');

    var currentView;

    var scenes = [];
    $menu.find('li').each(function(i, li) {
        scenes.push($(li).data('scene') + '-on');
    });

    if (window.location.hash !== '') {
        var view = window.location.hash.substring(1);
        selectView(view + '-scene');
    }

    $(window).on('hashchange', function() {
        var view = window.location.hash.substring(1) + '-scene';
        if (view == currentView) {
            return;
        }

        selectView(view);
    });

    $menu.on('click', 'li', function(e) {
        e.preventDefault();
        var target = $(e.target).closest('li');

        if (!target.data('scene')) {
            return;
        }

        view = target.data('scene');

        selectView(view);
        $menu.find('li').removeClass('selected');
        target.addClass('selected');

        window.location.hash = view.split('-scene')[0];
    });

    function selectView(view) {
        $scene.removeClass(scenes.join(' '));
        $scene.addClass(view + '-on');

        $menu.find('li').removeClass('selected');
        $menu.find('li[data-scene=' + view + ']').first().addClass('selected');

        currentView = view;
    }

})();
