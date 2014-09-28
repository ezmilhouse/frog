var _ = require('underscore');
var define = require('amdefine')(module);
define('frog/api', require('frog').singleton.api);
define('frog/config', require('frog').singleton.config);
var moment = require('moment');

define([
    'frog',
    'frog/api',
    'frog/config',
    '../misc/misc.i18n'
], function (frog, api, config, i18n) {

    // express application
    var app = frog.singleton.app;

    // express routes prefix
    var pre = '/:region/:language';

    // ROUTE: API

    app.route('/api/version')
        .get(function(req, res, next) {

            // set content type
            res.set('Content-Type', 'application/json');

            // get app version
            res.send({
                version : app.get('version')
            });

        });

    // ROUTES: ALL

    app.route(pre + '/*')
        .all(function (req, res, next) {

            // change region, language if necessary
            if (i18n.get('region') !== req.params.region || i18n.get('language') !== req.params.language) {
                i18n.change({
                    language : req.params.language,
                    region   : req.params.region
                });
            }

            // reset _globals (object to that is global in all
            // templates rendered)
            req._globals = {
                comp   : '../../../public/components',
                config : config,
                date   : frog.date,
                frog   : frog,
                group  : null,
                html   : '../../../../../server/html',
                i18n   : i18n,
                here   : {
                    params : req.params,
                    query  : req.query,
                    url    : req.url
                },
                meta   : {
                    env      : app.get('env'),
                    language : i18n.get('language'),
                    region   : i18n.get('region')
                },
                moment : moment,
                params : req.params || null,
                query  : req.query || null,
                user   : null,
                util   : frog.util
            };

            next();

        });

    // ROUTES

    app.route(pre)
        .get(function (req, res, next) {
            res.render('layout.html', req._globals);
        });

    // ROUTE: ROOT

    app.route('/')
        .get(function (req, res, next) {
            res.redirect('/' + config.i18n.region + '/' + config.i18n.language);
        });

    // ROUTES: ERRORS

    app.route('/400')
        .get(function (req, res, next) {
            res.send('400 Bad Request');
        });

    app.route('/401')
        .get(function (req, res, next) {
            res.send('401 Unauthorized');
        });

    app.route('/403')
        .get(function (req, res, next) {
            res.send('403 Forbidden');
        });

    app.route('/404')
        .get(function (req, res, next) {
            res.send('404 Not Found');
        });

    app.route('*')
        .get(function(req, res, next) {
            res.redirect('/404');
        });

});