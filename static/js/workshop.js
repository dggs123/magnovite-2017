var app = app || {};
app.workshop = {};

(function() {
    'use strict';

    var inProgress = false;
    $('.js-register').on('click', function(e) {
        if (inProgress) {
            return;
        }

        inProgress = true;
        NProgress.start();
        isRegistered=false;

        var $target = $(e.target).closest('.js-register');

        $target.addClass('deactive');
        var type = $target.data('type');
        var params = $target.data('params');
        if(type === "Unregister")
        {
            isRegistered = true
        }

        if (isRegistered) {
            app.notification.notify({
                        text: "Sorry Christite Unregister Option is not allowed",
                        type: 'error',
                });
        } else {
            registerSingle();
        }


    /**
     * Handle registration for a single person event
     */
    function registerSingle() {
        NProgress.start();
        inProgress = true;

        $.post('/workshop/api/register/' + params + '/')
            .done(function() {
                $target.data('type','Unregister')
                $target.text('Registered');

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
    });

    function showSuccessNotification() {
        app.notification.notify({
            text: 'You have success fully registered. See your schedule.',
            type: 'info',
            action: 'View Schedule',
            actionCallback: function() {
                window.location.replace('/profile/#schedule');
            }
        });
    }

})();
