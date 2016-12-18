var app = app || {};

(function() {
    'use strict';

    // guard block
    if (!$(document.body).hasClass('page-profile')) {
        return;
    }

    var $input = $('.message.input');
    var $form = $input.find('#message-form');
    var $textarea = $form.find('textarea');
    var messageTemplate = $('#message-me-template').html();

    var apiLock = false;

    $input.on('click', function(e) {
        $textarea.focus();
        $input.addClass('active');
    });

    $textarea.on('blur', function(e) {
        if ($textarea.val().trim() === '') {
            $input.removeClass('active');
            $textarea.val('');
        }
    });

    $form.on('submit', function(e) {
        e.preventDefault();
        if (apiLock) {
            return;
        }

        var val = $textarea.val();

        if (val === '') {
            $textarea.click();
            return;
        }

        NProgress.start();
        apiLock = true;

        $.post($form.attr('action'), $form.serialize())
            .done(function() {
                var _html = messageTemplate.replace('[[text]]', val);
                _html = _html.replace('[[timestamp]]', 'Just now');
                $(_html).insertAfter($input);

                $textarea.val('');
                $textarea.blur();
                $input.removeClass('active');
            })
            .fail(function(err) {
                var obj = err.responseJSON;
                if (obj) {
                    app.notification.notify({
                        text: obj.errorMessage,
                        type: 'error'
                    });
                    return;
                }

                app.notification.notify({
                    text: 'Sorry, Something went wrong. please try again later',
                    type: 'error'
                });
            })
            .always(function() {
                NProgress.done();
                apiLock = false;
            });
    });

})();
