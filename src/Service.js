if (typeof define !== 'function') {
    var _ = require('underscore');
    var define = require('amdefine')(module);
    var mongoose = require('mongoose');
}

define([
    './Base',
    './date',
    './singleton',
    './util'
], function (Base, date, singleton, util) {

    return Base.extend({

        /**
         * @method _ctor([obj])
         * Constructor of Service class.
         *
         * @params {optional}{obj} options
         * @return {*}
         */
        _ctor : function (options) {

            this.$ = {
                app        : singleton.app,
                cb         : null,
                config     : {},
                context    : null,
                defaults   : {
                    limit  : 100,
                    offset : 0,
                    page   : 1,
                    sort   : {
                        created : -1 // DESC (1 = ASC)
                    }
                },
                errors     : {},
                fn         : null,
                id         : 'id',
                method     : null,
                middleware : [],
                Model      : null,
                namespace  : null,
                payload    : [],
                prefix     : '',
                route      : null,
                safe       : true, // if set to false {} queries on _del, _set are possible
                schema     : null,
                server     : singleton.server
            };

            if (options) {
                _.extend(this.$, options);
            }

            // prepare
            this._setNamespace();
            this._setListeners();
            this._setMethods();
            this._setPayload();
            this._setModel();
            this._setRoute();

            return this;

        },

        // PRIVATE

        /**
         * @method _getListener(namespace)
         * Return true or false, based on finding namespace
         * in _events list.
         * @params {required}{str} namespace
         * @return {bol}
         */
        _getListener : function (namespace) {

            var self = this;

            // get restify app object
            var app = this.$.app;

            // retunr boolean (true if found)
            return typeof app._events[namespace] !== 'undefined';

        },

        /**
         * @method _setMethod()
         * Sets http method based on CRUD method or falls
         * back to GET in case of custom service.
         * @return {*}
         */
        _setMethods : function () {

            var self = this;

            // reset method
            var method;

            // find correct http method based on native
            // CRUD method or set
            switch (this.$.fn) {
                case 'index' :
                    method = 'GET';
                    break;
                case 'create' :
                    method = 'POST';
                    break;
                case 'retrieve' :
                    method = 'GET';
                    break;
                case 'update' :
                    method = 'PUT';
                    break;
                case 'delete' :
                    method = 'DELETE';
                    break;
                default :
                    method = this.$.method || 'GET';
                    break;
            }

            // overwrite if method is set separately
            // (in case of CRUD), otherwise set preset
            // method
            if (this.$.method) {
                method = this.$.method;
            } else {
                this.$.method = method;
            }

            // make chainable
            return this;

        },

        /**
         * @method _setMiddleware()
         * Returns array of middleware functions.
         * @return {arr}
         */
        _setMiddleware : function () {

            // extract middleware
            var middleware = this.$.middleware;

            // reset
            var arr = [];

            // loop through all middleware keys, add functions
            // to array, middleware might be instance of Middleware
            // class or simple function
            for (var i = 0; i < middleware.length; i++) {

                // extract function/instance
                var fn = middleware[i];

                // check if function or instance
                // add fn or extract fn first
                if (typeof fn === 'function') {
                    arr.push(fn);
                } else {
                    arr.push(fn.get('fn'));
                }

            }

            // exit
            return arr;

        },

        /**
         * @method _setModel()
         * Extracts mongo Model from schema, save Model.
         * @return {*}
         */
        _setModel : function () {

            // skip
            if (!this.$.schema) {
                return this;
            }

            // extract mongo model
            this.$.Model = this.$.schema.get('mongo.Model');

            // make chainable
            return this;

        },

        /**
         * @method _setListeners()
         * Sets event listeners for pre-set CRUD and custom
         * services, listeners can be triggered from outside
         * Service as well as from inside (routes).
         @ return {*}
         */
        _setListeners : function () {

            var self = this;

            /**
             * @middleware normalize
             * Middleware that normalizes callback based on existing
             * response object.
             * @params {required}{obj} req
             * @params {required}{obj} res
             * @params {required}{fun} next
             */
            var normalize = function (req, res) {

                // normalize
                req.body = (typeof req.body !== 'undefined')
                    ? req.body
                    : {};

                // normalize
                req.params = (typeof req.params !== 'undefined')
                    ? req.params
                    : {};

                // make method available on params object
                if (typeof req.method !== 'undefined') {
                    req.params.method = req.method.toUpperCase();
                }

                // make url available on params object
                if (typeof req.url !== 'undefined') {
                    req.params.url = req.url;
                }

                // normalize
                req.query = (typeof req.query !== 'undefined')
                    ? req.query
                    : {};

                // normalize
                res = res || util.noop;

                // create callback factory
                var cb = function (err, body, status, code, debug) {
                    self._cb(req, res, err, body, status, code, debug);
                };

                return {
                    cb  : cb,
                    req : req
                };

            };

            // get restify app object
            var app = this.$.app;

            // reset
            var obj;

            // id key
            var id = this.$.id;

            // reset namespace
            var ns;

            // set event listener based on set function fn is string,
            // meaning a pre-set crud function or a custom function
            switch (self.$.fn) {

                // INDEX

                case 'index' :

                    // set namespace
                    ns = this.$.namespace + ':index';

                    // skip
                    // if already set, no stacking
                    // of event listeners
                    if (this._getListener(ns)) {
                        return this;
                    }

                    // set listener
                    app.on(ns, function (req, res) {
                        var options = normalize(req, res);
                        self._get(options.req, options.cb);
                    });

                    break;

                // CRUD

                case 'create' :

                    // set namespace
                    ns = this.$.namespace + ':create';

                    // skip
                    // if already set, no stacking
                    // of event listeners
                    if (this._getListener(ns)) {
                        return this;
                    }

                    // set listener
                    app.on(ns, function (req, res) {
                        var options = normalize(req, res);
                        self._new(options.req, options.cb);
                    });

                    break;

                case 'retrieve' :

                    // set namespace
                    ns = this.$.namespace + ':retrieve';

                    // skip
                    // if already set, no stacking
                    // of event listeners
                    if (this._getListener(ns)) {
                        return this;
                    }

                    // set listener
                    app.on(ns, function (req, res) {
                        var options = normalize(req, res);
                        self._getById(options.req, options.cb);
                    });

                    break;

                case 'update' :

                    // set namespace
                    ns = this.$.namespace + ':update';

                    // skip
                    // if already set, no stacking
                    // of event listeners
                    if (this._getListener(ns)) {
                        return this;
                    }

                    // set listener
                    app.on(ns, function (req, res) {

                        var options = normalize(req, res);

                        // no id, invoke on multiple documents
                        if (typeof options.req.params[id] === 'undefined') {
                            return self._set(options.req, options.cb);
                        }

                        // id set, invoke on single document
                        self._setById(options.req, options.cb);

                    });

                    break;

                case 'delete' :

                    // set namespace
                    ns = this.$.namespace + ':delete';

                    // skip
                    // if already set, no stacking
                    // of event listeners
                    if (this._getListener(ns)) {
                        return this;
                    }

                    // set listener
                    app.on(ns, function (req, res) {

                        var options = normalize(req, res);

                        // no id, invoke on multiple documents
                        if (typeof options.req.params[id] === 'undefined') {
                            return self._del(options.req, options.cb);
                        }

                        // id set, invoke on single document only
                        self._delById(options.req, options.cb);

                    });

                    break;

                // CUSTOM

                default :

                    // set namespace
                    ns = this.$.namespace;

                    // skip
                    // if already set, no stacking
                    // of event listeners
                    if (this._getListener(ns)) {
                        return this;
                    }

                    // set listener
                    app.on(ns, function (req, res) {
                        var options = normalize(req, res);
                        self.$.fn(options.req, options.cb);
                    });

                    break;

            }

            // make chainable
            return this;

        },

        /**
         * @method _setNamespace()
         * Handles case in which no namepsace is set, falls
         * back to url instead.
         * @returns {*}
         */
        _setNamespace : function () {

            // extract namespace
            var ns = this.$.namespace;

            // if not set fall back to url
            if (!ns) {
                ns = this.$.prefix + ':' + this.$.method + ':' + this.$.route;
            }

            // save
            this.$.namespace = ns;

            // make chainable
            return this;

        },

        /**
         * @method _setPayload()
         * Converts incoming array of field names into mongoose
         * style of payload (being object keys set to true / false).
         */
        _setPayload : function () {

            var payload = this.$.payload;

            // convert array into object
            if (_.isArray(payload)) {

                var obj = {};

                // if more than 0 entries convert into
                // mongoose object
                if (payload.length > 0) {

                    for (var i = 0; i < payload.length; i++) {
                        obj[payload[i]] = 1;
                    }

                }

                // save
                this.$.payload = obj;

            }

            // make chainable
            return this;

        },

        /**
         * @method _setRoutes()
         * Set service routes for pre-set CRUD or custom
         * methods.
         * @returns {*}
         */
        _setRoute : function () {

            var self = this;

            // skip
            // if no route set
            if (!this.$.route) {
                return this;
            }

            // get restify app object
            var app = this.$.app;

            // get method
            // force lower case
            var method = this.$.method.toLowerCase();

            // normalize method
            if (method === 'delete') {
                method = 'del'
            }

            // normalize context
            var context = this.$.context || '';

            // find middleware
            var middleware = this._setMiddleware();

            // set route
            app[method]({
                name : method.toUpperCase() + ': ' + this.$.route,
                path : context + this.$.route
            }, middleware, function (req, res, next) {

                // add crud verb in case of pre-set
                // crud functions, otherwise leave
                // it with namespace alone
                if (_.isString(self.$.fn)) {
                    app.emit(self.$.namespace + ':' + self.$.fn, req, res);
                } else {
                    app.emit(self.$.namespace, req, res);
                }

            });

            // make chainable
            return this;

        },

        /**
         * @method _callback(req, fn, err, body, status[,code][,debug]);
         * General callback after db operations.
         * @params {required}{obj} req
         * @params {required}{fun} fn
         * @params {required}{obj|bol} err
         * @params {required}{obj} body
         * @params {required}{int} status
         * @params {optional}{int} code
         * @params {required}{obj} debug
         */
        _cb : function (req, res, err, body, status, code, debug) {

            var self = this;

            // normalize
            debug = debug || null;
            err = err || false;
            status = status || 200;
            code = code || 0;

            // force error in case of status codes
            // than >= 400
            if (!err && status >= 400) {
                err = true;
            }

            // skip
            if (err) {

                // save stack
                var stack = err.stack || [];
                var str = JSON.stringify(err);

                if (_.isObject(err)) {
                    if (stack.length > 0) {
                        stack.unshift(str);
                    } else {
                        stack.push(str)
                    }
                }

                // create error payload
                var payload = {
                    code    : code,
                    debug   : debug,
                    origin  : {
                        collection : self.$.schema === null ? null : self.$.schema.get('collection'),
                        context    : self.$.context,
                        fn         : _.isFunction(self.$.fn) ? 'custom' : self.$.fn,
                        method     : self.$.method,
                        namespace  : self.$.namespace,
                        resource   : self.$.schema !== null,
                        route      : self.$.route,
                        strict     : self.$.schema === null ? null : self.$.schema.get('options.strict')
                    },
                    message : self.$.errors[code] || 'UNKNOWN',
                    stack   : stack,
                    status  : status
                };

                // response
                if (_.isFunction(res)) {

                    // response
                    // error (internal request)
                    return res(payload, null, status, code, debug);

                }

                // differences to express
                var protocol = req.isSecure() ? 'https' : 'http';
                var uri = req.url.replace('//', '/');

                // extend payload with http info
                _.extend(payload, {
                    headers  : req.headers,
                    host     : req.headers.host,
                    method   : req.method,
                    protocol : protocol,
                    uri      : uri,
                    url      : protocol + '://' + req.headers.host + uri
                });

                // response
                // error (external (http) request)
                return this.$.server.send(req, res, payload, null, status, code, debug);

            }

            // success (internal)
            if (_.isFunction(res)) {
                return res(null, body, status);
            }

            // succes (response)
            this.$.server.send(req, res, null, body, status);

        },

        // PRIVATE: QUERIES

        /**
         * @method _new(req[,fn])
         * Creates new document based on body.
         * @params {required}{obj} req
         *    @key {required}{obj} req.body
         *    @key {required}{obj} req.params
         *    @key {required}{obj} req.query
         * @params {optional}{fun} fn
         */
        _new : function (req, fn) {

            // preserve scope
            var self = this;

            // normalize
            fn = fn || util.noop;

            // extract
            var body = req.body;
            var params = req.params;
            var query = req.query;

            // validate
            if (!_.isObject(body)) {
                return fn(true, null, 409, 409002);
            }

            // extend body object
            _.extend(body, {
                created : date.getUTCLocal(),
                updated : date.getUTCLocal()
            });

            // get mongo model
            var model = new this.$.Model(body);

            // create document
            model.save(function (err, doc) {

                // skip!
                if (err) {
                    return fn(err, null, 400, 400004);
                }

                // normalize
                doc = doc.toObject();

                // normalize _id
                if (doc._id && typeof doc._id === 'object') {
                    doc._id = doc._id.toString();
                }

                // normalize id
                if (doc.id && typeof doc.id === 'object') {
                    doc.id = doc.id.toString();
                }

                // exit
                return fn(null, doc, 201);

            });

        },

        /**
         * @method _get(req[,fn])
         * Returns multiple documents, found by query object, results
         * based on options object.
         * @params {required}{obj} req
         *    @key {required}{obj} req.body
         *    @key {required}{obj} req.params
         *    @key {required}{obj} req.query
         * @params {optional}{fun} fn
         */
        _get : function (req, fn) {

            // normalize
            fn = fn || util.noop;

            // extract
            var body = req.body;
            var params = req.params;
            var query = req.query;

            // get defaults
            var defaults = this.$.defaults;

            // set limit
            // limit represents the maximum number of documents retrieved
            // from database, set to a maximum number by default (check
            // resource configuration for default value)
            var limit = (typeof query.limit === 'undefined')
                ? defaults.limit
                : parseInt(query.limit);

            // set offset
            // offset represents the starting point of the database cursor
            // which it uses to fetch  documents form database, (check
            // resource configuration for default value)
            var offset = (typeof query.offset === 'undefined')
                ? defaults.offset
                : parseInt(query.offset);

            // set offset from page
            // page represents starting point of database cursor, but needs
            // to be converted into offset value first, overwrites existing
            // offset, falls back to already set offset, (check resource
            // configuration for default value)
            offset = (typeof query.page === 'undefined')
                ? offset
                : (parseInt(query.page) - 1) * limit;

            // set sorting
            // sets default sorting object for mongo to know in which order
            // to return documents, (check resource configuration for default
            // value)
            var sort = (typeof query.sort === 'undefined')
                ? defaults.sort
                : query.sort;

            // clean up query object, as a result query object might still
            // contain mongoose query, empty object is possible as well (
            // classic index call)
            delete query.limit;
            delete query.offset;
            delete query.page;
            delete query.sort;

            // find documents
            this.$.Model
                .find(query)
                .limit(limit)
                .skip(offset)
                .sort(sort)
                .select(this.$.payload)
                .exec(function (err, docs) {

                    // skip!
                    if (err) {
                        return fn(err, null, 400, 400005);
                    }

                    // skip!
                    // normalize body to null
                    if (!docs || docs.length === 0) {
                        return fn(true, null, 404, 404001);
                    }

                    // normalize
                    _.map(docs, function (doc) {
                        doc = doc.toObject();
                    });

                    // exit
                    return fn(null, docs, 200);

                });

        },

        /**
         * @method _getById(req[,fn])
         * Returns single document, found by id.
         * @params {required}{obj} req
         *    @key {required}{obj} req.body
         *    @key {required}{obj} req.params
         *    @key {required}{obj} req.query
         * @params {optional}{fun} fn
         */
        _getById : function (req, fn) {

            // normalize
            fn = fn || util.noop;

            // extract
            var body = req.body;
            var params = req.params;
            var query = req.query;

            // get id, force string
            var id = params[this.$.id] + '';

            // create query
            var query = {
                _id : id
            };

            // find document
            this.$.Model
                .findOne(query)
                .select(this.$.payload)
                .exec(function (err, doc) {

                    // skip!
                    if (err) {
                        return fn(err, null, 400, 400005);
                    }

                    // skip!
                    // normalize body to null
                    if (!doc) {
                        return fn(true, null, 404, 404001);
                    }

                    // normalize
                    doc = doc.toObject();

                    // exit
                    return fn(null, doc, 200);

                });

        },

        /**
         * @method _set(req[,fn])
         * Updates multiple documents based on body, found by query.
         * @params {required}{obj} req
         *    @key {required}{obj} req.body
         *    @key {required}{obj} req.params
         *    @key {required}{obj} req.query
         * @params {optional}{fun} fn
         */
        _set : function (req, fn) {

            // normalize
            fn = fn || util.noop;

            // extract
            var body = req.body;
            var params = req.params;
            var query = req.query;

            // validate
            // avoid massive updates, caused by empty queries
            // enforce reasonable queries (if safe is set to
            // true)
            if (_.isEmpty(query)) {
                if (this.$.safe === true) {
                    return fn(true, null, 400, 400006);
                }
            }

            // extend body object
            _.extend(body, {
                updated : date.getUTCLocal()
            });

            // update documents
            this.$.Model
                .update(query, body, {
                    multi : true
                })
                .select(this.$.payload)
                .exec(function (err, num) {

                    // skip!
                    if (err) {
                        return fn(err, true, 400, 400007);
                    }

                    // skip!
                    // no document affected
                    if (!num) {
                        return fn(true, err, 404, 404002);
                    }

                    // exit
                    return fn(null, {
                        affected : num
                    }, 204);

                });

        },

        /**
         * @method _setById(req[,fn])
         * Updates single document, found by id.
         * @params {required}{obj} req
         *    @key {required}{obj} req.body
         *    @key {required}{obj} req.params
         *    @key {required}{obj} req.query
         * @params {optional}{fun} fn
         */
        _setById : function (req, fn) {

            // normalize
            fn = fn || util.noop;

            // extract
            var body = req.body;
            var params = req.params;
            var query = req.query;

            // get id, force string
            var id = params[this.$.id] + '';

            // extend body object
            _.extend(body, {
                updated : date.getUTCLocal()
            });

            // create query
            var query = {
                _id : id
            };

            // update document
            this.$.Model
                .findOneAndUpdate(query, body)
                .select(this.$.payload)
                .exec(function (err, num) {

                    // skip!
                    if (err) {
                        return fn(err, null, 400, 400007);
                    }

                    // skip!
                    // normalize body to null
                    if (!num) {
                        return fn(true, err, 404, 404002);
                    }

                    // normalize
                    // mongo will return object, if only one
                    // document was affected
                    if (_.isObject(num)) {
                        num = 1;
                    }

                    // exit
                    return fn(null, {
                        affected : num
                    }, 204);

                });

        },

        /**
         * @method _del(req[,fn])
         * Deletes multiple documents, found by query.
         * @params {required}{obj} req
         *    @key {required}{obj} req.body
         *    @key {required}{obj} req.params
         *    @key {required}{obj} req.query
         * @params {optional}{fun} fn
         */
        _del : function (req, fn) {

            // normalize
            fn = fn || util.noop;

            // extract
            var body = req.body;
            var params = req.params;
            var query = req.query;

            // validate
            if (!_.isObject(query)) {
                return fn(true, null, 409, 409002);
            }

            // validate
            // avoid massive deletes, caused by empty queries
            // enforce reasonable queries (if safe is set to
            // true)
            if (_.isEmpty(query)) {
                if (this.$.safe === true) {
                    return fn(true, null, 400, 400006);
                }
            }

            // get mongo model
            var Model = this.$.Model;

            // remove documents
            this.$.Model
                .remove(query)
                .select(this.$.payload)
                .exec(function (err, num) {

                    // skip!
                    if (err) {
                        return fn(err, null, 400, 400008);
                    }

                    // skip
                    // no documents affected
                    if (!num) {
                        return fn(true, err, 404, 404002);
                    }

                    // normalize
                    // mongo will return object, if only one
                    // document was affected
                    if (_.isObject(num)) {
                        num = 1;
                    }

                    // exit
                    return fn(null, {
                        affected : num
                    }, 204);

                });

        },

        /**
         * @method _delById(req[,fn])
         * Deletes single document, found by id.
         * @params {required}{obj} req
         *    @key {required}{obj} req.body
         *    @key {required}{obj} req.params
         *    @key {required}{obj} req.query
         * @params {optional}{fun} fn
         */
        _delById : function (req, fn) {

            // normalize
            fn = fn || util.noop;

            // extract
            var body = req.body;
            var params = req.params;
            var query = req.query;

            // get id, force string
            var id = params[this.$.id] + '';

            // create query
            var query = {
                _id : id
            };

            // remove document
            this.$.Model
                .findOneAndRemove(query)
                .select(this.$.payload)
                .exec(function (err, num) {

                    // skip!
                    if (err) {
                        return fn(err, null, 400, 400008);
                    }

                    // skip!
                    // normalize body to null
                    if (!num) {
                        return fn(true, err, 404, 404002);
                    }

                    // normalize
                    // mongo will return object, if only one
                    // document was affected
                    if (_.isObject(num)) {
                        num = 1;
                    }

                    // exit
                    return fn(null, {
                        affected : num
                    }, 204);

                });

        }

    });

});