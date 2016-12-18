var app = app || {};

(function() {
    'use strict';

    // check if browser is chrome
    var isChromium = window.chrome,
    vendorName = window.navigator.vendor;
    app.chrome = isChromium !== null && isChromium !== undefined && vendorName === "Google Inc.";

})();

$(function() {
    'use strict';

    if (app.mobile) {
        var visited = window.localStorage.getItem('magnovite:visited');
        if (visited == undefined){
            app.notification.notify({
                text: 'This website is best viewed and used on a desktop',
                type: 'warn',
                persistant: true
            });    
        }
        window.localStorage.setItem('magnovite:visited',true);
        

    } else if (!app.chrome) {
        var notify = true;

        if (Modernizr.localstorage) {
            var count = window.localStorage.getItem('magnovite:browser-warn') || 0;
            count = window.parseInt(count, 10);

            // we will warn them only thrice
            if (count >= 2) {
                notify = false;
            } else {
                window.localStorage.setItem('magnovite:browser-warn', count + 1);
            }
        } else {
            // no local storage, Crappy browser anyway. So
            // might as well annoy them a bit.  TODO: be nice
        }

        if (notify) {
            app.notification.notify({
                text: 'For the best experience on this website, please use Google Chrome',
                type: 'warn',
                persistant: true
            });
        }
    }
});
