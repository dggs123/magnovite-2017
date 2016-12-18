var app = app || {};
app.choreographer = {};

(function() {
    'use strict';

    // scrollTop of sectiontwo
    var sectionTwo;

    /**
     * Initializer for choreograhper, must be called after anim
     * loads
     */
    app.choreographer.init = function() {
        document.body.scrollTop = 0;
        sectionTwo = anim.sectionHeight;

        $('.js-down-arrow').on('click', function() {
            scrollTo(document.body, sectionTwo, 250);
        });

        $(document).on('scroll', scrollHandler);
    };

    var scrollHandler = function(e) {
        if ($(document).scrollTop() > (sectionTwo - sectionTwo * (1/5))) {
            initBulb();
            $(document).off('scroll', scrollHandler);
        }
    };

    /**
     * Call the bulbs initizlier
     */
    function initBulb() {
        // now we have scrolled once, so hide the down pointing arrow
        document.body.classList.add('hide-arrow');

        app.bulb.init();
    }

    /**
     * Scroll to the offset on the given element
     * @param  {DOMElemenet} element  element to scroll in
     * @param  {number} to       offset to scroll
     * @param  {number} duration duration of the scroll
     */
    // http://stackoverflow.com/questions/4770025/how-to-disable-scrolling-temporarily
    function scrollTo(element, to, duration) {
        var start = element.scrollTop,
            change = to - start,
            currentTime = 0,
            increment = 5;

        var animateScroll = function(){
            currentTime += increment;
            var val = Math.easeInOutQuad(currentTime, start, change, duration);
            element.scrollTop = val;
            if(currentTime < duration) {
                setTimeout(animateScroll, increment);
            }
        };
        animateScroll();
    }

    //t = current time
    //b = start value
    //c = change in value
    //d = duration
    // https://github.com/danro/jquery-easing/blob/master/jquery.easing.js
    Math.easeInOutQuad = function (t, b, c, d) {
        return c*(t/=d)*t*t + b;
    };
})();
