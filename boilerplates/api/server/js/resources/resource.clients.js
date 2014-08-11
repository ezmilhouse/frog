if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    define('frog/api', require('frog').singleton.api);
    define('frog/config', require('frog').singleton.config);
}

define([
    'frog',
    'frog/api',
    'frog/config'
], function (frog, api, config) {

    var resource = new frog.Resource({
        context    : '/api',
        id         : 'id0',
        route      : '/clients',
        schema     : 'js/schemas/schema.clients',
        server     : frog.singleton.server
    });

    return resource;

});