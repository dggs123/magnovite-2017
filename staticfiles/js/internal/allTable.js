(function() {
    'use strict';

    if (!$(document.body).hasClass('js-full-table')) {
        return;
    }

    $(document).delegate('.id', 'click', function(e) {
        e.preventDefault();

        var $row = $(e.target).closest('tr');
        var id = $row.data('id');
        var isCheckedIn = $row.hasClass('checked-in');

        var url;
        if (isCheckedIn) {
            url = '/internal/api/check-out/' + id + '/';
        } else {
            url = '/internal/api/check-in/' + id + '/';
        }

        NProgress.start();
        $.get(url)
            .done(function() {
                $row.toggleClass('checked-in');
            })
            .fail(function() {
                window.alert('Checkin for id failed - ' + id);
            })
            .always(function() {
                NProgress.done();
            });
    });

})();
