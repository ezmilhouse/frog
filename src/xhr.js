if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    'underscore',
    'request'
], function (_, request) {
    return request;
});