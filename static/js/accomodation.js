var app = app || {};
app.accomodation = {};

(function() {
    'use strict';
    var inProgress = false;
	app.accomodation.init = function() {
		if (inProgress) {
            return;
        }
        NProgress.start();
        inProgress = true;

        $.post('/accomodation/api/')
            .done(function() {
                showSuccessNotification();
            })
            .fail(function(err) {
                var obj = err.responseJSON;
                if (!obj) {
                    app.notification.notify({
                        text: 'Something went wrong! Please try again later',
                        type: 'error'
                    });
                    return;
                }

                app.notification.notify({
                    text: obj.errorMessage,
                    type: 'error'
                });
            })
            .always(function() {
                NProgress.done();
                inProgress = false;
            });

	}  
	function showSuccessNotification() {
        app.notification.notify({
            text: 'Thank you for submission\nFor More Details Cantact here:\nsam96.sharma@gmail.com',
            type: 'info',
            persistant: true
        });
    }  


})();