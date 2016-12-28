var app = app || {};
app.modal = {};

(function() {
    'use strict';

    var currentModal;
    var closeCallback;

    /**
     * Shows the modal with given id and will handle
     * its close events
     * @param  {string} id DOM id of the modal
     * @param {function} callback Will be called when modal closes
     */
    app.modal.show = function(id, callback) {
        if (currentModal) {
            if (currentModal.attr('id') !== id) {
                app.modal.hide();
            } else {
                return;
            }
        }

        $(document.body).addClass('modal-view');
        currentModal = $(id);
        currentModal.addClass('modal-loading');
        window.setTimeout(function() {
            currentModal.addClass('modal-active');
        }, 50);

        currentModal.on('click', function(e) {
            if ($(e.target).hasClass('modal') || $(e.target).hasClass('close')) {
                app.modal.hide('close-button');
            }
        });

        closeCallback = callback;
    };

    /**
     * Hides the currently visible modal,
     * does nothing if no modal is open
     * @param {boolean} type optional string passed to the close callback
     *                       indicating 'how' it was closed. eg: 'close-button'
     */
    app.modal.hide = function(type) {
        if (!currentModal) {
            return;
        }

        $(document.body).removeClass('modal-view');
        currentModal.removeClass('modal-active');
        window.setTimeout((function(currentModal) {
            return function() {
                currentModal.removeClass('modal-loading');
                currentModal = undefined;
            };
        })(currentModal), 50);

        if (closeCallback) {
            closeCallback(type);
            closeCallback = undefined;
        }
    };

})();
