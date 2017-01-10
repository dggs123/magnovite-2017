var app = app || {};

(function() {
    'use strict';

    var magnoviteDate = new Date(2016, 1, 20);

    app.Timer = function() {
        this.tick();

        var timeout = 1 * 1000;
        if (app.mobile) {
            timeout = 15 * 1000;
        }

        window.setInterval(this.tick, timeout);
    };

    /**
     * Returns num as a binary string of length 6
     */
    function toBinary(num) {
        var bin = num.toString(2);

        var padding = 6 - bin.length;
        var output = '';
        for (var i = 0; i < padding; i++) {
            output += '0';
        }

        return output + bin;
    }

    /**
     * Update number on the column
     * {arg binCol} dom node to column
     * {arg value} the value to set, must be a digit
     */
    function updateNum(binCol, value) {
        var dots = binCol.getElementsByClassName('dot');
        dots = Array.prototype.slice.call(dots, 0).reverse();

        var bin = toBinary(value).split('').reverse().join('');
        for (var i = 0; i < dots.length; i++) {
            if (i < bin.length) {
                dots[i].classList.toggle('on', bin[i] === '1');
            } else {
                dots[i].classList.remove('on');
            }
        }
    }

    /**
     * Updates the timer block, given a DOM reference
     * to the block and the value to update to
     */
    function updateTimerBlock(block, value, type) {
        var el = block.getElementsByClassName('numeric')[0];
        el.innerHTML = value;

        // update binary block
        var cols = block.getElementsByClassName('bin-col');
        if (type === 'months') {
            updateNum(cols[0], value);
        } else {
            // two digits
            updateNum(cols[1], value % 10);
            updateNum(cols[0], Math.floor(value / 10));
        }
    }

    /**
     * Updates the seconds and minutes
     */
    app.Timer.prototype.tick = function() {
        var diff = countdown(magnoviteDate);

        /** Show all values as zero / cause countdown expired */
        if (window.MAG_TIMER_ZERO) {
            diff.months = diff.days = diff.hours = diff.minutes = diff.seconds = 0;
        }

        var blocks = document.getElementsByClassName('timer-block');
        updateTimerBlock(blocks[0], diff.months, 'months');
        updateTimerBlock(blocks[1], diff.days);
        updateTimerBlock(blocks[2], diff.hours);
        updateTimerBlock(blocks[3], diff.minutes);

        /*
         * We dont display seconds in mobile because of a huge
         * performance error
         * FIXME
         */
        if (!app.mobile) {
            updateTimerBlock(blocks[4], diff.seconds);
        }
    };

 })();
