var define = require('amdefine')(module);

define([
    'frog',
    './config',
    './config.local'
], function(frog, config, local) {

    // CONFIG

    // extend config with local config setting development
    // configs, config local is not going to be committed
    for (var key in local) {
        config[key] = local[key];
    }

    // APPLICATION

    // save config for every other
    // part of the application to
    // be used
    frog.singleton.config = config;

    // SERVER

    // create application
    var app = new frog.Server.REST(config);

    // start application
    app.start();

});