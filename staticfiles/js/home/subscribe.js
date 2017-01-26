var app = app || {};
app.subscribe = {};

/**
 * Takes care of the subscribe email form, init must be called
 * Expects the input to have an class of [js-email],
 * Subscribe button to have a class of [js-subscribe]
 *
 * It expects there to be more than one subscribe form in the page
 * and will consistently update everything
 *
 * This must be included after bulb.js
 *
 * TODO: Remove listeners on success
 */
(function() {
    'use strict';

    var $emails, $forms, $buttons;

    var subscribed = false;

    app.subscribe.init = function() {
        $forms = toArray(document.querySelectorAll('.subscribe'));
        $buttons = toArray(document.querySelectorAll('.js-subscribe'));
        $buttons.forEach(function(button) {
            button.addEventListener('click', handleButtonClick);
        });

        $emails = toArray(document.querySelectorAll('.js-email'));
        $emails.forEach(function(email) {
            email.addEventListener('focus', handleEmailFocus);
            email.addEventListener('blur', handleEmailBlur);
            email.addEventListener('keypress', handleEmailKey);
        });
    };


    /**
     * Handles email textbox keydown
     * @param  {DOMEvent} e DOMEventObject
     */
    function handleEmailKey(e) {
        if (e.which === 13) {
            handleButtonClick();
            e.target.blur();
        }
    }

    /**
     * Resumes the default pane behaviour when we unfocus the email textbox
     * @param {DOMEvent} e DOMEventObject
     */
    function handleEmailBlur(e) {
        app.bulb.resumeDefaultDelay(3000);
    }

    /**
     * Makes sure the pane doesnt change to default when we focus on the email textbox
     * @param  {DOMEvent} e DOMEventObject
     */
    function handleEmailFocus(e) {
        app.bulb.pauseDefaultDelay();
    }

    /**
     * Handles the subscribe button click
     * @param  {EventObject} e Event Object
     */
    function handleButtonClick(e) {
        if (subscribed) {
            return;
        }

        // get the input which is not blank as the email
        var email;
        for (var i = 0; i < $emails.length; i++) {
            var value = $emails[i].value;

            if (value && value.trim()) {
                email = value;
                break;
            }
        }

        // if we didnt find any email focus on email box of the button
        if (email === undefined) {
            findButton(e.target).parentElement.querySelector('input').focus();

            // wait 3seconds before showing the default pane
            app.bulb.resumeDefaultDelay(3000);
            return;
        }

        // add start class to all buttons
        addClassAll('start', $buttons);

        // set all email boxes to the email
        $emails.forEach(function(el) {
            el.value = email;
        });

        // make sure the pane doesnt change to default
        app.bulb.pauseDefaultDelay();

        // send the request
        app.ajax('POST', '/subscribe/', {'email': email}, function(code, resp) {
            var json = JSON.parse(resp);

            if (code === 201) {
                subscribeSuccess();
            } else {
                subscribeFailed(json['errors']['email']);
            }
        });
    }

    /**
     * Subscribe failed
     * @param  {String} error error text
     */
    function subscribeFailed(error) {
        app.bulb.resumeDefaultDelay(2000);

        removeClassAll('start', $buttons);
        alert(error);
    }

    /**
     * Subscribe success
     */
    function subscribeSuccess() {
        app.bulb.resumeDefaultDelay(4000);

        removeClassAll('start', $buttons);
        addClassAll('done', $buttons);

        addClassAll('subscribed', $forms);
        subscribed = true;
    }

    /**
     * Add the class to all elements in the els array
     * @param {Array} els Array of DOMNodes
     * @param {String} cls class name to add
     */
    function addClassAll(cls, els) {
        els.forEach(function(el) {
            el.classList.add(cls);
        });
    }

    /**
     * Remove the class from all els element in the array
     * @param {Array} els Array of DOMNodes
     * @param {String} cls Class name to remove
     */
    function removeClassAll(cls, els) {
        els.forEach(function(el) {
            el.classList.remove(cls);
        });
    }

    /**
     * Find the first button in the parent tree of the element
     * @param  {DOMNode} el Element to search
     * @return {DOMNode}    The first element in the parent tree which is a button
     */
    function findButton(el) {
        var e = el;
        while (e.parentElement && e.tagName !== 'BUTTON') {
            e = e.parentElement;
        }

        return e;
    }

    /**
     * Converts an array like object to a real array
     * @param  {array-like} obj array like object
     * @return {Array}     converted array
     */
    function toArray(obj) {
        return Array.prototype.slice.call(obj);
    }

})();
