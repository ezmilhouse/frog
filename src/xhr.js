if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    'superagent',
    './util'
], function (request, util) {

    /**
     * @method .end([fn])
     * Overwrites superagent's instance .end
     * method to return better params on end
     * callback.
     * @params {optional}{fun} fn
     * @return {*}
     */
    request.end = function(fn) {

        // normalize
        fn = fn || util.noop;

        return this.run(function (err, res) {

            // skip
            // no res at all
            if (!res) {
                return fn(true, null, 500);
            }

            // skip
            // handle xhr error
            if (res.error) {
                return fn(true, null, res.status);
            }

            // skip
            // handle res error
            if (res.body && res.body.status >= 400) {
                return fn(res.body.error, res.body.data, res.body.status, res.body.code, res.body.debug);
            }

            // handle success
            fn(null, res.body.data, res.body.status, res.body.code, res.body.debug);

        });

    };

    /**
     * @method .get(url[,data][,fn])
     * GET url with optional querystring data, callback.
     * @params {required}{str} url
     * @params {optional}{obj|fun} data
     * @params {optional}{fun} fn
     * @return {*}
     */
    request.get = function(url, data, fn){

        var req = request('GET', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function() {
            request.end.apply(req, arguments);
        };

        // normalize
        if ('function' == typeof data) {
            fn = data;
            data = null;
        }

        if (data) {
            req.query(data);
        }

        if (fn) {
            req.end(fn);
        }

        return req;

    };

    /**
     * @method .head(url[,data][,fn])
     * HEAD url with optional body data, callback.
     * @params {required}{str} url
     * @params {optional}{obj|fun} data
     * @params {optional}{fun} fn
     * @return {*}
     */
    request.head = function(url, data, fn){

        var req = request('HEAD', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function() {
            request.end.apply(req, arguments);
        };

        // normalize
        if ('function' == typeof data) {
            fn = data;
            data = null;
        }

        if (data) {
            req.send(data);
        }

        if (fn) {
            req.end(fn);
        }

        return req;

    };

    /**
     * @method .del(url[,fn])
     * DELETE url with optional body callback.
     * @params {required}{str} url
     * @params {optional}{fun} fn
     * @return {*}
     */
    request.del = function(url, fn){

        var req = request('DELETE', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function() {
            request.end.apply(req, arguments);
        };

        if (fn) {
            req.end(fn);
        }

        return req;

    };

    /**
     * @method .patch(url[,data][,fn])
     * PATCH url with optional body data, callback.
     * @params {required}{str} url
     * @params {optional}{obj|fun} data
     * @params {optional}{fun} fn
     * @return {*}
     */
    request.patch = function(url, data, fn){

        var req = request('PATCH', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function() {
            request.end.apply(req, arguments);
        };

        // normalize
        if ('function' == typeof data) {
            fn = data;
            data = null;
        }

        if (data) {
            req.send(data);
        }

        if (fn) {
            req.end(fn);
        }

        return req;

    };

    /**
     * @method .post(url[,data][,fn])
     * POST url with optional body data, callback.
     * @params {required}{str} url
     * @params {optional}{obj|fun} data
     * @params {optional}{fun} fn
     * @return {*}
     */
    request.post = function(url, data, fn){

        var req = request('POST', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function() {
            request.end.apply(req, arguments);
        };

        // normalize
        if ('function' == typeof data) {
            fn = data;
            data = null;
        }

        if (data) {
            req.send(data);
        }

        if (fn) {
            req.end(fn);
        }

        return req;

    };

    /**
     * @method .put(url[,data][,fn])
     * PUT url with optional body data, callback.
     * @params {required}{str} url
     * @params {optional}{obj|fun} data
     * @params {optional}{fun} fn
     * @return {*}
     */
    request.put = function(url, data, fn){

        var req = request('PUT', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function() {
            request.end.apply(req, arguments);
        };

        // normalize
        if ('function' == typeof data) {
            fn = data;
            data = null;
        }

        if (data) {
            req.send(data);
        }

        if (fn) {
            req.end(fn);
        }

        return req;

    };

    return request;

});