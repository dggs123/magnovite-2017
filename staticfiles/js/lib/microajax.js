/**
 * http://code.google.com/p/microajax/source/browse/trunk/microajax.js
 * Note, this code has been modified and is not the same as the original
 */

var app = app || {};

app.ajax = function(method, url, body, callback) {
    'use strict';

    var csrftoken = document.querySelector('input[name=csrfmiddlewaretoken]').value;

    var stateChange = function (object) {
        if (request.readyState===4) {
            console.log(request);
            callback(request.status, request.responseText);
        }
    };

    var request = (function() {
        if (window.ActiveXObject) {
            return new ActiveXObject('Microsoft.XMLHTTP');
        }
        else if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
        return false;
    })();

    if(request) {
        request.onreadystatechange = stateChange;

        if (method === "POST") {
            request.open("POST", url, true);
            request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            request.setRequestHeader('Content-type', 'application/json');
            request.setRequestHeader('X-CSRFToken', csrftoken);
        } else {
            request.open("GET", url, true);
        }

        request.send(JSON.stringify(body));
    }
};
