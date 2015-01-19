var _ = require('underscore');
var define = require('amdefine')(module);
define('frog/api', require('frog').singleton.api);
define('frog/config', require('frog').singleton.config);

// ---

define([
    'frog',
    'frog/api',
    'frog/config',
    '../schemas/schema.user'
], function (frog, api, config, schema) {

    return new frog.Resource({
        id        : 'id',
        namespace : 'users',
        route     : '/api/users',
        safe      : false,
        schema    : schema
    });

});