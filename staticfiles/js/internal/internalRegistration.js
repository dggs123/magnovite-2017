(function() {
    'use strict';

    if (!$(document.body).hasClass('js-internal-registration')) {
        return;
    }

    var EVENTS = window.EVENTS;

    $(function() {
        populateDOM(EVENTS);
    });

    // /**
    //  * Toggles teamid when event checkboxes change
    //  */
    // $(document).delegate('.js-events', 'change', function(e) {
    //     $(e.target).closest('.event-item').toggleClass('show-teamid');
    // });

    // /**
    //  * Validates teamids on blur of the Teamid fields
    //  */
    // $(document).delegate('.js-teamid', 'blur', function(e) {
    //     var $target = $(e.target);

    //     //clears the error list
    //     $('.js-errorlist').html('');

    //     // valid teamid?
    //     if($target.val() !== "") {
    //         if(!isTeamValid($target.val())) {
    //             var tId = $target.attr('id');
    //             showError(tId, ['Invalid Team Id']);
    //         }
    //     }
    // });

    /**
     * Calculates and displays the price on any change that might affect the price
     */
    $(document).delegate('.js-pack', 'change',calcPrice);
    $(document).delegate('.js-group-events', 'change', calcPrice);
    $(document).delegate('.js-workshop-events', 'change', calcPrice);
    $(document).delegate('.teamid-js-group-events', 'blur', calcPrice);
    function calcPrice() {
        var html = '';
        var packInp = $('.js-pack:checked');
        var price = 0;

        if (packInp.data('type') === 'single') {
            price = 100;
            html += '<li><p class="price">100</p> Single Pack</li>';
        } else if(packInp.data('type') === 'multiple') {
            price = 200;
            html += '<li><p class="price">200</p> Multiple Pack</li>';
        }

        $('.js-group-events:checked').each(function(i, el) {
            if(!$(el).closest('.event-item').find('.js-teamid').val()) {
                price += 500;

                var id = makeId($(el).attr('id'));
                html += '<li><p class="price">500</p> Group Event : ' + getEventTitleById(id) + '</li>';
            }
        });

        $('.js-workshop-events:checked').each(function(i, el) {
            var workshopPrice = $(el).data('price');
            price += workshopPrice;

            var id = makeId($(el).attr('id'));
            html += '<li><p class="price">' + workshopPrice + '</p> Workshop : ' + getWorkshopTitleById(id) + '</li>';
        });

        html += '<li class="total"><p class="price">' + price + '</p> Total </li>';

        $('.js-amount').html(html);
    }

    /**
     * Populates the dom using the given @events object
     * @param  {Object} events Object which contains details of events
     */
    function populateDOM(events) {
        var singleTemplate = $('#singleTemplate').html();
        var multiTemplate = $('#teamTemplate').html();

        function renderEvents(arrEvents, cssclass) {
            var htmlString = '';

            $.each(arrEvents, function(i, eventObj) {
                eventObj.cssclass = cssclass || '';

                if (eventObj.closed) {
                    eventObj.closed = 'Closed';
                } else {
                    eventObj.closed = '';
                }

                if(eventObj.is_team) {
                    htmlString += render(multiTemplate, eventObj);

                } else {
                    htmlString += render(singleTemplate, eventObj);
                }
            });

            return htmlString;
        }

        $('.js-events-technical').append(renderEvents(events.technical, 'js-tech-events'));
        $('.js-events-cultural').append(renderEvents(events.cultural, 'js-cult-events'));
        $('.js-events-group').append(renderEvents(events.group, 'js-group-events'));
        $('.js-events-workshop').append(renderEvents(events.workshop, 'js-workshop-events'));

        calcPrice();
    }

    /**
     * Handles form submit
     */
    var sendingData = false;
    $('.js-submit').on('click', function(e) {
        e.preventDefault();

        // make sure we dont send multiple requests to the server
        if (sendingData) {
            return;
        }

        sendingData = true;

        // clear all errors
        $('.js-errorlist').html('');

        var checkedEvents = $('.js-events:checked').not('.js-workshop-events');
        var pack = $('.js-pack:checked').data('type');

        var jsonObj = {
            name: $('input[name="fullname"]').val(),
            email: $('input[name="email"]').val(),
            college: $('input[name="college"]').val(),
            mobile: $('input[name="mobile"]').val(),
            // referred: $('input[name="referred"]').val(),
            pack: pack,
            events: []
        };

        var numQuotaEvents = checkedEvents.not('.js-group-events').not('.js-workshop-events').length;

        if(pack === 'single' && numQuotaEvents > 1) {
            showError('pack', ['Cant register to more than one event with single pack']);

            sendingData = false;
            return;
        }

        if (pack === 'none' && numQuotaEvents > 0) {
            showError('pack', ['Cant register to any none group/workshop events with no pack']);

            sendingData = false;
            return;
        }

        var shouldReturn = false;
        checkedEvents.each(function(i, event) {
            var $event = $(event);

            var eventObj = {};
            eventObj.id = makeId($event.attr('id'));

            var teamid = $event.closest('.event-item').find('.js-teamid').val();
            if(teamid) {
                if(isTeamValid(teamid)) {
                    eventObj.teamid = teamid;
                } else {
                    showError('tid-' + eventObj.id, ['Invalid Team Id']);

                    sendingData = false;
                    shouldReturn = true;
                }
            }

            jsonObj.events.push(eventObj);
        });

        if (shouldReturn) {
            return;
        }

        jsonObj.workshops = [];
        $('.js-workshop-events:checked').each(function(i, el) {
            var $el = $(el);

            jsonObj.workshops.push({id: makeId($el.attr('id'))});
        });

        var validResp = isFieldValid(jsonObj);
        if(validResp === true) {
            NProgress.start();

            $.post('/internal/api/register/', JSON.stringify(jsonObj))
                .done(function(resp) {
                    registrationSuccess(resp);
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
                    sendingData = false;
                });

        } else {
            showError(validResp,['this field cant be empty']);

            sendingData = false;
            return;
        }
    });

    /**
     * Callback on successful registration
     * @param  {Object} obj Success Object the server returned
     */
    function registrationSuccess(successObj) {
        // var summaryRowTemplate = $('#summaryRowTemplate').html();

        // var html = '';
        // $.each(successObj.multipleEvents, function() {
        //     html += render(summaryRowTemplate, this);
        // });

        // clear current form
        $('.inputfields').val('');
        $('input[type=checkbox]').prop('checked', false);
        $('.js-none-pack').prop('checked', true);
        $('.show-teamid').removeClass('show-teamid');
        calcPrice();

        // show summary
        var html = '<li><p>' + successObj.data.name + ' - ' + successObj.data.id + '</p></li>';
        $('.js-summary-ul').html(html);
        $('.js-user-summary').addClass('visible');

        // show recipt button
        // $('.js-btn-recipt').addClass('visible')
        //     .html('Recipt for ' + successObj.name)
        //     .attr('href', successObj.reciptURL);
    }

    // $(document).delegate('.js-use-teamid', 'click', function(e) {
    //     var $target = $(e.target);

    //     var $el = $('#' + $target.data('id'));
    //     var teamID = $target.data('teamid');

    //     $el.val(teamID);
    //     $el.closest('.event-item').addClass('show-teamid').find('input[type=checkbox]').prop('checked', true);

    //     $(window).scrollTop($el.position().top - 20);
    // });

    /**
     * Validates a teamID string syntactically
     * @param  {String}  teamid Team ID
     * @return {Boolean}        Is the teamID valid
     */
    function isTeamValid(teamid) {
        var r = /^[tg]-[0-9a-f]{5}$/i;
        return teamid.match(r) !== null;
    }

    /**
     * Validates fields and returns the id of the first invalid field
     * @param  {Object}         jObj        Object with fields and values to validate
     * @return {String|Boolean}             String ID, if any invalid field, Boolean true if valid
     */
    function isFieldValid(jObj) {
        if (!jObj.name.trim()) {
            return 'name';

        // } else if (!jObj.email.trim()) {
        //     return 'email';

        } else if (!jObj.college.trim()) {
            return 'college';

        } else if (!jObj.mobile.trim()) {
            return 'mobile';

        } else if (!jObj.pack) {
            showError('form',['Select a pack']);

        } else {
            return true;
        }
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

    /**
     * Takes a string in - seperated form and returns last part
     * @param  {String} domId The string
     * @return {String}       The last part of the @domId
     */
    function makeId(domId) {
        var parts = domId.split('-');
        return parts[parts.length-1];
    }

    /**
     * Given an @eid find the title in the events technical/cultural/group
     * @param  {Any} eid    The id of the element to find
     * @return {String}     The title for the corrosponding ID
     */
    function getEventTitleById(eid) {
        var out;

        out = searchArray(EVENTS.technical);
        if (out) {
            return out;
        }

        out = searchArray(EVENTS.cultural);
        if (out) {
            return out;
        }

        out = searchArray(EVENTS.group);
        if (out) {
            return out;
        }

        function searchArray(arr) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].id.toString() === eid.toString()) {
                    return arr[i].title;
                }
            }
        }
    }

    /**
     * Given an @eid find the title in the workshops
     * @param  {Any} eid    The id of the element to find
     * @return {String}     The title for the corrosponding ID
     */
    function getWorkshopTitleById(eid) {
        var out;

        out = searchArray(EVENTS.workshop);
        if (out) {
            return out;
        }

        function searchArray(arr) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i].id.toString() === eid.toString()) {
                    return arr[i].title;
                }
            }
        }
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

})();
