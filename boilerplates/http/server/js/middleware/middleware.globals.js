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

    /**
     * @middleware globals(req, res, next)
     * Adds _globals object to request object, makes
     * runtime values available for all other parts
     * of application.
     * @params {required}{obj} req
     * @params {required}{obj} res
     * @params {required}{fun} next
     */
    return function(req, res, next) {

        // change region, language if necessary
        if (i18n.get('region') !== req.params.region || i18n.get('language') !== req.params.language) {
            i18n.change({
                language : req.params.language,
                region   : req.params.region
            });
        }

        // reset _globals (object to that is global in all
        // templates rendered)
        // TODO: normalize paths
        req._globals = {
            comp   : '../../../public/components',
            config : config,
            cookie : req.session.cookie || null,
            data   : {},
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
            link   : '/' + i18n.get('region') + '/' + i18n.get('language'),
            meta   : {
                env      : app.get('env'),
                language : i18n.get('language'),
                region   : i18n.get('region')
            },
            moment  : moment,
            page    : null,
            params  : req.params || null,
            query   : req.query || null,
            session : req.session.data || null,
            user    : null,
            util    : frog.util
        };

        next();

    };

});