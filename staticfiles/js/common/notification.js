var app = app || {};
app.notification = {};

(function() {
    'use strict';

    var _id = 0;
    var template = $('#notification-template').html();

    var callbacks = {};

    var $tray = $('.notifications');

    /**
     * Renders a template string
     * @param  {string} str A html template string
     * @param  {object} obj key value to be interpolated
     * @return {DOMNode}    Rendered DOM nodes for template
     */
    function render(str, obj) {
        $.each(obj, function(key, val) {
            str = str.replace(new RegExp('\\[\\[' + key + '\\]\\]', 'g'), val);
        });

        return $(str);
    }

    /**
     * Shows a notification based on the options
     * @param {object} options An options object
     * @return {number} Notification ID
     */
    app.notification.notify = function(options) {

        var defaultOptions = {
            text: '',
            action: '',
            actionCallback: null,

            type: 'info',
            hasAction: false,
            persistant: false,
            time: 5000,
            id: _id++
        };

        var opt = $.extend(defaultOptions, options);

        if (opt.action === '') {
            opt.actionClass = 'no-action';
        }

        var $html = render(template, opt);
        $tray.append($html);

        window.setTimeout((function($el) {
            return function() {
                $el.addClass('active');
            };
        })($html), 50);

        if (!opt.persistant) {
            window.setTimeout((function(id) {
                return function() {
                    app.notification.done(id);
                };
            })(opt.id), opt.time);
        }

        if (opt.actionCallback) {
            callbacks[opt.id] = opt.actionCallback;
        }

        return opt.id;
    };

    /**
     * Removes notification with given id
     * @param  {number}   id The notification id
     */
    app.notification.done = function(id) {
        var $el = $('.notification[data-id=' + id + ']');
        $el.removeClass('active');

        window.setTimeout((function($el) {
            return function() {
                $el.remove();
            };
        })($el), 400);
    };

    $(document).on('click', '.js-notif-close', function(e) {
        var id = $(e.target).parent().data('id');

        app.notification.done(id);
    });

    $(document).on('click', '.js-notif-action', function(e) {
        var id = $(e.target).parent().data('id');

        if (id in callbacks) {
            callbacks[id]();
            delete callbacks[id];
        }
    });

})();
