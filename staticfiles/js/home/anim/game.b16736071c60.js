var anim = anim || {};

(function() {
    'use strict';

    var mCanvas, mContext;

    var mAtoms;
    var mNumAtoms = 30;

    var mLetters;
    var mText = 'CUFX';
    var mExternalEdges;

    // DOM references
    var $timer;
    var $progressMaxBars;
    var $progressCurrBars;
    var $scoreCurrent;
    var $scoreBest;

    // stopwatch
    var MAX_TIME = 1 * 60 * 1000;
    var mStartTime;

    var currentCaught;
    var maxCaught;
    var currentTimeDiff;

    // timing delays
    var ATOM_MIN_DELAY = 1000;
    var ATOM_VAR_DELAY = 1000;
    var ENERGY_DELAY = 2000;

    var mEnergyDelay;

    // game vars
    // state = ready : not playing but ready to play
    // state = playing : playing the game
    // state = paused : game is paused
    var mState = 'ready';

    /**
     * Game constructor, this will switch to the game mode
     */
    function main(canvas, context) {
        var i;

        mCanvas = canvas;
        mContext = context;

        mAtoms = [];
        mExternalEdges = [];
        currentCaught = 0;
        maxCaught = 0;

        mEnergyDelay = ENERGY_DELAY;
        mState = 'ready';

         // init letters
        mLetters = anim.common.createLetters(canvas, mText);
        mLetters.forEach(function(letter) {
            Array.prototype.push.apply(mExternalEdges, letter.external);
        });

        // init atoms
        for (i = 0; i < mNumAtoms; i++) {
            mAtoms.push(new anim.Atom(canvas,
                ATOM_MIN_DELAY + Math.random() * ATOM_VAR_DELAY, mLetters));
        }

        document.body.classList.remove('logo-mode');
        document.body.classList.add('game-mode');

        document.getElementsByClassName('js-reset')[0].
            addEventListener('click', function(e) {
                e.preventDefault();
                anim.setMode('game');
            });

        document.getElementsByClassName('js-countdown')[0]
            .addEventListener('click', function(e) {
                e.preventDefault();
                anim.setMode('logo');
            });

        $timer = document.getElementsByClassName('js-timer')[0];
        $scoreCurrent = document.getElementsByClassName('js-score-curr')[0];
        $scoreBest = document.getElementsByClassName('js-score-best')[0];

        $progressMaxBars = Array.prototype.slice.call(
            document.getElementsByClassName('js-prog-max'));
        $progressCurrBars = Array.prototype.slice.call(
            document.getElementsByClassName('js-prog-curr'));

        if (anim.gamePlayCount === undefined) {
            anim.gamePlayCount = 0;
        }

        updateCaught();
        updateTimer();
        return draw;
    }

    /**
     * Draws interatom energy lines,
     * Also incorporates a delay {mEnergyDelay} which
     * is used on load to animate the energy lines in
     * gradually
     */
    function interAtomEnergy() {
        if (mEnergyDelay > 0) {
            mEnergyDelay -= 15;
            return;
        }

        var alpha;
        if (mEnergyDelay > -500) {
            alpha = (mEnergyDelay / -500) * 0.2;
            mEnergyDelay -= 15;
        }

        mAtoms.forEach(function(atomA) {
            mAtoms.forEach(function(atomB) {
                if (alpha !== undefined) {
                    anim.common.energyLine(mContext, atomA, atomB, alpha);
                } else {
                    anim.common.energyLine(mContext, atomA, atomB);
                }
            });
        });
    }

    /**
     * handles mouse energy of the atoms
     */
    function mouseEnergy() {
        var pointer = anim.getPointer();
        if (!pointer) {
            return 0;
        }

        // sometimes mouse gets stuck to an edge, so
        // ignore mouse input if too close to edge
        var m = pointer;
        var buffer = 5;
        if (!(m && m.x > buffer && m.x < mCanvas.width - buffer &&
            m.y > buffer && m.y < mCanvas.height - buffer)) {
            return 0;
        }

        // dont draw energy lines during delay
        if (mEnergyDelay > 0) {
            return 0;
        }

        var nCaught = 0;
        mAtoms.forEach(function(atom) {
            var caught = anim.common.handleMouse(pointer, atom, mContext);

            if (caught && (mState === 'playing' || mState === 'ready')) {
                nCaught += 1;
                atom.tag(true);

                if (mState !== 'playing') {
                    startGame();
                }
            }
        });

        return nCaught;
    }

    /**
     * Called when the game starts
     */
    function startGame() {
        if (mState !== 'ready') {
            return;
        }

        anim.gamePlayCount++;

        mStartTime = new Date();
        mState = 'playing';
        document.body.classList.add('game-playing');
    }

    /**
     * Called when the game is over
     */
    function gameOver() {
        mState = 'paused';
        gameOverDOM();

        document.body.classList.remove('game-playing');

        // calculate score board
        var maxScore;
        if (typeof(Storage) !== 'undefined') {
            maxScore = localStorage.getItem('maxScore');

            if (!maxScore || maxCaught > maxScore) {
                localStorage.setItem('maxScore', maxCaught);
                maxScore = maxCaught;
            }
        } else {
            maxScore = '-';
        }

        $scoreCurrent.innerHTML = maxCaught;
        $scoreBest.innerHTML = maxScore;
    }

    function draw() {
        var caught;

        mContext.clearRect(0, 0, mCanvas.width, mCanvas.height);

        if (mState !== 'paused') {
            // calculat and draw energies
            interAtomEnergy();
            caught = mouseEnergy();

            mAtoms.forEach(function(atomA) {
                mAtoms.forEach(function(atomB) {
                    atomA.collide(atomB);
                });

                // collide with letters
                mExternalEdges.forEach(function(edge) {
                    var collide = atomA.collideLine(edge);
                    if (mState === 'playing' && collide && atomA.isTagged()) {
                        atomA.color = '#f00';
                        atomA.draw(mContext);
                        gameOver();
                    }
                });
            });
        }

        // draw the atoms
        mAtoms.forEach(function(atom) {
            if (mState !== 'paused') {
                atom.update(mContext);
            }

            atom.draw(mContext);
        });

        if (caught !== currentCaught) {
            currentCaught = caught;
            maxCaught = Math.max(currentCaught, maxCaught);

            updateCaught();
        }

        // draw the letters
        mLetters.forEach(function(letter) {
            letter.draw(mContext);
        });

        updateTimer();
    }

    /***
     * DOM Manipulators
     */
    function gameOverDOM(){
        document.body.classList.add('game-over');
    }

    /**
     * Upddates the caught bar
     */
    function updateCaught() {
        var i;
        var width = window.innerWidth;

        var currWidth = currentCaught / mNumAtoms * width;
        var maxWidth = maxCaught / mNumAtoms * width;

        $progressCurrBars.forEach(function($bar) {
            $bar.style.width = currWidth + 'px';
        });

        $progressMaxBars.forEach(function($bar) {
            $bar.style.width = maxWidth + 'px';
        });
    }

    /**
     * Updates the stop watch
     */
    function updateTimer() {
        if (mState === 'paused') {
            return;
        }

        if (!mStartTime || mState !== 'playing') {
            $timer.innerHTML = '0:00:00';
            return;
        }

        var time = 'X:XX:XX';
        var diff, min, sec, mils;

        diff = MAX_TIME - ((new Date()) - mStartTime);
        if (diff <= 0) {
            currentTimeDiff = 0;
            gameOver();
            time = '0:00:00';

        } else {
            currentTimeDiff = diff;

            min = Math.floor(diff / (60 * 1000));
            diff -= min * 60 * 1000;

            sec = '0' + Math.floor(diff / 1000);
            diff -= sec * 1000;

            mils = diff;
            if (mils > 100) {
                mils = Math.floor(mils / 10);
            }

            mils = '0' + mils;

            time = min + ':' + sec.substring(sec.length - 2) +
                ':' + mils.substring(mils.length - 2);
        }

        $timer.innerHTML = time;
    }

    // external interface
    anim.game = {
        main: main
    };

})();
