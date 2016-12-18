var app = app || {};
app.bulb = {};

(function() {
    'use strict';

    var $hexagon = document.querySelector('.hexagon');
    var $bulbSection = document.querySelector('.bulb-section');

    // the classList last added
    var lastClicked = 'default';
    var lastOutClass;

    // timeout for hover
    var hoverTimeout;

    /**
     * Pause default pane coming up after sometime
     */
    app.bulb.pauseDefaultDelay = function() {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }
    };

    /**
     * Resumes the behaviour of default pane coming up after sometime
     */
    app.bulb.resumeDefaultDelay = function(ms) {
        startDefaultDelay(null, ms || 2000);
    };

    /**
     * Initializes the bulb
     * @return {number} number of ms bulb needs to initialize
     */
    app.bulb.init = function() {
        // time needed for hexagon animations
        var hexLines = 400 * 2;
        var hexM = 1800;

        // time needed for pane split animation
        var splitPane = 300 + 600;

        $hexagon.classList.add('hex-load');

        setTimeout(function() {
            $bulbSection.classList.remove('preload');
            $bulbSection.classList.add('loaded');

        }, hexLines + hexM);

        // set up bulb section hovers
        var $circles = Array.prototype.slice.call($hexagon.querySelectorAll('.circle'));
        $circles.forEach(function(circle) {
            circle.addEventListener('mouseover', handleHover);
        });

        $circles.forEach(function(circle) {
            circle.addEventListener('mouseout', startDefaultDelay);
        });

        return hexLines + hexM + splitPane;
    };

    /**
     * When the mouse hovers over a circle
     */
    function handleHover(e) {
        var target = e.target;
        var el = target;

        app.bulb.pauseDefaultDelay();

        if (target.classList.contains('cover')) {
            el = target.parentElement;
        }

        var sectionClass = el.dataset.type;
        if (sectionClass === lastClicked) {
            return;
        }

        if (lastClicked) {
            $bulbSection.classList.remove(lastClicked);

            if (lastOutClass) {
                $bulbSection.classList.remove(lastOutClass);
            }

            $bulbSection.classList.add(lastClicked + '-out');
            lastOutClass = lastClicked + '-out';
        }

        lastClicked = sectionClass;
        $bulbSection.classList.add(sectionClass);
    }

    /**
     * Sets a seconds delay for the pane to change to default
     * @param  {DOMEvent} e DOMEvent, not required
     * @return {number} time time to wait for in ms (optional)
     */
    function startDefaultDelay(e, time) {
        if (time === undefined) {
            time = 10000;
        }

        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
        }

        // goto default pane if no hovers in set time
        hoverTimeout = setTimeout(function() {
            $bulbSection.classList.remove(lastOutClass);

            $bulbSection.classList.add(lastClicked + '-out');
            lastOutClass = lastClicked + '-out';

            $bulbSection.classList.remove(lastClicked);

            $bulbSection.classList.add('default');
            lastClicked = 'default';
        }, time);
    }

})();
