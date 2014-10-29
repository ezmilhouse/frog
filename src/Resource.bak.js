if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    'underscore',
    './Base',
    './date',
    './singleton',
    './util'
], function (_, Base, date, singleton, util) {

    return Base.extend({

        /**
         * @method _ctor([obj])
         * Constructor of Resource class.
         *
         * @params {optional}{obj} options
         * @return {*}
         */
        _ctor : function (options) {

            this.$ = {
                access     : {
                    http    : [
                        'GET',
                        'POST',
                        'PUT',
                        'DELETE',
                        'OPTIONS'
                    ],
                    queries : {
                        'index'    : {
                            allowedClientGroups : 100,
                            allowedClientKeys   : [],
                            deniedClientKeys    : []
                        },
                        'create'   : {
                            allowedClientGroups : 100,
                            allowedClientKeys   : [],
                            deniedClientKeys    : []
                        },
                        'retrieve' : {
                            allowedClientGroups : 100,
                            allowedClientKeys   : [],
                            deniedClientKeys    : []
                        },
                        'update'   : {
                            allowedClientGroups : 100,
                            allowedClientKeys   : [],
                            deniedClientKeys    : []
                        },
                        'delete'   : {
                            allowedClientGroups : 100,
                            allowedClientKeys   : [],
                            deniedClientKeys    : []
                        }
                    }
                },
                app        : null,
                callback   : util.noop,
                context    : '',
                id         : 'id0',
                key        : null,
                middleware : [],
                Model      : null,
                mongo      : {
                    collection : '',
                    Model      : null,
                    schema     : null
                },
                name       : null,
                namespace  : null,
                payloads   : {
                    max : {}
                },
                queries    : {},
                route      : '',
                schema     : null,
                server     : null,
                services   : {},
                tmp        : {},
                type       : 'mongo',
                defaults   : {
                    limit   : 100,
                    offset  : 0,
                    page    : 1,
                    sort    : {
                        '_created' : -1
                    }
                }
            };

            if (options) {
                _.extend(this.$, options);
            }

            // prepare
            this._setApp();
            this._setQueries();
            this._setMongo();
            this._setNamespace();
            this._setReference();
            this._setListeners();
            this._setEmitters();

            return this;

        },

        // PRIVATE

        /**
         * @method _checkClient(headers)
         * Checks headers arr for containing the pre-defined
         * client-key header key.
         *
         * @params {required}{arr} headers
         * @return {bol}
         */
        _checkClient : function (headers) {

            // get headers
            var headersAllowed = this.$.server.get('headers');

            // get headers key name
            var headersKey = headersAllowed.key.toLowerCase();

            // [-] exit
            // check for aka-ClientKey, return 401 if not found
            if (typeof headers[headersKey] === 'undefined') {
                return false;
            }

            // get clients
            var clients = singleton.clients;

            // [-] exit
            // check for valid client key, return 401 if not found, save
            // client info on request object if found
            var client = _.find(clients, function (obj) {
                return (obj.key === headers[headersKey]);
            });

            // if no regular client was found, doublecheck
            // if incoming might be a preset one
            if (!client) {

                // no key, no dev fallback, no access
                return null;

            } else {

                // save client
                return client;

            }

        },

        /**
         * @method _checkMethod(method)
         * Checks method and if method is allowed on this
         * resource.
         *
         * @params {required}{str} method
         * @return {bol}
         */
        _checkMethod : function (method) {

            method = method.toUpperCase();

            // [-] exit
            // check if incoming http method matches
            // one of the allowed methods, if not send
            // error
            if (this.$.access.http.indexOf(method) === -1) {
                return false;
            }

            // [+] exit
            return true;

        },

        /**
         * @method checkRules(name, client)
         * Checks pre-defined access rules against request on this
         * resource (might be CRUD, add. queries or services).
         *
         * @params {required}{str} name
         * @params {required}{obj} client
         * @return {bol}
         */
        _checkRules : function (name, client) {

            // [-] skip
            // if client is unknown
            if (!client) {
                return false;
            }

            // get rules
            var rules = this.$.access.queries[name];

            // [1] check client group
            // check if incoming client group matches (or is lower (better))
            // pre-defined client group
            if (parseInt(client.group) > rules.allowedClientGroups) {
                return false;
            }

            // [2]
            // check explicitly allowed client keys (only if keys are
            // set at all)
            if (rules.allowedClientKeys.length > 0) {
                var rule;
                rule = _.find(rules.allowedClientKeys, function (obj) {
                    return (obj === client.key);
                });
                if (!rule) {
                    return false;
                }
            }

            // [3]
            // check explicitly denied client keys (only if keys are
            // set at all)
            if (rules.deniedClientKeys.length > 0) {
                if (_.find(rules.deniedClientKeys, client.key)) {
                    return false;
                }
            }

            // [+] exit
            return true;

        },

        /**
         * @method _queryIndex(options[,fn])
         * Invokes database query, returns index (list) of documents.
         *
         * @params {required}{obj} options
         *    @key {optional}{int} limit
         *    @key {optional}{int} offset
         *    @key {optional}{bol} brute
         *    @key {optional}{int} page
         *    @key {optional}{str} payload
         *    @key {optional}{obj} query
         * @params {optional}{fun} fn
         */
        _queryIndex : function (options, fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            // get defaults
            var defaults = this.$.defaults;

            // set limit
            // limit represents the maximum number of documents retrieved
            // from database, set to a maximum number by default (check
            // resource configuration for default value)
            var limit = (typeof options.limit === 'undefined')
                ? defaults.limit
                : parseInt(options.limit);

            // set offset
            // offset represents the starting point of the database cursor
            // which it uses to fetch  documents form database, (check
            // resource configuration for default value)
            var offset = (typeof options.offset === 'undefined')
                ? defaults.offset
                : parseInt(options.offset);

            // set offset from page
            // page represents starting point of database cursor, but needs
            // to be converted into offset value first, overwrites existing
            // offset, falls back to already set offset, (check resource
            // configuration for default value)
            offset = (typeof options.page === 'undefined')
                ? offset
                : (parseInt(options.page) - 1) * limit;

            // set sorting
            // sets default sorting object for mongo to know in which order
            // to return documents, (check resource configuration for default
            // value)
            var sort = (typeof options.sort === 'undefined')
                ? defaults.sort
                : options.sort;

            // set query
            // queries are pre-defined in resource's config, query is fetched by
            // query name (default CRUD verbs plus custom)
            var query = (typeof options.query === 'undefined')
                ? {}
                : options.query;

            // database query
            this.$.mongo.Model
                .find(query, {}, {
                    limit : limit,
                    skip  : offset,
                    sort  : sort
                })
                .exec(function (err, docs) {

                    // [-] exit
                    // if database error occured
                    if (err) {
                        return fn(true, null, 400, 'ERROR_DB_QUERY');
                    }

                    // [-] exit
                    // if database did not return document(s)
                    if (!docs || !docs.length) {
                        return fn(true, null, 404, 'ERROR_DB_QUERY_NO_RESULTS');
                    }

                    // normalize
                    // prepare docs, plain js objects
                    var arr = [];
                    for (var i = docs.length; i--;) {
                        arr.push(docs[i].toObject());
                    }

                    // [+] exit
                    return fn(null, arr, 200);

                });

        },

        /**
         * @method _queryCreate(options[,fn])
         * Invokes database create of new document, returns document.
         *
         * @params {required}{obj} options
         *    @key {required}{obj} body
         *    @key {optional}{bol} brute
         *    @key {optional}{str} payload
         *    @key {optional}{obj} query
         * @params {optional}{fun} fn
         */
        _queryCreate : function (options, fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            // get defaults
            var defaults = this.$.defaults;

            // set body
            // body object is mandatory to create new database document
            if (typeof options.body === 'undefined') {

                // [-] exit
                return fn(true, null, 400, 'ERROR_DB_QUERY_BODY_DOES_NOT_EXIST_FOR_CREATE');

            } else {

                // extend body object with timestamps
                _.extend(options.body, {
                    _created : date.getUTCLocal(),
                    _updated : date.getUTCLocal()
                });

            }

            // create document
            var doc = new self.$.mongo.Model(options.body);

            // database create
            doc.save(function (err, doc) {

                // [-] exit
                // if database error occured
                if (err) {
                    return fn(true, null, 400, 'ERROR_DB_QUERY');
                }

                // [-] exit
                // if database did not return document(s)
                if (!doc) {
                    return fn(true, null, 404, 'ERROR_DB_QUERY_NO_RESULTS');
                }

                // normalize
                doc = doc.toObject();

                // [+] exit
                return fn(null, doc, 201);

            });

        },

        /**
         * @method _queryRetrieve(options[,fn])
         * Invokes database query, returns single document.
         *
         * @params {required}{obj} options
         *    @key {required}{str} id
         *    @key {optional}{bol} brute
         *    @key {optional}{str} payload
         *    @key {optional}{obj} query
         * @params {optional}{fun} fn
         */
        _queryRetrieve : function (options, fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            // get defaults
            var defaults = this.$.defaults;

            // set id
            var id = (typeof options.id === 'undefined')
                ? null
                : options.id;

            // set query
            // queries are pre-defined in resource's config, query is fetched by
            // query name (default CRUD verbs plus custom), id is mandatory in
            // case query is default one
            var query;
            if (typeof options.query === 'undefined') {
                if (!id) {
                    return fn(true, null, 400, 'ERROR_DB_QUERY_ID_NOT_SET');
                }
                query = {
                    '_id' : id
                };
            } else {
                query = options.query;
            }

            // database query
            this.$.mongo.Model
                .findOne(query, {})
                .exec(function (err, doc) {

                    // [-] exit
                    // if database error occured
                    if (err) {
                        return fn(true, null, 400, 'ERROR_DB_QUERY');
                    }

                    // [-] exit
                    // if database did not return document(s)
                    if (!doc) {
                        return fn(true, null, 404, 'ERROR_DB_QUERY_NO_RESULTS');
                    }

                    // normalize
                    doc = doc.toObject();

                    // [+] exit
                    return fn(null, doc, 200);

                });

        },

        /**
         * @method _queryUpdate(options[,fn])
         * Invokes database update, returns single document.
         *
         * @params {required}{obj} options
         *    @key {required}{str} id
         *    @key {required}{obj} body
         *    @key {optional}{bol} brute
         *    @key {optional}{str} payload
         *    @key {optional}{obj} query
         * @params {optional}{fun} fn
         */
        _queryUpdate : function (options, fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            // get defaults
            var defaults = this.$.defaults;

            // set id
            var id = (typeof options.id === 'undefined')
                ? null
                : options.id;

            // set query
            // queries are pre-defined in resource's config, query is fetched by
            // query name (default CRUD verbs plus custom), id is mandatory in
            // case query is default one
            var query;
            if (typeof options.query === 'undefined') {
                if (!id) {
                    return fn(true, null, 400, 'ERROR_DB_QUERY_ID_NOT_SET');
                }
                query = {
                    '_id' : id
                };
            } else {
                query = options.query;
            }

            // set body
            // body object is mandatory to create new database document
            if (typeof options.body === 'undefined') {

                // [-] exit
                return fn(true, null, 400, 'ERROR_DB_QUERY_BODY_DOES_NOT_EXIST_FOR_UPDATE');

            } else {

                // extend body object with timestamps
                _.extend(options.body, {
                    _updated : date.getUTCLocal()
                });

            }

            // database update
            this.$.mongo.Model
                .update(query, options.body, function (err, numAffected) {

                    // [-] exit
                    // if database error occured
                    if (err) {
                        return fn(true, null, 400, 'ERROR_DB_QUERY');
                    }

                    // [+] exit
                    return fn(null, null, 204);

                });

        },

        /**
         * @method _queryDelete(options[,fn])
         * Invokes database delete.
         *
         * @params {required}{obj} options
         *    @key {required}{str} id
         *    @key {optional}{bol} brute
         *    @key {optional}{str} payload
         *    @key {optional}{obj} query
         * @params {optional}{fun} fn
         */
        _queryDelete : function (options, fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            // get defaults
            var defaults = this.$.defaults;

            // set id
            var id = (typeof options.id === 'undefined')
                ? null
                : options.id;

            // set query
            // queries are pre-defined in resource's config, query is fetched by
            // query name (default CRUD verbs plus custom), id is mandatory in
            // case query is default one
            var query;
            if (typeof options.query === 'undefined') {
                if (!id) {
                    return fn(true, null, 400, 'ERROR_DB_QUERY_ID_NOT_SET');
                }
                query = {
                    '_id' : id
                };
            } else {
                query = options.query;
            }

            // database remove
            this.$.mongo.Model
                .remove(query, function (err) {

                    // [-] exit
                    // if database error occured
                    if (err) {
                        return fn(true, null, 400, 'ERROR_DB_QUERY');
                    }

                    // [+] exit
                    return fn(null, null, 204);

                });

        },

        /**
         * @method _setApp
         * Extracts restify application from server
         * instance.
         *
         * @return {*}
         */
        _setApp : function () {

            // extract app from server instance
            this.$.app = this.$.server.get('app');

            // make chainable
            return this;

        },

        /**
         * @method _setEmitters
         * Sets resource routes based on set route and
         * endpoint settings, emits query events (when
         * routes match).
         *
         * @return {*}
         */
        _setEmitters : function () {

            var self = this;

            // get server instance
            var server = this.$.server;

            // get express app instance
            var app = this.$.app;

            // get route context
            var context = this.$.context;

            // get route (prepend context if set)
            var route = (context !== '')
                ? context + this.$.route
                : this.$.route;

            // get middleware (add empty one if none is set)
            var middleware = (this.$.middleware.length > 0)
                ? this.$.middleware
                : [];

            // get namespace
            var namespace = this.$.namespace;

            // EMITTERS

            console.log(middleware);

            // GET
            // retrieve
            app.get({
                name : 'Resource - GET (retrieve) - ' + route + '/:' + this.$.id,
                path : route + '/:' + this.$.id
            }, middleware, function (req, res, next) {

                // retrieve
                app.emit(namespace, {
                    override : false,
                    name     : 'retrieve',
                    req      : req,
                    res      : res
                });

                // no further routing
                return next(false);

            });

            // GET
            // index
            app.get({
                name : 'Resource - GET (index) - ' + route,
                path : route
            }, middleware, function (req, res, next) {

                // index
                app.emit(namespace, {
                    override : false,
                    name     : 'index',
                    req      : req,
                    res      : res
                });

                // no further routing
                return next(false);

            });

            // POST
            // create/service
            app.post({
                name : 'Resource - POST (create/service) - ' + route,
                path : route
            }, middleware, function (req, res, next) {

                // extract query (based on whether or not service
                // param is set or not)
                var name = (typeof req.query.service === 'undefined')
                    ? 'create'
                    : req.query.service.toLowerCase();

                // index
                app.emit(namespace, {
                    override : false,
                    name     : name,
                    req      : req,
                    res      : res
                });

                // no further routing
                return next(false);

            });

            // PUT
            // update
            app.put({
                name : 'Resource - PUT (update) - ' + route + '/:' + this.$.id,
                path : route + '/:' + this.$.id
            }, middleware, function (req, res, next) {

                // update
                app.emit(namespace, {
                    override : false,
                    name     : 'update',
                    req      : req,
                    res      : res
                });

                // no further routing
                return next(false);

            });

            // DELETE
            // delete
            app.del({
                name : 'Resource - DELETE (delete) - ' + route + '/:' + this.$.id,
                path : route + '/:' + this.$.id
            }, middleware, function (req, res, next) {

                // delete
                app.emit(namespace, {
                    override : false,
                    name     : 'delete',
                    req      : req,
                    res      : res
                });

                // no further routing
                return next(false);

            });

            // OPTIONS
            // options (pre-flight)
            app.opts({
                name : 'Resource - OPTIONS (options) - ' + route + '/:' + this.$.id,
                path : route + '/:' + this.$.id
            }, middleware, function (req, res, next) {

                // options
                // answer preflight fast
                server.send(req, res, null, null, 202);

                // no further routing
                return next(false);

            });

            // OPTIONS
            // options (pre-fight)
            app.opts({
                name : 'Resource - OPTIONS (options) - ' + route,
                path : route
            }, middleware, function (req, res, next) {

                // options
                // answer preflight fast
                server.send(req, res, null, null, 202);

                // no further routing
                return next(false);

            });

            // make chainable
            return this;

        },

        /**
         * @method _setListeners
         * Set listener that delegates request to resource's
         * CRUD verb method.
         *
         * @return {*}
         */
        _setListeners : function () {

            var self = this;

            // get server instance
            var server = this.$.server;

            // get express app instance
            var app = this.$.app;

            // get namespace
            var namespace = this.$.namespace;

            // get queries
            var queries = this.$.queries;

            /**
             * @listen
             * Prepare options object, invokes query.
             * @params {required}{obj} options
             *    @key {optional}{bol} brute
             *    @key {required}{str} query
             *    @key {optional}{obj} req
             *    @key {optional}{obj} res
             * @params {optional}{fun} fn
             */
            app.on(namespace, function (options, fn) {

                var req = options.req || null;
                var res = options.res || null;

                // normalize
                // use incoming callback, or Server.REST .send()
                // method to return query results
                fn = fn || function (err, data, status, code) {

                    // no way to send back results
                    // request, response object missing
                    if (!req || !res) {
                        return util.noop();
                    }

                    // send results back to client
                    // using existing request, response object
                    server.send(req, res, err, data, status, code);

                };

                // [-] exit
                // no query name set
                if (typeof options.name === 'undefined') {
                    return fn(true, null, 400, 'ERROR_RESOURCE_QUERY_NOT_SET');
                }

                // normalize
                var name = options.name.toLowerCase();
                var override = options.override || false;

                // [-] exit
                if (typeof queries[name] === 'undefined') {
                    return fn(true, null, 404, 'ERROR_RESOURCE_QUERY_NOT_FOUND');
                }

                // create options object to be used in resource
                // query, brute (set to true/false controls whether
                // or not query will ask for access rights first)
                _.extend(options, {
                    name : name
                });

                // add query object, add request body iof available
                if (req) {

                    _.extend(options, {
                        id          : req.params[self.$.id] || null,
                        body        : req.body,
                        querystring : req.query
                    });

                    // [-] exit
                    // check client access
                    var client = self._checkClient(req.headers);
                    if (!override && !client) {
                        return fn(true, null, 401, 'ERROR_ACCESS_CLIENT_NOT_ALLOWED');
                    }

                    // [-] exit
                    // check method access
                    var method = self._checkMethod(req.method);
                    if (!override && !method) {
                        return fn(true, null, 401, 'ERROR_ACCESS_METHOD_NOT_ALLOWED');
                    }

                    // [-] exit
                    // check access rules
                    var rules = self._checkRules(name, client);
                    if (!override && !rules) {
                        return fn(true, null, 401, 'ERROR_ACCESS_DENIED_BY_RULE');
                    }

                }

                // invoke query
                queries[name].call(self, options, fn);

            });

            // make chainable
            return this;

        },

        /**
         * @method _setMongo()
         * If of type mongo fetch mongo schema, Model
         * form schema instance
         *
         * @return {*}
         */
        _setMongo : function () {

            // skip
            if (this.$.type !== 'mongo' || this.$.schema === null) {
                return this;
            }

            // extract app
            var server = this.$.server;

            // extract dir
            var dir = server.get('dir') + server.get('server');

            // save mongo assets
            this.$.mongo = require(dir + '/' + this.get('schema')).get('mongo');

            // make chainable
            return this;

        },

        /**
         * @method _setNamespace()
         * Sets event namespace for resource's CRUD
         * events.
         */
        _setNamespace : function () {

            // set based on context and route
            // ex: resource:/api/:users/:id?
            this.$.namespace = (this.$.name === null)
                ? 'resource:' + this.$.context + ':' + this.$.route
                : 'resource:' + this.$.name;

            // make chainable
            return this;

        },

        /**
         * @method _setQueries()
         * Adds default queries to resource's $.queries object.
         *
         * @return {*}
         */
        _setQueries : function () {

            // add default methods to collection
            // of resource methods
            _.extend(this.$.queries, {
                index    : this._queryIndex,
                create   : this._queryCreate,
                retrieve : this._queryRetrieve,
                update   : this._queryUpdate,
                delete   : this._queryDelete
            });

            // make chainable
            return this;

        },

        /**
         * @method _setReference()
         * Sets reference to this resource on the global
         * server object.
         *
         * @return {*}
         */
        _setReference : function () {

            // extract resources
            var resources = this.$.server.get('resources') || {};

            // extract namespace
            var namespace = this.$.namespace;

            // set reference
            resources[namespace] = this;

            // make chainable
            return this;

        },

        // PUBLIC

        /**
         * @method add(name, fn)
         * Adds query to resource instance, invoked in instance
         * context.
         *
         * @params {required}{str} name
         * @params {required}{fun} fn
         * @return {*}
         */
        add : function (name, fn) {

            var self = this;

            // normalize
            name = name.toLowerCase();
            fn = fn || util.noop;

            // set method
            this.$.queries[name] = fn;

            // make chainable
            return this;

        },

        /**
         * @method use(name, options, fn)
         * Finds query by name, invokes query using incoming params.
         *
         * @params {required}{str} name
         * @params {required}{obj} options
         * @params {optional}{fun} fn
         */
        use     : function (name, options, fn) {

            // normalize
            name = name.toLowerCase();

            // [-] exit
            if (typeof this.$.queries[name] === 'undefined') {
                return fn(true, null, 400, 'ERROR_RESOURCE_QUERY_NOT_FOUND');
            }

            // invoke query
            return this.$.queries[name].call(this, options, fn);

        },

        // TODO: DEPRECATED
        methods : function () {
            return this.add.apply(this, arguments);
        }

    });

});