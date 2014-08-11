if (typeof define !== 'function') {
    var _ = require('underscore');
    var define = require('amdefine')(module);
}

define([
    './Base',
    './Flow',
    './util',
    './xhr'
], function (Base, flow, util, xhr) {

    return Base.extend({

        // PRIVATE

        /**
         * ctor, Api
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            this.$ = {

                auth     : {
                    client_key   : null,
                    cookie       : null,
                    cookieExpire : 30,
                    cookieName   : 'JSESSIONID',
                    session      : null
                },
                endpoint : '/api',
                platform : 'www',
                cdn      : {
                    url : null
                },
                program  : {
                    id : null
                }

            };

            if (options) {
                _.extend(this.$, options);
            }

            return this;

        },

        /**
         * @method _getCookie(key)
         * Reads all cookies, returns cookie based on given name.
         * @params {str} key
         * @return {bol}
         */
        _getCookie : function (key) {

            // normalize
            key += '=';

            // get cookie list
            var arr = document.cookie.split(';');

            // loop through list of cookies, extract name 
            for (var i = 0; i < arr.length; i++) {

                // extract cookie
                var cookie = arr[i];
                var cookieMatched;

                // clean up
                while (cookie.charAt(0) === ' ') {
                    cookie = cookie.substring(1, cookie.length);
                }

                // match name, return if hit
                if (cookie.indexOf(key) === 0) {

                    // build
                    cookieMatched = cookie.substring(key.length, cookie.length);

                    // save
                    this.set('auth.cookie', arr[i]);
                    this.set('auth.session', cookieMatched);

                    return cookieMatched;

                }

            }

            return false;

        },

        /**
         * @method _setCookie()
         * Sets cookie based on incoming key, value and optional
         * expire date (in days).
         * @params {str} key
         * @params {str} value
         * @params {int} days
         * @return {bol}
         */
        _setCookie : function (key, value, days) {

            var expires;

            // normalize
            // set to null if incoming days are lower than 0
            // (used to kill cookie)
            days = (days < 0) ? null : days || this.get('auth.cookieExpire');

            if (days) {

                // calc expiration date
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));

                // build expire string
                expires = '; expires=' + date.toGMTString();

            } else {

                // negative value, means expired
                expires = -1;

            }

            // build cookie
            var cookie = key + '=' + value + expires + '; path=/';

            // set cookie
            document.cookie = cookie;

            // save
            this.set('auth.cookie', cookie);

            return true;

        },

        /**
         * @method _delCookie()
         * Removes cookie by key.
         * @params {str} key
         * @return {bol}
         */
        _delCookie : function (key) {

            // deleting a cookie actually means settin value to nothing
            // and seting expire date to the past
            this._setCookie(key, '', -1);

            // reset cookie
            this.set('auth.cookie', null);

            return true;

        },

        /**
         * @method _setHeaders()
         * Sets header object based on set platform, auth data
         * and cookie (if available).
         * @return {obj}
         */
        _setHeaders : function () {

            // aggregate request headers
            // cookie header will be set automatically
            // by browser, manually setting cookie 
            // header is considered illegal
            var headers = {
                'Content-Type' : 'application/json',
                'frog-client'   : this.$.auth.client_key
            };

            // check for valid get cookie
            this._getCookie(this.$.auth.cookieName);

            // add session if available
            if (this.$.auth.session !== null) {
                _.extend(headers, {
                    'frog-session' : this.$.auth.session
                });
            }

            return headers;

        },

        /**
         * @method _setProgram()
         * Extracts program id from body data attribute.
         * @return {bol}
         */
        _setProgram : function () {

            // get program id
            var programId = $('body').data('program') || $('html').data('program') || null;

            // get cdn url
            var cdn = $('html').data('cdn') || null;

            // save
            this.set('program.id', programId);
            this.set('cdn.url', cdn);

            return true;

        },

        /**
         * @method _setUrl(uri[,id])
         * Builds url based on set endpoint, incoming uri and
         * optional id, returns url.
         * @params {str} uri
         * @params {str} id
         * @return {str}
         */
        _setUrl : function (uri, id, noProgram) {

            // normalize
            // force leading slash
            uri = (uri.charAt(0) === '/') ? uri : '/' + uri;

            // normalize
            // remove trailing slash
            uri = (uri.charAt(uri.length - 1) === '/') ? uri.substr(0, uri.length - 1) : uri;

            // normalize
            id = id || null;

            // ---

            // reset url
            var url = '';

            // url starting point defaults to current endpoint
            // endpoints can be relative uri (ex: proxy within
            // current host) or absolute path to CORS enabled 
            // endpoint 
            url += this.get('endpoint');

            // sets program, if program id is available AND the
            // noProgram flag is not set
            if ((this.$.program.id !== null || uri.substr(0, 3) === '/me') && !noProgram) {
                url += '/programs/' + this.$.program.id;
            }

            // set uri
            url += uri;

            // set id (if available)
            if (id) {
                url += '/' + id;
            }

            // exit
            return url;

        },

        /**
         * @method _auth()
         * Handles all authentication requests in API context.
         * @params {str} action
         * @params {obj} body
         * @params {fun} fn
         */
        _auth : function (action, body, fn) {

            var self = this;

            /**
             * @method _login()
             * Executes login based on incoming uri and POST
             * body.
             * @params {str} uri
             * @params {obj} body
             * @params {fun} fn
             */
            var _login = function (uri, body, fn) {

                flow
                    // login
                    .seq(function (cb) {

                        var seq = this;

                        // build uri
                        uri += '/login';

                        // invoke request
                        self._post(uri, body, {}, function (err, res, status) {

                            // skip
                            if (err || status >= 400) {
                                return;
                            }

                            // save
                            seq.set('res', res);

                            // next
                            cb();

                        });

                    })
                    // cookie, sessions
                    .seq(function (cb) {

                        var seq = this;

                        // get response
                        var res = seq.get('res');

                        // extract session
                        var session = res.body.data._ref.session.id;

                        // save session
                        self.set('auth.session', session);

                        // extract cookie name
                        var cookieName = self.get('auth.cookieName');

                        // save cookie
                        self._setCookie(cookieName, session);

                        // next
                        cb();

                    })
                    // exit
                    .seq(function () {

                        var seq = this;

                        if (fn) {
                            fn(null, seq.get('res'));
                        }

                    })
                    .end();

            };

            /**
             * @method _session()
             * Activates session based on incoming uri.
             * @params {str} uri
             * @params {fun} fn
             */
            var _session = function (uri, fn) {

                flow()
                    // session
                    .seq(function (cb) {

                        var seq = this;

                        // build uri
                        uri += '/session';

                        // reset cookies
                        var cookies = {};

                        // get cookieName
                        var cookieName = self.get('auth.cookieName');

                        // extract cookie from current cookies
                        var cookie = self._getCookie(cookieName);

                        // if cookie found prepare POST body containing
                        // cookies key, holding found cookies
                        if (cookie) {
                            cookies[cookieName] = cookie;
                            var body = {};
                            body.cookies = cookies;
                            body.cookies = {
                                'JSESSIONID' : '42F63DCCA3B5AB629CC8EA1DFB2FCE09'
                            }
                        }

                        // invoke request
                        self._post(uri, body, {}, function (err, res, status) {

                            // skip
                            if (err) {
                                return;
                            }

                            // save
                            seq.set('res', res);

                            // next
                            cb();

                        });

                    })
                    // cookie, sessions
                    .seq(function (cb) {

                        var seq = this;

                        // get response
                        var res = seq.get('res');

                        // extract session (or null)
                        var session = (typeof res.body.data._ref !== 'undefined')
                            ? res.body.data._ref.session.id : null;

                        // save session
                        self.set('auth.session', session);

                        // skip
                        // if no session found
                        if (!session) {
                            return cb();
                        }

                        // extract cookie name
                        var cookieName = self.get('auth.cookieName');

                        // save cookie
                        self._setCookie(cookieName, session);

                        // next
                        cb();

                    })
                    // exit
                    .seq(function () {

                        var seq = this;

                        // get session
                        var session = self.get('auth.session');

                        if (fn) {
                            if (session) {
                                fn(null, seq.get('res'), 200);
                            } else {
                                // TODO: add proper error handler
                                fn(true, 'o(O', 401);
                            }
                        }

                    })
                    .end();

            };

            // ---

            // normalize
            action = action.toLowerCase() || null;

            // get program
            var programId = this.get('program.id');

            // reset uri
            var uri = '';
            uri += '/programs/' + programId;
            uri += '/auth';

            switch (action) {

                case 'login' :
                    _login(uri, body, fn);
                    break;

                default :
                    _session(uri, fn);
                    break;

            }

        },

        /**
         * @method _response(response[,fn])
         * Handles all responses of fm api calls, normalizes
         * errors, error response, and succes responses.
         * @params {obj} response
         * @params {fun} fn
         */
        _response : function (response, fn) {

            // normalize
            fn = fn || util.noop;

            // [-] skip
            // serious xhr error
            if (response.error) {
                return fn(true, {
                    body : {
                        code    : '00000',
                        data    : null,
                        error   : true,
                        message : response.message,
                        status  : response.statusCode,
                        success : false
                    }
                });
            }

            // [-] skip
            // serious application error
            if (response.body.error || response.body.status >= 400) {
                return fn(true, response);
            }

            // [+]
            // all good
            fn(null, response);

        },

        // PRIVATE: CRUD

        /**
         * @method _get(uri[,id][,query][,fn])
         * Handles GET requests in API context.
         * @params {str} uri
         * @params {str} id
         * @params {obj} query
         * @params {fun} fn
         */
        _get : function (uri, id, query, fn, noProgram) {

            var self = this;

            // except array as first arguments results in ordered
            // calling of requests and return responses in the
            // same order, error in one request kills whole set of
            // requests
            // ex: app.get(['/me', '/me/account'], null, null, fn);
            if (_.isArray(uri)) {

                // reset response array
                var res = {};

                // reset counters
                var m = uri.length;
                var c = 0;

                // loop through all urls, invoke requests, collect
                // response, call fn() when done
                for (var i = 0; i < uri.length; i++) {

                    // use closure, to avoid scope skipping
                    (function (uri, i) {

                        self._get(uri[i], id, query, function (err, response) {

                            // skip
                            // if error occures in one of the
                            // single requests
                            if (err) {
                                return fn(true);
                            }

                            // save response in incoming order
                            res[uri[i]] = response;

                            // update counter
                            c += 1;

                            // exit, if all requests have been
                            // handled
                            if (c >= m) {

                                // emulate body structure, return response
                                return fn(null, res);

                            }

                        }, noProgram);

                    })(uri, i);

                }

                return;

            }

            // get url
            var url = this._setUrl(uri, id, noProgram);

            // get/set headers
            var headers = this._setHeaders();

            // invoke request
            xhr
                .get(url)
                .set(headers)
                .query(query)
                .end(function (res) {
                    return self._response(res, fn);
                });

        },

        /**
         * @method _post(uri, body[,query][,fn])
         * Handles POST requests in API context.
         * @params {str} uri
         * @params {obj} body
         * @params {obj} query
         * @params {fun} fn
         */
        _post : function (uri, body, query, fn, noProgram) {

            var self = this;

            // get url
            var url = this._setUrl(uri, null, noProgram);

            // get/set headers
            var headers = this._setHeaders();

            // invoke request
            xhr
                .post(url)
                .set(headers)
                .send(body)
                .query(query)
                .end(function (res) {
                    return self._response(res, fn);
                });

        },

        /**
         * @method _put(uri, body[,id][,query][,fn])
         * Handles PUT requests in API context.
         * @params {str} uri
         * @params {obj} body
         * @params {str} id
         * @params {obj} query
         * @params {fun} fn
         */
        _put : function (uri, body, id, query, fn, noProgram) {

            var self = this;

            // get url
            var url = this._setUrl(uri, id, noProgram);

            // get/set headers
            var headers = this._setHeaders();

            // invoke request
            xhr
                .put(url)
                .set(headers)
                .send(body)
                .query(query)
                .end(function (res) {
                    return self._response(res, fn);
                });

        },

        /**
         * @method _del(uri, id[,query][,fn])
         * Handles DELETE requests in API context.
         * @params {str} uri
         * @params {str} id
         * @params {obj} query
         * @params {fun} fn
         */
        _delete : function (uri, id, query, fn, noProgram) {

            var self = this;

            // get url
            var url = this._setUrl(uri, id, noProgram);

            // get/set headers
            var headers = this._setHeaders();

            // invoke request
            xhr
                .del(url)
                .set(headers)
                .query(query)
                .end(function (res) {
                    return self._response(res, fn);
                });

        },

        // PUBLIC

        /**
         * @method env()
         * Returns current environment settings.
         * @return {obj}
         */
        env : function () {

            return {
                cdn      : this.$.cdn,
                endpoint : this.$.endpoint,
                platform : this.$.platform,
                program  : this.$.program
            };

        },

        /**
         * @method user()
         * Returns current auth settings.
         * @return {obj}
         */
        user : function () {

            return {
                auth : this.$.auth
            };

        },

        /**
         * @method init()
         * Exports public API methods.
         * @return {obj}
         */
        init : function () {

            var self = this;

            // set program
            this._setProgram();

            // export interface
            return {
                auth   : function () {
                    return self._auth.apply(self, arguments);
                },
                cookie : {
                    del : function () {
                        return self._delCookie.apply(self, arguments);
                    },
                    get : function () {
                        return self._getCookie.apply(self, arguments);
                    },
                    set : function () {
                        return self._setCookie.apply(self, arguments);
                    }
                },
                env    : function () {
                    return self.env.apply(self, arguments);
                },
                user   : function () {
                    return self.user.apply(self, arguments);
                },
                get    : function () {
                    return self._get.apply(self, arguments);
                },
                post   : function () {
                    return self._post.apply(self, arguments);
                },
                put    : function () {
                    return self._put.apply(self, arguments);
                },
                del    : function () {
                    return self._delete.apply(self, arguments);
                },
                set    : function () {
                    return self.set.apply(self, arguments);
                }
            };

        }

    });

});