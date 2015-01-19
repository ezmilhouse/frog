var define = require('amdefine')(module);
define('frog/api', require('frog').singleton.api);
define('frog/config', require('frog').singleton.config);

define([

    'frog',
    'frog/api',
    'frog/config',

    // RESOURCES

    './resources/resource.users',

    // SERVICES

    './services/service.status'

], function (frog, api, config) {});