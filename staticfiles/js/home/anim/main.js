var anim = anim || {};

(function() {
    'use strict';

    var mCanvas;
    var mContext;

    var mPointer;
    var mTouching;

    // ready will be set to true when DOM loaded
    // and we have appropritate width/height
    var mReady = false;

    var mMode;
    var mDrawFn;

    // we want to scale down everything
    for (var shape in anim.shapeData) {
        anim.shapeData[shape].width *= anim.scale;
        anim.shapeData[shape].height *= anim.scale;

        for (var vertice in anim.shapeData[shape].vertices) {
            anim.shapeData[shape].vertices[vertice][0] *= anim.scale;
            anim.shapeData[shape].vertices[vertice][1] *= anim.scale;
        }
    }

    /**
     * Entry point for the landing page animation
     * This is the only external function
     * that needs to be called
     */
    function init() {
        if (!Modernizr.canvas) {
            window.alert('Sorry, we do not support your browser. For a better experience please use' +
                'a more modern browser');
        }

        mCanvas = document.getElementById('canvas');
        mContext = mCanvas.getContext('2d');

        if (window.innerWidth < 767) {
            anim.mobile = true;
        } else {

            anim.desktop = true;
        }

        if (Modernizr.touch) {
            anim.touch = true;
        }

        if (!anim.mobile) {
            // if not mobile, set landings height to browser
            // height, in mobile canvas is equal to browser height
            var landing = document.getElementsByClassName('landing')[0];
            landing.style.height = window.innerHeight + 'px';
            anim.sectionHeight = window.innerHeight;
        }

        if (document.readyState === "complete" || document.readyState === "loaded") {
            _ready();
        } else {
            document.addEventListener('DOMContentLoaded', _ready);
        }

        if (anim.desktop) {
            document.getElementsByClassName('js-start-game')[0].
                addEventListener('click', function(e) {
                    e.preventDefault();

                    setMode('game');
                });
        }
    }

    /**
     * The DOM ready callback
     */
    function _ready() {
        if (anim.touch) {
            mPointer = anim.util.captureTouch(mCanvas);

            // add a 300 ms delay to touch so scrolling smoothly works
            var touchstart;
            mCanvas.addEventListener('touchstart', function() {
                touchstart = new Date();
            });

            mCanvas.addEventListener('touchend', function() {
                mTouching = false;
                touchstart = undefined;
            });

            mCanvas.addEventListener('touchmove', function(e) {
                if (touchstart && (new Date() - touchstart) > 300) {
                    mTouching = true;
                    e.preventDefault();
                }
            });

        } else {
            mPointer = anim.util.captureMouse(mCanvas);
        }

        // set up canvas
        var height = window.innerHeight;
        if (anim.desktop) {
            // we have a 250height timer on desktop
            height -= 250 + 80;
        }

        mCanvas.setAttribute('width', window.innerWidth);
        mCanvas.setAttribute('height', height);

        // goto ready and recall set mode if if it was called
        // and set before we were ready
        mReady = true;
        if (mMode !== undefined) {
            setMode(mMode);
        }

        // register loop and goto ready state
        window.requestAnimationFrame(loop);
    }

    /**
     * This will get called on requestAnimationFrame
     */
    function loop() {
        if (!app.DEBUG) {
            window.requestAnimationFrame(loop);
        }

        if (!mReady || mMode === undefined){
            return;
        }

        // dont draw if canvas is not visible
        if (mCanvas.height < window.scrollY) {
            return;
        }

        mDrawFn();
    }

    function setMode(mode) {
        if (mode === 'game') {
            mDrawFn = anim.game.main(mCanvas, mContext);

        } else if (mode === 'logo') {
            mDrawFn = anim.logo.main(mCanvas, mContext);
        }

        mMode = mode;
    }

    /**
     * Returns undefined or an object with x,y cords
     */
    function getPointer() {
        if (anim.touch && !mTouching) {
            return undefined;
        }

        return mPointer;
    }

    // external interface
    anim.init = init;
    anim.setMode = setMode;
    anim.getPointer = getPointer;

})();
