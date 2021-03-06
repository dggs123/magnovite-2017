var app = app || {};
app.workshop = {};

(function() {
    'use strict';

    var inProgress = false;
    $('.js-register').on('click', function(e) {
        if (inProgress) {
            return;
        }
        var isRegistered=false;
        var $target = $(e.target).closest('.js-register');
        var $body = $('body');
        var wname = $target.data('wname');
        var type = $target.data('type');
        var params = $target.data('params');
        $target.addClass('deactive');
        if(type != "Register")
        {
            isRegistered = true;
        }

        if (isRegistered) {
            app.notification.notify({
                        text: "Rule#2: Register Already? Please Don't Register Again",
                        type: 'error',
                });
        }
        else{
        app.notification.notify({
            text: 'Are You Sure You Want To Register In ' + wname,
            type: 'info',
            action: 'Yes',
            actionCallback: function() {
                register_workshop();
            }
        });
        }

    function register_workshop(){
        inProgress = true;
        NProgress.start();

        if (isRegistered) {
            app.notification.notify({
                        text: "Rule#2: Register Already? Please Don't Register Again",
                        type: 'error',
                });
            NProgress.done();
            inProgress = false;
        } else {
            registerSingle();
        }
    }


    /**
     * Handle registration for a single person event
     */
    function registerSingle() {
        NProgress.start();
        inProgress = true;

        $.post('/workshops/api/register/' + params + '/')
            .done(function() {
                $body.find('.js-register').text('Multiple Registerations Are Not Allowed');
                $body.find('.js-register').data('type','Unregister');
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
        app.notification.notify({
            text: 'Participants will be notified about the dates and venues via email/sms.',
            type: 'info'
        });
    }

})();
