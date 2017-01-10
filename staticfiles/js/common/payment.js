var app = app || {};
app.payments = {};

(function() {
    'use strict';

    var GENERATE_URL = '/payment/generate/';

    var inProgress = false;
    $('.js-pay').on('click', function(e) {
        if (inProgress) {
            return;
        }

        inProgress = true;
        NProgress.start();

        var $target = $(e.target).closest('.js-pay');

        $target.addClass('deactive');
        var type = $target.data('type');
        var params = $target.data('params') || '';
        if (params) {
            params = '?' + params;
        }

        $.get(GENERATE_URL + type + '/' + params)
            .done(function(html) {
                $(html).appendTo(document.body).hide().submit();

                NProgress.set(0.9);
            })
            .fail(function(err) {
                var obj = err.responseJSON || {};

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

                } else {
                    var msg = obj.errorMessage || 'There was an error, if it persists please reach out to us in Help section';
                    app.notification.notify({
                        text: msg,
                        type: 'error',
                        persistant: true
                    });
                }

                NProgress.done();
                inProgress = false;
                $target.removeClass('deactive');
            });
    });

})();
