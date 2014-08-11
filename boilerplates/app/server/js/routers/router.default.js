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

    // get app
    var app = frog.singleton.app;

    // ROUTER: DEFAULT

    app.route('/')
        .get(function (req, res, next) {
            res.render('layout.html', {
                meta : {
                    env      : app.get('env'),
                    language : 'en'
                },
                text : {
                    status  : 'We are currently running in [1] mode.',
                    welcome : 'o_O'
                }
            });
        });

    app.route('/404')
        .get(function (req, res, next) {
            res.send('404 Not Found');
        });

});