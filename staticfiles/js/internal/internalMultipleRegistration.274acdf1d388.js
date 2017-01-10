(function() {
    'use strict';

    if (!$(document.body).hasClass('js-multiple-registration')) {
        return;
    }

    var sendingdata = false;
    $('.js-submit').on('click', function(e) {
        e.preventDefault();

        if (sendingdata) {
            return;
        }

        sendingdata = true;

        $('.js-errorlist').html('');

        if (checkedTeam.length === 0 && checkedGroup.length === 0) {
            showError('form', ['Please chose an event']);

            sendingdata = false;
            return;
        }

        var pack = 'none';
        if (checkedTeam.length === 1) {
            pack = 'single';
        } else if (checkedTeam.length > 1) {
            pack = 'multiple';
        }

        var hasError = false;
        if ($('#leader-name').val().trim() === '') {
            showError('leader-name', ['This field cant be empty']);
            hasError = true;
        } else if ($('#leader-college').val().trim() === '') {
            showError('leader-college', ['This field cant be empty']);
            hasError = true;
        } else if ($('#leader-mobile').val().trim() === '') {
            showError('leader-mobile', ['This field cant be empty']);
            hasError = true;
        }

        if (hasError) {
            sendingdata = false;
            return;
        }

        var members = [{
            'name': $('#leader-name').val(),
            'college': $('#leader-college').val(),
            'mobile': $('#leader-mobile').val(),
            'email': $('#leader-email').val()
        }].concat(
            $('.js-member-row')
                .filter(function() {
                    return $(this).find('input[name=name]').val().trim() !== '';
                })
                .map(function() {
                    return {
                        'name': $(this).find('input[name=name]').val(),
                        'college': $(this).find('input[name=college]').val(),
                    };
                })
                .toArray()
        );

        var out = {
            'events': $(checkedTeam.concat(checkedGroup)).map(function() {
                return this.id;
            }).toArray(),
            'pack': pack,
            'members': members
        };

        NProgress.start();
        $.post('/internal/api/register-team/', JSON.stringify(out))
            .done(function(resp) {
                var html = '';
                $(resp.data).each(function() {
                    html += '<li><p>' + this.name + ' - ' + this.id + '</p></li>';
                });

                $('.js-summary-ul').html(html);
                $('.js-user-summary').addClass('visible');
            })
            .fail(function(err) {
                var obj = err.responseJSON;

                if (!obj || !obj.errors) {
                    showError('form', ['There was an unexpected error']);
                    return;
                }

                $.each(obj.errors, function(i, el) {
                    showError(i, el);
                });
            })
            .always(function() {
                NProgress.done();
                sendingdata = false;
            });
    });

    var checkedTeam = [];
    var checkedGroup = [];

    $('.js-event-item input[type=checkbox]').on('change', function(e) {
        var $event = $(e.target).closest('.js-event-item');

        var isChecked = $event.find('input[type=checkbox]:checked').length === 1;
        var fn = isChecked ? insert : remove;

        var obj = {
            'id': +$event.data('id'),
            'min': +$event.data('min'),
            'max': +$event.data('max')
        };

        if ($event.data('type') === 'team') {
            fn(checkedTeam, obj);
        } else {
            fn(checkedGroup, obj);
        }

        updateMembers();
        updatePrice();
    });

    $(document).delegate('.js-member-row input[name=name]', 'change', updatePrice);
    function updatePrice() {
        var html = '', price = 0;

        var nTeam = checkedTeam.length;
        var nGroup = checkedGroup.length;

        var members = $('.js-member-row').find('input[name=name]').filter(function() {
            return !!this.value;
        }).length + 1;

        if (nTeam === 1) {
            price += 100 * members;
            html += '<li><p class="price">' + (100 * members) + '</p> Single Pack x ' + members + '</li>';

        } else if (nTeam > 1) {
            price += 200 * members;
            html += '<li><p class="price">' + (200 * members) + '</p> Multiple Pack x ' + members + '</li>';
        }

        if (nGroup > 0) {
            price += 500 * nGroup;
            html += '<li><p class="price">' + (500 * nGroup) + '</p> Group Events x ' + nGroup + '</li>';
        }

        html += '<li class="total"><p class="price">' + price + '</p> Total</li>';
        $('.js-amount').html(html);
    }

    $(document).delegate('.js-member-row input[name=name]', 'focus', function(e) {
        var $event = $(e.target).closest('.js-member-row');

        var college = $('#leader-college').val();
        var mobile = $('#leader-mobile').val();

        var $college = $event.find('input[name=college]');
        var $mobile = $event.find('input[name=mobile]');

        if ($college.val().trim() === '') {
            $college.val(college);
        }
    });

    var shownMembers = 0;

    function updateMembers() {
        // because teamleader is already counted
        var min = getMinMembers() - 1;
        var max = getMaxMembers() - 1;
        var i, count;

        if (shownMembers < max) {
            count = max - shownMembers;
            for (i = 0; i < count; i++) {
                addMemberRow();
            }
        }

        if (shownMembers > max) {
            count = shownMembers - max;
            for (i = 0; i < count; i++) {
                removeMemberRow();
            }
        }
    }

    function addMemberRow() {
        var template = $('#memberInputTemplate').html();

        var $html = $(render(template, {num: shownMembers+2}));
        $('.js-team-members').append($html);

        shownMembers++;
    }

    function removeMemberRow() {
        $('.js-team-members').find('.js-member-row').last().remove();

        shownMembers--;
    }

    function getMinMembers() {
        var min = 0;
        var arr = checkedTeam.concat(checkedGroup);

        for (var i = 0; i < arr.length; i++) {
            if (min < arr[i].min) {
                min = arr[i].min;
            }
        }

        return min;
    }

    function getMaxMembers() {
        var max = 0;
        var arr = checkedTeam.concat(checkedGroup);

        for (var i = 0; i < arr.length; i++) {
            if (max < arr[i].max) {
                max = arr[i].max;
            }
        }

        return max;
    }

    /**
     * Renders the given template string using the object
     * @param  {String} tempString HTML template string [[vars]]
     * @param  {Object} obj        Object whose keys will be replaced with [[key]] in the template
     * @return {String}            Rendered HTML String
     */
    function render(tempString, obj) {
        var template = tempString;

        $.each(obj, function(key,value) {
            template = template.replace(new RegExp('\\[\\[' + key + '\\]\\]','g'), value);
        });
        return template;
    }

    /**
     * Insert into @array if an obj with @id does not exist in it
     */
    function insert(array, obj) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id === obj.id) {
                return;
            }
        }

        array.push(obj);
        return array;
    }

    /**
     * Remove from @array if an object with @id exists in it
     */
    function remove(array, obj) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].id === obj.id) {
                array.splice(i, 1);
            }
        }

        return array;
    }

    /**
     * Show Errors in the DOM, expects a ul with class js-errorlist to be adjacent
     * to the element whose @id is given
     *
     * @param  {string}         id        The id of element which the error belongs to
     * @param  {Array[String]}  errorMsgs Array of strings
     */
    function showError(id, errorMsgs) {
        // general case seperately

        var $el = $('#' + id).siblings('.js-errorlist');

        var html = '';
        $.each(errorMsgs, function(i, val) {
            html += '<li>' + val + '</li>';
        });

        $el.html(html);

        // scroll to the element - offsetvalue (in px)
        var scrollPos = $('#' + id).position().top - 30;

        // make sure we only scroll up (i.e the topmost error will be focused)
        if ($(window).scrollTop() > scrollPos) {
            $(window).scrollTop(scrollPos);
            $el.focus();
        }

    }

})();
