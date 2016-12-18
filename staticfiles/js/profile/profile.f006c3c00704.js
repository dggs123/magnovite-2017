var app = app || {};
app.profile = {};

(function() {
	'use strict';

	app.profile.init = function() {
        $('#profile-form').on('submit', formSubmit);

        hospBtnClick();
        $('.js-hosp-btn').on('click', hospBtnClick);
	};

    /**
     * Clicked on +1 or -1 btn
     */
    function hospBtnClick(e) {
        var currentDays = +$('.js-hosp-numdays').text();
        var $hospNumdays = $('.js-hosp-numdays');

        var paidDays = +$hospNumdays.data('paiddays');

        if (e !== undefined) {
            var type = $(e.target).data('type');
            if (type === 'plus' && currentDays >= 6 ||
                type === 'minus' && (currentDays <= 1 || currentDays <= paidDays+1)) {
                return;
            }

            if (type === 'plus') {
                currentDays += 1;
            } else {
                currentDays -= 1;
            }
        }

        $('.js-hosp-btn').removeClass('deactive');

        if (currentDays === 6) {
            $('.js-hosp-btn[data-type=plus]').addClass('deactive');

        }
        if (currentDays === 1 || currentDays <= paidDays + 1) {
            $('.js-hosp-btn[data-type=minus]').addClass('deactive');
        }

        $('.js-hosp-daystext').text('day' + (currentDays === 1 ? '' : 's'));
        $hospNumdays.text(currentDays);
        $('.js-hosp-amount').text((currentDays - paidDays) * 150);
        $('.js-hosp-pay').data('params', 'days=' + currentDays);

        if (paidDays !== 0 && currentDays !== paidDays) {
            $('.js-hosp-daysextra').text('(' + (currentDays - paidDays) + ' extra)');
        } else {
            $('.js-hosp-daysextra').text('');
        }
    }

    function clearErrors() {
        $('.errorlist').html('');
    }

    function formSubmit(e) {
        e.preventDefault();
        NProgress.start();

        var form = $(e.target);

        $.post(
            form.attr('action'),
            form.serialize()

        ).done(function(data) {
            clearErrors();

            // if everything is filled make sure the show-warn
            // class is removed
            var filled = true;
            ['name', 'active_email', 'mobile', 'college']
                .forEach(function(key) {
                    if ($('input[name=' + key + ']').val() === '') {
                        filled = false;
                    }
                });

            $('.profile-scene').toggleClass('show-warn', !filled);

        }).fail(function(err) {
            clearErrors();
            var data = err.responseJSON;
            $.each(data.errors, function(key, val) {
                var el = $('input[name=' + key + ']');
                window.el = el;
                el.next('.errorlist').append('<li>' + val[0] + '</li>');
            });

        }).always(function() {
            NProgress.done();
        });
    }

})();
