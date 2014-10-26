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

    // save text
    frog.singleton.text = require('.' + config.text);

    // save config for every other
    // part of the application to
    // be used
    frog.singleton.config = config;

    // save api instance for every
    // other part of the application
    // to be used
    frog.singleton.api = new frog.Api(config.api);

    // SERVER

    // create application
    var app = new frog.Server.HTTP(config);

    // start application
    app.start();

});



