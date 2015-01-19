var _ = require('underscore');
var define = require('amdefine')(module);
define('frog/api', require('frog').singleton.api);
define('frog/config', require('frog').singleton.config);

define([
    'frog',
    'frog/api',
    'frog/config'
], function (frog, api, config) {

    var app = frog.singleton.app;

    /**
     * @method fn(params, body, query, fn)
     * Service that returns API status.
     * @params {required}{obj} params
     * @params {required}{obj} body
     *    @key {required}{str} id
     * @params {required}{obj} query
     * @params {optional}{fun} fn
     * @sample
     *
     * // event
     * app.emit('service:status', function(err, body, status, code) {
     *
     *      // success
     *      @err    null
     *      @body   [ ... ]
     *      @status 200
     *      @code   200
     *
     *      // error
     *      @err    true
     *      @body   null
     *      @status 400, 404
     *      @code   400001, 400002, 404001
     *
     * });
     *
     * // request
     * GET /api/status
     *
     */
    var fn = function (params, body, query, fn) {
        return fn(null, {
            status : 'ok'
        }, 200);
    };

    return new frog.Service({
        fn        : fn,
        method    : 'GET',
        namespace : 'status',
        route     : '/api/status'
    });

});