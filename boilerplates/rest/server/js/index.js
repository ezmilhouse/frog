if (typeof define === 'undefined') {
    var _ = require('underscore');
    var define = require('amdefine')(module);
    define('frog/config', require('frog').singleton.config);
}

define([
    'frog',
    'frog/config'
], function (frog, config) {

    frog.require([
        'js/resources/resource.test'
    ]);

});