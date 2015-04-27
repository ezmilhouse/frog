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
    request.end = function (fn) {

        // normalize
        fn = fn || util.noop;

        return this.run(function (err, res) {

            // save for cathc case
            var args = arguments;

            // skip, 1%
            // this is the network error, application
            // code should always come with status code
            // 200, therefore on application errors
            // you won't get this
            //
            // most common cases:
            // - 500, wild server exception
            // - 502, 503, server is not available at all
            // - 404, wrong url
            if (err) {

                try {

                    return fn({
                        code    : err.response.error.status,
                        debug   : err.response.error.text,
                        origin  : {

                            /*
                             req.body ?
                             req.params ?
                             req.query ?
                             */

                            headers   : {
                                req : err.response.request.req._headers,
                                res : err.response.request.res.headers
                            },
                            host      : err.response.request.host,
                            messenger : 'frog.xhr',
                            method    : err.response.error.method,
                            protocol  : err.response.request.protocol.split(':')[0],
                            status    : err.response.error.status,
                            type      : 'xhr',
                            uri       : err.response.error.path,
                            url       : err.response.request.url
                        },
                        message : (function (status) {

                            // default http status
                            switch (status) {
                                case 500 :
                                    return 'INTERNAL_SERVER_ERROR';
                                    break;
                                case 501 :
                                    return 'NOT_IMPLEMENTED';
                                    break;
                                case 502 :
                                    return 'BAD_GATEWAY';
                                    break;
                                case 503 :
                                    return 'SERVICE_UNAVAILABLE';
                                    break;
                                case 504 :
                                    return 'GATEWAY_TIMEOUT';
                                    break;
                                default :
                                    return 'UNKNOWN';
                                    break;
                            }

                        })(err.response.error.status),
                        stack   : [], // always the first
                        status  : err.response.error.status
                    }, null, err.response.error.status);

                } catch(err) {
                    console.log('XHR request failed on network level.', err);
                }

            }

            // skip
            // application error, always returns with
            // status code 200 on request level, real
            // errors on the body object
            if (res.body && res.body.error) {

                // parse stack
                // if available
                try {
                    if (res.body.error.stack) {
                        for (var i = 0; i < res.body.error.stack.length; i++) {
                            res.body.error.stack[i] = JSON.parse(res.body.error.stack[i]);
                        }
                    }
                } catch (e) {
                    console.log('Not able to JSON.parse().');
                }

                return fn(res.body.error, res.body.data, res.body.status, res.body.error.code, res.body.error.debug);

            }

            // exit
            fn(null, res.body.data, res.body.status);

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
    request.get = function (url, data, fn) {

        var req = request('GET', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function () {
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
    request.head = function (url, data, fn) {

        var req = request('HEAD', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function () {
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
    request.del = function (url, fn) {

        var req = request('DELETE', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function () {
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
    request.patch = function (url, data, fn) {

        var req = request('PATCH', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function () {
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
    request.post = function (url, data, fn) {

        var req = request('POST', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function () {
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
    request.put = function (url, data, fn) {

        var req = request('PUT', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function () {
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