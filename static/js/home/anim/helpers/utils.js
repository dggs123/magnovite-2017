var anim = anim || {};

(function() {
    'use strict';

    anim.util = {};

    anim.util.captureMouse = function(el) {
        var mouse = {x: 0, y:0};

        el.addEventListener('mousemove', function(e) {
            var x, y;

            if (e.pageX || e.pageY) {
                x = e.pageX;
                y = e.pageY;
            } else {
                x = e.clientX + document.body.scrollLeft +
                        document.documentElement.scrollLeft;
                y = e.clientY + document.body.scrollTop +
                        document.documentElement.scrollTop;
            }

            x -= el.offsetLeft;
            y -= el.offsetTop;

            mouse.x = x;
            mouse.y = y;
        }, false);

        el.addEventListener('mouseout', function(e) {
            mouse.x = NaN;
            mouse.y = NaN;
        });

        return mouse;
    };

    /**
     * https://github.com/lamberta/html5-animation/blob/master/examples/include/utils.js
     * Keeps track of the current (first) touch position, relative to an element.
     * @param {HTMLElement} element
     * @return {object} Contains properties: x, y, isPressed, event
     */
    anim.util.captureTouch = function (element) {
        var touch = {x: null, y: null, isPressed: false, event: null},
        bodyScrollLeft = document.body.scrollLeft,
        elementScrollLeft = document.documentElement.scrollLeft,
        bodyScrollTop = document.body.scrollTop,
        elementScrollTop = document.documentElement.scrollTop,
        offsetLeft = element.offsetLeft,
        offsetTop = element.offsetTop;

        element.addEventListener('touchstart', function (event) {
            touch.isPressed = true;
            touch.event = event;
        }, false);

        element.addEventListener('touchend', function (event) {
            touch.isPressed = false;
            touch.x = null;
            touch.y = null;
            touch.event = event;
        }, false);

        element.addEventListener('touchmove', function (event) {
            var x, y,
            touchEvent = event.touches[0]; //first touch

            if (touchEvent.pageX || touchEvent.pageY) {
                x = touchEvent.pageX;
                y = touchEvent.pageY;
            } else {
                x = touchEvent.clientX + bodyScrollLeft + elementScrollLeft;
                y = touchEvent.clientY + bodyScrollTop + elementScrollTop;
            }
            x -= offsetLeft;
            y -= offsetTop;

            touch.x = x;
            touch.y = y;
            touch.event = event;
        }, false);

        return touch;
    };

    anim.util.forEachObj = function(obj, callback) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                callback(key, obj[key]);
            }
        }
    };

})();
