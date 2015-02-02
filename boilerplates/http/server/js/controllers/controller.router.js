var _ = require('underscore');
var define = require('amdefine')(module);
define('frog/api', require('frog').singleton.api);
define('frog/config', require('frog').singleton.config);
var moment = require('moment');

define([
    'frog',
    'frog/api',
    'frog/config',
    '../middleware/middleware.globals'
], function (frog, api, config, globals) {

    // express application
    var app = frog.singleton.app;

    // express routes prefix
    var pre = '/:region/:language';

    // HELPERS

    /**
     * @method render(req, res, page[,layout])
     * TODO: move render method to frog, Server.HTTP
     * TODO: add cache-control setting to config.js
     * Renders incoming page into incoming (or default)
     * layout.
     * @params {required}{obj} req
     * @params {required}{obj} res
     * @params {required}{str} page
     * @params {optional}{str} layout
     */
    var render = function (req, res, page, layout) {

        // normalize
        layout = layout || 'layout';

        // add page to render
        _.extend(req._globals, {
            page : page
        });

        // set cache-control header
        // IMPORTANT:
        // If the the `Cache-Control` header is not set to `max-age=0`,
        // express falls back to 3 days caching time. this will lead
        // to routes not being executed, because the user basically
        // surfs the browser cache.
        //
        // Setting the `Cache-Control` header with the max-age directive
        // OVERRIDES the `Expires` header
        res.header('Cache-Control', 'max-age=0');

        // render page
        res.render(layout + '.html', req._globals);

    };

    /**
     * @object sessions
     * General session handler.
     */
    var session = {

        /**
         * @method init()
         * Initiates data object on req.session object,
         * store application data on data key (by convention)
         */
        init : function (req) {

            if (typeof req.session.data == 'undefined') {
                req.session.data = {};
            }

        },

        /**
         * @method kill(req[,fn])
         * Kills existing session (in store), cookie as well.
         * @params {required}{obj} req
         * @params {optional}{fun} fn
         * @return {*}
         */
        kill : function (req, fn) {

            // normalize
            fn = fn || frog.util.noop;

            // skip
            if (typeof req.session === 'undefined') {
                return fn(null);
            }

            // destroy session in store
            req.session.destroy(function(err) {

                // exit
                fn(err);

            });

        },

        /**
         * @method test(req)
         * Session based view counter for testing purposes only.
         * @params {required}{obj} req
         */
        test : function(req) {

            // initiate views counter
            if (typeof req.session.data.views === 'undefined') {
                req.session.data.views = 0;
            }

            // iterate views counter
            req.session.data.views += 1;

            // debug
            // console.log(req.url);
            // console.log(req.session.data.views);

        }

    };

    // ROUTES: ALL

    app.route('*')
        .all(function (req, res, next) {

            session.init(req);
            session.test(req);

            next();

        });

    // ROUTES: ALL: REGION, LANGUAGE

    app.route(pre + '*')
        .all(globals);

    // ROUTES

    app.route(pre)
        .get(function (req, res, next) {
            res.render('layout.html', req._globals);
        });

    // ROUTE: ROOT

    app.route('/')
        .get(function (req, res, next) {
            res.redirect('/' + config.i18n.country.toLowerCase() + '/' + config.i18n.language);
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