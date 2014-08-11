var define = require('amdefine')(module);

define([
    'frog',
    './config',
    './config.local'
], function(frog, config, local) {

    // create application
    var app = new frog.Server.REST(config, local);

    // start application
    app.start();

});