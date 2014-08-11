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

    frog.require([
        'js/routers/router.default'
    ]);

});