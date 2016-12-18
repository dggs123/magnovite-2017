var app = app || {};
app.quest = {};

(function() {
    'use strict';

    // run only on quest page
    if (!$(document.body).hasClass('body-quest')) {
        return;
    }

    var $submit = $('.js-button');
    var $answer = $('.js-answer');

    var inProgress = false;

    $answer.on('keydown', function(e) {
        if (e.keyCode === 13) {
            checkAnswer();
        }
    });

    $submit.on('click', checkAnswer);

    /**
     * Called when submit button is clicked,
     * checks if the given answer is correct
     */
    function checkAnswer() {
        if (inProgress) {
            return;
        }

        var answer = $answer.val();
        if (!answer) {
            $answer.focus();
            return;
        }

        inProgress = true;
        NProgress.start();

        $.post('/quest/guess/', {answer: answer})
            .done(function() {
                window.location.reload();
            })
            .fail(function(err) {
                var obj = err.responseJSON;

                switch(obj.status) {
                case 'login':
                    loginFirst();
                    break;

                case 'invalid_answer':
                    wrongAnswer();
                    break;

                default:
                    app.notification.notify({
                        text: obj.message,
                        type: 'error'
                    });
                }

            })
            .always(function() {
                NProgress.done();
                inProgress = false;
            });
    }

    function loginFirst() {
        app.notification.notify({
            text: 'You must login or register first',
            type: 'error'
        });
    }

    function wrongAnswer() {
        $answer.addClass('shake wrong');

        $answer.one(
            'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
            function() {
                $answer.removeClass('shake wrong');
                $answer.val('');
                $answer.focus();
            });
    }

})();
