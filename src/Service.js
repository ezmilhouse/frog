if (typeof define !== 'function') {
    var _ = require('underscore');
    var define = require('amdefine')(module);
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
                defaults   : {
                    limit  : 100,
                    offset : 0,
                    page   : 1,
                    sort   : {}
                },
                fn         : null,
                id         : 'id',
                method     : null,
                middleware : [],
                Model      : null,
                namespace  : null,
                payload    : [],
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
                // internal requests might come with nothing
                // but a callback function, therefore we have
                // to normalize req, res objects here
                switch (arguments.length) {
                    case 0 :
                        req = {
                            body   : {},
                            params : {},
                            query  : {}
                        };
                        res = null;
                        break;
                    default :
                        if (_.isFunction(req)) {
                            res = req;
                            req = {
                                body   : {},
                                params : {},
                                query  : {}
                            };
                        } else {
                            req = req || {};
                            res = res || null;
                        }
                        break;
                }

                // reset callback
                var cb = util.noop;

                // normalize
                req.body = (typeof req.body !== 'undefined')
                    ? req.body
                    : {};

                // normalize
                req.params = (typeof req.params !== 'undefined')
                    ? req.params
                    : {};

                // add headers, method, url
                _.extend(req.params, {
                    headers : req.headers,
                    method  : req.method.toUpperCase(),
                    url     : req.url
                });

                // normalize
                req.query = (typeof req.query !== 'undefined')
                    ? req.query
                    : {};

                // differentiate between incoming (native)
                // res object, and incoming callback
                if (_.isFunction(res)) {

                    // set callback
                    cb = res;

                } else {

                    // set callback to common send function
                    cb = function (err, body, status, code, debug) {

                        // response object is available,
                        // sending back results is possible
                        if (res) {
                            return self.$.server.send(req, res, err, body, status, code, debug);
                        }

                        // placeholder if response object
                        // is not available
                        util.noop();

                    }

                }

                return {
                    body   : req.body,
                    cb     : cb,
                    params : req.params,
                    query  : req.query
                }

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
                    ns = 'service:' + this.$.namespace + ':index';

                    // skip
                    // if already set, no stacking
                    // of event listeners
                    if (this._getListener(ns)) {
                        return this;
                    }

                    // set listener
                    app.on(ns, function (req, res) {
                        req = normalize(req, res);
                        self._get(req.params, req.body, req.query, req.cb);
                    });

                    break;

                // CRUD

                case 'create' :

                    // set namespace
                    ns = 'service:' + this.$.namespace + ':create';

                    // skip
                    // if already set, no stacking
                    // of event listeners
                    if (this._getListener(ns)) {
                        return this;
                    }

                    // set listener
                    app.on(ns, function (req, res) {
                        req = normalize(req, res);
                        self._new(req.params, req.body, req.query, req.cb);
                    });

                    break;

                case 'retrieve' :

                    // set namespace
                    ns = 'service:' + this.$.namespace + ':retrieve';

                    // skip
                    // if already set, no stacking
                    // of event listeners
                    if (this._getListener(ns)) {
                        return this;
                    }

                    // set listener
                    app.on(ns, function (req, res) {
                        req = normalize(req, res);
                        self._getById(req.params, req.body, req.query, req.cb);
                    });

                    break;

                case 'update' :

                    // set namespace
                    ns = 'service:' + this.$.namespace + ':update';

                    // skip
                    // if already set, no stacking
                    // of event listeners
                    if (this._getListener(ns)) {
                        return this;
                    }

                    // set listener
                    app.on(ns, function (req, res) {

                        req = normalize(req, res);

                        // no id, invoke on multiple documents
                        if (typeof req.params[id] === 'undefined') {
                            return self._set(req.params, req.body, req.query, req.cb);
                        }

                        // id set, invoke on single document
                        self._setById(req.params, req.body, req.query, req.cb);

                    });

                    break;

                case 'delete' :

                    // set namespace
                    ns = 'service:' + this.$.namespace + ':delete';

                    // skip
                    // if already set, no stacking
                    // of event listeners
                    if (this._getListener(ns)) {
                        return this;
                    }

                    // set listener
                    app.on(ns, function (req, res) {

                        req = normalize(req, res);

                        // no id, invoke on multiple documents
                        if (typeof req.params[id] === 'undefined') {
                            return self._del(req.params, req.body, req.query, req.cb);
                        }

                        // id set, invoke on single document only
                        self._delById(req.params, req.body, req.query, req.cb);

                    });

                    break;

                // CUSTOM

                default :

                    // set namespace
                    ns = 'service:' + this.$.namespace;

                    // skip
                    // if already set, no stacking
                    // of event listeners
                    if (this._getListener(ns)) {
                        return this;
                    }

                    // set listener
                    app.on(ns, function (req, res) {
                        req = normalize(req, res);
                        self.$.fn(req.params, req.body, req.query, req.cb);
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
                ns = this.$.method + ':' + this.$.route;
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

            /**
             * @middleware normalize
             * MIddleware tha t normalizes request objects.
             * @params {required}{obj} req
             * @params {required}{obj} res
             * @params {required}{fun} next
             */
            var normalize = function (req, res, next) {

                // normalize
                req.body = req.body || {};
                req.query = req.query || {};
                req.params = req.params || {};

                // exit
                next();

            };

            // get restify app object
            var app = this.$.app;

            // get method
            // force lower case
            var method = this.$.method.toLowerCase();

            // normalize method
            if (method === 'delete') {
                method = 'del'
            }

            // set route
            app[method]({
                name : method.toUpperCase() + ': ' + this.$.route,
                path : this.$.route
            }, normalize, function (req, res, next) {

                // add crud verb in case of pre-set
                // crud functions, otherwise leave
                // it with namespace alone
                if (_.isString(self.$.fn)) {
                    app.emit('service:' + self.$.namespace + ':' + self.$.fn, req, res);
                } else {
                    app.emit('service:' + self.$.namespace, req, res);
                }

            });

            // make chainable
            return this;

        },

        // PRIVATE: QUERIES

        /**
         * @method _new(params, body, query[,fn])
         * Creates new document based on body.
         * @params {required}{obj} params
         * @params {required}{obj} body
         * @params {required}{obj} query
         * @params {optional}{fun} fn
         */
        _new : function (params, body, query, fn) {

            // normalize
            fn = fn || util.noop;

            // validate
            if (_.isEmpty(body)) {
                return fn(true, null, 400, 400104);
            }

            // extend body object
            _.extend(body, {
                _created : date.getUTCLocal(),
                _updated : date.getUTCLocal()
            });

            // get mongo model
            var model = new this.$.Model(body);

            // create document
            model.save(function (err, doc) {

                // skip!
                if (err) {
                    return fn(true, err, 400, 400100);
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
         * @method _get(params, body, query[,fn])
         * Returns multiple documents, found by query object, results
         * based on options object.
         * @params {required}{obj} params
         * @params {required}{obj} body
         * @params {required}{obj} query
         * @params {optional}{fun} fn
         */
        _get : function (params, body, query, fn) {

            // normalize
            fn = fn || util.noop;

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
                        return fn(true, err, 400, 400101);
                    }

                    // skip!
                    // normalize body to null
                    if (!docs || docs.length === 0) {
                        return fn(null, null, 404, 404100);
                    }

                    // normalize
                    _.map(docs, function (doc) {
                        return doc.toObject();
                    });

                    // exit
                    return fn(null, docs, 200);

                });

        },

        /**
         * @method _getById(params, body, query[,fn])
         * Returns single document, found by id.
         * @params {required}{obj} params
         * @params {required}{obj} body
         * @params {required}{obj} query
         * @params {optional}{fun} fn
         */
        _getById : function (params, body, query, fn) {

            // normalize
            fn = fn || util.noop;

            // set id
            var id = params[this.$.id];

            // validate
            if (!id) {
                return fn(true, null, 400, 400102);
            }

            // find document
            this.$.Model
                .findOne({
                    _id : id
                })
                .select(this.$.payload)
                .exec(function (err, doc) {

                    // skip!
                    if (err) {
                        return fn(true, err, 400, 400103);
                    }

                    // skip!
                    // normalize body to null
                    if (!doc) {
                        return fn(null, null, 404, 404101);
                    }

                    // normalize
                    doc = doc.toObject();

                    // exit
                    return fn(null, doc, 200);

                });

        },

        /**
         * @method _set(params, body, query[,fn])
         * Updates multiple documents based on body, found by query.
         * @params {required}{obj} params
         * @params {required}{obj} body
         * @params {required}{obj} query
         * @params {optional}{fun} fn
         */
        _set : function (params, body, query, fn) {

            // normalize
            fn = fn || util.noop;

            // validate
            // avoid massive updates, caused by empty queries
            // enforce reasonable queries (if safe is set to
            // true)
            if (_.isEmpty(query)) {
                if (this.$.safe === true) {
                    return fn(true, null, 400, 400106);
                }
            }

            // extend body object
            _.extend(body, {
                _updated : date.getUTCLocal()
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
                        return fn(true, err, 400, 400107);
                    }

                    // skip!
                    // no document affected
                    if (!num) {
                        return fn(true, err, 404, 404102);
                    }

                    // exit
                    return fn(null, {
                        _count : num
                    }, 204);

                });

        },

        /**
         * @method _setById(params, body, query[,fn])
         * Updates single document, found by id.
         * @params {required}{obj} params
         * @params {required}{obj} body
         * @params {required}{obj} query
         * @params {optional}{fun} fn
         */
        _setById : function (params, body, query, fn) {

            // normalize
            fn = fn || util.noop;

            // set id
            var id = params[this.$.id];

            // validate
            if (!id) {
                return fn(true, null, 400, 400108);
            }

            // extend body object
            _.extend(body, {
                _updated : date.getUTCLocal()
            });

            // update document
            this.$.Model
                .findOneAndUpdate({
                    _id : id
                }, body)
                .select(this.$.payload)
                .exec(function (err, num) {

                    // skip!
                    if (err) {
                        return fn(true, err, 400, 400110);
                    }

                    // skip!
                    // normalize body to null
                    if (!num) {
                        return fn(true, err, 404, 404103);
                    }

                    // normalize
                    // mongo will return object, if only one
                    // document was affected
                    if (_.isObject(num)) {
                        num = 1;
                    }

                    // exit
                    return fn(null, {
                        _count : num
                    }, 204);

                });

        },

        /**
         * @method _del(params, body, query[,fn])
         * Deletes multiple documents, found by query.
         * @params {required}{obj} params
         * @params {required}{obj} body
         * @params {required}{obj} query
         * @params {optional}{fun} fn
         */
        _del : function (params, body, query, fn) {

            // normalize
            fn = fn || util.noop;

            // validate
            // avoid massive deletes, caused by empty queries
            // enforce reasonable queries (if safe is set to
            // true)
            if (_.isEmpty(query)) {
                if (this.$.safe === true) {
                    return fn(true, null, 400, 400111);
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
                        return fn(true, err, 400, 400112);
                    }

                    // skip
                    // no documents affected
                    if (!num) {
                        return fn(true, err, 404, 404104);
                    }

                    // normalize
                    // mongo will return object, if only one
                    // document was affected
                    if (_.isObject(num)) {
                        num = 1;
                    }

                    // exit
                    return fn(null, {
                        _count : num
                    }, 204);

                });

        },

        /**
         * @method _delById(params, body, query[,fn])
         * Deletes single document, found by id.
         * @params {required}{obj} params
         * @params {required}{obj} body
         * @params {required}{obj} query
         * @params {optional}{fun} fn
         */
        _delById : function (params, body, query, fn) {

            // normalize
            fn = fn || util.noop;

            // set id
            var id = params[this.$.id];

            // validate
            if (!id) {
                return fn(true, null, 400, 'ERROR_MONGO_ID_IS_MISSING');
            }

            this.$.Model
                .findOneAndRemove({
                    _id : id
                })
                .select(this.$.payload)
                .exec(function (err, num) {

                    // skip!
                    if (err) {
                        return fn(true, err, 400, 400113);
                    }

                    // skip!
                    // normalize body to null
                    if (!num) {
                        return fn(true, err, 404, 404105);
                    }

                    // normalize
                    // mongo will return object, if only one
                    // document was affected
                    if (_.isObject(num)) {
                        num = 1;
                    }

                    // exit
                    return fn(null, {
                        _count : num
                    }, 204);

                });

        }

    });

});