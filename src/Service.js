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
                app       : singleton.app,
                cb        : null,
                defaults  : {
                    limit  : 100,
                    offset : 0,
                    page   : 1,
                    sort   : {
                        '_created' : -1
                    }
                },
                fn        : null,
                id        : null,
                method    : null,
                Model     : null,
                namespace : null,
                route     : null,
                schema    : null,
                server    : singleton.server
            };

            if (options) {
                _.extend(this.$, options);
            }

            // prepare
            this._setListeners();
            this._setModel();
            this._setRoute();

            return this;

        },

        // PRIVATE

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
             * MIddleware tha t normalizes request objects.
             * @params {required}{obj} req
             * @params {required}{obj} res
             * @params {required}{fun} next
             */
            var normalize = function() {

            };

            // get restify app object
            var app = this.$.app;

            // set event listener based on set function fn is string,
            // meaning a pre-set crud function or a custom function
            switch (self.$.fn) {

                // INDEX

                case 'index' :
                    app.on('service:' + this.$.namespace + ':index', function(req, res) {


                        // HIER GEHT'S WEITER
                        // normalize für den Fall, interner event call,
                        // kein req, res object
                        // send method anpassen, wenn res null, erneuter callback
                        // vielleicht send Methode in Service Klasse?

                        self._get(req.params, req.body, req.query, function(err, body, status, code) {
                            self.$.server.send(req, res, err, body, status, code);
                        });

                    });
                    break;

                // CRUD

                case 'create' :
                    app.on('service:' + this.$.namespace + ':create', function(req, res) {
                        self._get(req.params, req.body, req.query, function(err, body, status, code) {
                            self.$.server.send(req, res, err, body, status, code);
                        });
                    });
                    break;

                case 'retrieve' :
                    app.on('service:' + this.$.namespace + ':retrieve', function(req, res) {
                        self._get(req.params, req.body, req.query, function(err, body, status, code) {
                            self.$.server.send(req, res, err, body, status, code);
                        });
                    });
                    break;

                case 'update' :
                    app.on('service:' + this.$.namespace + ':update', function(req, res) {
                        self._get(req.params, req.body, req.query, function(err, body, status, code) {
                            self.$.server.send(req, res, err, body, status, code);
                        });
                    });
                    break;

                case 'delete' :
                    app.on('service:' + this.$.namespace + ':delete', function(req, res) {
                        self._get(req.params, req.body, req.query, function(err, body, status, code) {
                            self.$.server.send(req, res, err, body, status, code);
                        });
                    });
                    break;

                // CUSTOM

                default :
                    app.on('service:' + this.$.namespace, function(req, res) {
                        self.$.fn(req.params, req.body, req.query, function(err, body, status, code) {
                            self.$.server.send(req, res, err, body, status, code);
                        });
                    });
                    break;

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
         * @method _new(params, body, query[,cb])
         * Creates new document based on body.
         * @params {required}{obj} params
         * @params {required}{obj} body
         * @params {required}{obj} query
         * @params {optional}{fun} cb
         */
        _new : function (params, body, query, cb) {

            // normalize
            cb = cb || util.noop;

            // validate
            if (_.isEmpty(body)) {
                return cb(true, null, 400, 'ERROR_MONGO_BODY_IS_EMPTY');
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
                    console.log(body, err);
                    return cb(true, err, 400, 'ERROR_MONGO_DOCUMENT_NOT_CREATED');
                }

                // normalize
                doc = doc.toObject();

                // exit
                return cb(null, doc, 201);

            });

        },

        /**
         * @method _get(params, body, query[,cb])
         * Returns multiple documents, found by query object, results
         * based on options object.
         * @params {required}{obj} params
         * @params {required}{obj} body
         * @params {required}{obj} query
         * @params {optional}{fun} cb
         */
        _get : function (params, body, query, cb) {

            // normalize
            cb = cb || util.noop;

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

            // get mongo model
            var Model = this.$.Model;

            // find documents
            Model.find(query, {}, {
                limit : limit,
                skip  : offset,
                sort  : sort
            }, function (err, docs) {

                // skip!
                if (err) {
                    return cb(true, err, 400, 'ERROR_MONGO_DOCUMENT_FIND_FAILED');
                }

                // skip!
                // normalize body to null
                if (!docs || docs.length === 0) {
                    return cb(null, null, 200);
                }

                // normalize
                _.map(docs, function (doc) {
                    return doc.toObject();
                });

                // exit
                return cb(null, docs, 200);

            });

        },

        /**
         * @method _getById(params, body, query[,cb])
         * Returns single document, found by id.
         * @params {required}{obj} params
         * @params {required}{obj} body
         * @params {required}{obj} query
         * @params {optional}{fun} cb
         */
        _getById : function (params, body, query, cb) {

            // normalize
            cb = cb || util.noop;

            // set id
            var id = params[this.$.id];

            // validate
            if (!id) {
                return cb(true, null, 400, 'ERROR_MONGO_ID_IS_MISSING');
            }

            // get mongo model
            var Model = this.$.Model;

            // find document
            Model.findOne({
                _id : id
            }, {}, function (err, doc) {

                // skip!
                if (err) {
                    return cb(true, err, 400, 'ERROR_MONGO_DOCUMENT_FIND_ONE_FAILED');
                }

                // skip!
                // normalize body to null
                if (!doc) {
                    return cb(null, null, 200);
                }

                // normalize
                doc = doc.toObject();

                // exit
                return cb(null, doc, 200);

            });

        },

        /**
         * @method _set(params, body, query[,cb])
         * Updates multiple documents based on body, found by query.
         * @params {required}{obj} params
         * @params {required}{obj} body
         * @params {required}{obj} query
         * @params {optional}{fun} cb
         */
        _set : function (params, body, query, cb) {

            // normalize
            cb = cb || util.noop;

            // validate
            if (_.isEmpty(body)) {
                return cb(true, null, 400, 'ERROR_MONGO_BODY_IS_EMPTY');
            }

            // validate
            // avoid massive updates, caused by empty queries
            // enforce reasonable queries
            if (_.isEmpty(query)) {
                return cb(true, null, 400, 'ERROR_MONGO_QUERY_IS_EMPTY');
            }

            // extend body object
            _.extend(body, {
                _updated : date.getUTCLocal()
            });

            // get mongo model
            var Model = this.$.Model;

            // update documents
            Model.update(query, body, function (err, num) {

                // skip!
                if (err) {
                    return cb(true, err, 400, 'ERROR_MONGO_DOCUMENT_UPDATE_FAILED');
                }

                // exit
                return cb(null, {
                    count : num
                }, 204);

            });

        },

        /**
         * @method _setById(params, body, query[,cb])
         * Updates single document, found by id.
         * @params {required}{obj} params
         * @params {required}{obj} body
         * @params {required}{obj} query
         * @params {optional}{fun} cb
         */
        _setById : function (params, body, query, cb) {

            // normalize
            cb = cb || util.noop;

            // set id
            var id = params[this.$.id];

            // validate
            if (!id) {
                return cb(true, null, 400, 'ERROR_MONGO_ID_IS_MISSING');
            }

            // validate
            if (_.isEmpty(body)) {
                return cb(true, null, 400, 'ERROR_MONGO_BODY_IS_EMPTY');
            }

            // extend body object
            _.extend(body, {
                _updated : date.getUTCLocal()
            });

            // get mongo model
            var Model = this.$.Model;

            // update document
            Model.findOneAndUpdate({
                _id : id
            }, body, function (err, num) {

                // skip!
                if (err) {
                    return cb(true, err, 400, 'ERROR_MONGO_DOCUMENT_UPDATE_ONE_FAILED');
                }

                // skip!
                // normalize body to null
                if (!num) {
                    return cb(true, err, 400, 'ERROR_MONGO_DOCUMENT_UPDATE_ONE_FAILED_NO_MATCHES');
                }

                // exit
                return cb(null, {
                    count : num
                }, 204);

            });

        },

        /**
         * @method _del(params, body, query[,cb])
         * Deletes multiple documents, found by query.
         * @params {required}{obj} params
         * @params {required}{obj} body
         * @params {required}{obj} query
         * @params {optional}{fun} cb
         */
        _del : function (params, body, query, cb) {

            // normalize
            cb = cb || util.noop;

            // validate
            // avoid massive updates, caused by empty queries
            // enforce reasonable queries
            if (_.isEmpty(query)) {
                return cb(true, null, 400, 'ERROR_MONGO_QUERY_IS_EMPTY');
            }

            // get mongo model
            var Model = this.$.Model;

            // update documents
            Model.remove(query, function (err, num) {

                // skip!
                if (err) {
                    return cb(true, err, 400, 'ERROR_MONGO_DOCUMENT_UPDATE_FAILED');
                }

                // exit
                return cb(null, {
                    count : num
                }, 204);

            });

        },

        /**
         * @method _delById(params, body, query[,cb])
         * Deletes single document, found by id.
         * @params {required}{obj} params
         * @params {required}{obj} body
         * @params {required}{obj} query
         * @params {optional}{fun} cb
         */
        _delById : function (params, body, query, cb) {

            // normalize
            cb = cb || util.noop;

            // set id
            var id = params[this.$.id];

            // validate
            if (!id) {
                return cb(true, null, 400, 'ERROR_MONGO_ID_IS_MISSING');
            }

            // get mongo model
            var Model = this.$.Model;

            // update document
            Model.findOneAndRemove({
                _id : id
            }, function (err, num) {

                // skip!
                if (err) {
                    return cb(true, err, 400, 'ERROR_MONGO_DOCUMENT_UPDATE_ONE_FAILED');
                }

                // skip!
                // normalize body to null
                if (!num) {
                    return cb(true, err, 400, 'ERROR_MONGO_DOCUMENT_UPDATE_ONE_FAILED_NO_MATCHES');
                }

                // exit
                return cb(null, {
                    count : num
                }, 204);

            });

        },

        // PUBLIC: INDEX

        /**
         * @object methods
         * Holds all methods that can be bound by fn
         * string.
         */
        methods : {

            /**
             * @shortcut _get(query[,fn])
             */
            index : function (query, options, fn) {
                this._get.apply(this, arguments);
            },

            // PUBLIC: CRUD

            /**
             * @shortcut _set(body[,fn])
             */
            create : function (body, fn) {
                this._new.apply(this, arguments);
            },

            /**
             * @shortcut _getById(id[,fn])
             */
            retrieve : function (id, fn) {
                this._getById.apply(this, arguments);
            },

            /**
             * @shortcut _setById(id, body[,fn])
             */
            update : function (id, body, fn) {
                this._setById.apply(this, arguments);
            },

            /**
             * @shortcut _delById(id[,fn])
             */
            remove : function (id, fn) {
                this._delById.apply(this, arguments);
            }

        }

    });

});