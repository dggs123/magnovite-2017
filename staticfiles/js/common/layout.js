var app = app || {};

(function() {
    'use strict';


    if(app.mobile){
        return
    }
    /**
     * If body has class browser-height set the body's
     * height to the browser height, and adjust on resize
     */
    if ($(document.body).hasClass('browser-height') && app.desktop) {
        $(document.body).height(window.innerHeight);

        var bannerHeight = $('.banner').height() || 0;
        if ($(document.body).hasClass('transparent-banner')) {
            bannerHeight = 0;
        }

        $('.page-container').height(window.innerHeight - bannerHeight);
    }

})();
