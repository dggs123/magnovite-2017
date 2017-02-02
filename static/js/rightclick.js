var app = app || {};
app.rightclick = {};

(function() {
    'use strict';

    var isRegistered;

    // make sure we dont send more than one request at a time
    var inProgress = false;

    // app.CURRENT_EVENT_ID must be set before this script
    var $registerButton;

    app.rightclick.init = function() {
        $registerButton = $('.register-button');

        $registerButton.on('click', handleRegister);
        isRegistered = $(document.body).hasClass('registered') || false;

    };

    /**
     * Handles the registration logic
     * @param  {EventObject} e Event object
     */
    function handleRegister(e) {
        window.open("https://www.1crowd.co/index.php/incubator/registrationForm");
        // if (inProgress) {
        //     return;
        // }

    
        // if (isRegistered) {
        //     unregisterSingle();
        // } else {
        //     registerSingle();
        // }
    }

    /**
     * Handle unregistration for a single person event
     */
    function unregisterSingle() {
        NProgress.start();
        inProgress = true;

        $.post('/rightclick/api/unregister/')
            .done(function() {
                $registerButton.removeClass('registered');
                $registerButton.find('.js-text').text('Register');

                isRegistered = false;
            })
            .fail(function() {
                // alert failure TODO: FIXME
                app.notification.notify({
                    text: 'Could not unregister at this time. Please try again later',
                    type: 'error'
                });
            })
            .always(function() {
                NProgress.done();
                inProgress = false;
            });
    }

    /**
     * Handle registration for a single person event
     */
    function registerSingle() {
        NProgress.start();
        inProgress = true;

        $.post('/rightclick/api/register/')
            .done(function() {
                $registerButton.addClass('registered');
                $registerButton.find('.js-text').text('Unregister');

                showSuccessNotification();

                isRegistered = true;
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

                if (obj.actionType === 'redirect') {
                    app.notification.notify({
                        text: obj.errorMessage,
                        action: obj.actionText,
                        type: 'error',
                        persistant: true,
                        actionCallback: function() {
                            window.location.replace(obj.redirectLocation);
                        }
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
            text: 'You have successfully registered.',
        });
    }

})();
