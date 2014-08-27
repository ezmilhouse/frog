if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    'underscore',
    './Base',
    'moment',
    './singleton',
    './util'
], function (_, Base, moment, singleton, util) {

    return Base.extend({

        // PRIVATE

        /**
         * ctor, Resource
         * @params {obj} options
         * @return {obj}
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
                    methods : {
                        index      : {
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
                    'default' : {}
                },
                queries    : {
                    index    : {},
                    create   : {
                        _id : 'id0'
                    },
                    retrieve : {
                        _id : 'id0'
                    },
                    update   : {
                        _id : 'id0'
                    },
                    delete   : {
                        _id : 'id0'
                    }
                },
                route      : '',
                schema     : null,
                server     : null,
                services   : {},
                tmp        : {},
                type       : 'mongo',
                defaults   : {
                    limit   : 100,
                    offset  : 0,
                    page    : null,
                    payload : 'default',
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
            this._setMongo();
            this._setNamespace();
            this._setReference();
            this._setRoutes();

            return this;

        },

        /**
         * @method checkAccess(req)
         * Checks whether or not incoming http method is allowed
         * on this resource.
         * @params {obj} req
         * @return {*}
         */
        _checkAccess : function (req, fn) {

            // get headers
            var headers = this.$.server.get('headers');

            // get headers key name
            var headersKeyName = headers.key.toLowerCase();

            // [-] exit
            // check for aka-ClientKey, return 401 if not found
            if (typeof req.headers[headers.key.toLowerCase()] === 'undefined') {
                fn(true, null, 401, '00011');
                return false;
            }

            // get clients
            var clients = singleton.clients;

            // [-] exit
            // check for valid client key, return 401 if not found, save
            // client info on request object if found
            var client = _.find(clients, function (obj) {
                return (obj.key === req.headers[headersKeyName]);
            });

            // if no regular client was found, doublecheck
            // if incoming might be a preset one
            if (!client) {

                // no key, no dev fallback, no access
                fn(true, null, 401, '00014');
                return false;

            } else {

                // save client
                req[this.$.server.get('object')].client = client;

            }

            // extract http method, force upper case
            var method = req.method.toUpperCase();

            // [-] exit
            // check if incoming http method matches
            // one of the allowed methods, if not send
            // error
            if (this.$.access.http.indexOf(method) === -1) {
                fn(true, null, 401, '00016');
                return false;
            }

            // [+] exit
            return true;

        },

        /**
         * @method checkAccessRules(req)
         * Checks pre-defined access rules against request on this
         * resource (might be CRUD, add. queries or services).
         * @params {obj} req
         * @return {*}
         */
        _checkAccessRules : function (req, fn) {

            // get action
            var action = req[this.$.server.get('object')].action;

            // get rules
            var rules = this.$.access.methods[action];

            // get client
            var client = req[this.$.server.get('object')].client;

            // [1] check client group
            // check if incoming client group matches (or is lower (better))
            // pre-defined client group
            if (parseInt(client.group) > rules.allowedClientGroups) {
                fn(true, null, 401, '00017');
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
                    fn(true, null, 401, '00018');
                    return false;
                }
            }

            // [3]
            // check explicitly denied client keys (only if keys are
            // set at all)
            if (rules.deniedClientKeys.length > 0) {
                if (_.find(rules.deniedClientKeys, client.key)) {
                    fn(true, null, 401, '00019');
                    return false;
                }
            }

            // [+] exit
            return true;

        },

        /**
         * @method _setApp
         * Extracts restify application from server
         * instance.
         * @return {*}
         */
        _setApp : function () {

            // extract app from server instance
            this.$.app = this.$.server.get('app');

            // make chainable
            return this;

        },

        /**
         * @method _setLimit(req)
         * Extracts limit token, set limit integer.
         * @params {obj} req
         * @return {int}
         */
        _setLimit : function (req) {

            var limit;

            // check if req.query.limit is set,
            // fallback or normalize
            if (typeof req.query === 'undefined' || typeof req.query.limit === 'undefined') {

                // not set, fallback to default
                limit = this.$.defaults.limit;

            } else {

                // set, normalize
                limit = parseInt(req.query.limit);

            }

            return limit;

        },

        /**
         * @method _setMongo()
         * If of type mongo fetch mongo schema, Model
         * form schema instance
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
         * @method _setOffset(req)
         * Extracts offset token, set offset integer.
         * @params {obj} req
         * @return {int}
         */
        _setOffset : function (req) {

            var offset;

            // check if req.query.offset is set,
            // fallback or normalize
            if (typeof req.query === 'undefined' || typeof req.query.offset === 'undefined') {

                // not set, fallback to default
                offset = this.$.defaults.offset;

            } else {

                // set, normalize
                offset = parseInt(req.query.offset);

            }

            return offset;

        },

        /**
         * @method _setOffsetFromPage(req, limit, offset)
         * Extracts page token, set page integer, convert it into offste, return offset.
         * @params {required}{obj} req
         * @params {required}{int} limit
         * @params {required}{int} offset
         * @return {int}
         */
        _setOffsetFromPage : function (req, limit, offset) {

            var page;

            // check if req.query.page is set,
            // fallback or normalize
            if (typeof req.query === 'undefined' || typeof req.query.page === 'undefined') {

                // not set, fallback to null
                page = null;

            } else {

                // set, normalize
                page = parseInt(req.query.page);

            }

            // update offset if page is set
            if (page !== 0 && page !== null) {
                offset = (page - 1) * limit;
            }

            return offset;

        },

        /**
         * @method _setPayload(req)
         * Extracts payload token, set payload object.
         * @params {obj} req
         * @return {obj}
         */
        _setPayload : function (req) {

            var payload;

            // check if req.query.payload is set,
            // fallback or normalize
            if (typeof req.query === 'undefined' || typeof req.query.payload === 'undefined') {

                // not set, fallback to default
                payload = this.$.defaults.payload;

            }

            // set, normalize
            payload = this.$.payloads[payload];

            return payload;

        },

        /**
         * @method _setQuery(req)
         * Extracts values from req object, builds queries from blueprints.
         * @params {obj} req
         * @params {str} str
         * @return {obj}
         */
        _setQuery : function (req, str) {

            // reset query
            var query;

            // custom queries always come alongside
            // index uri, exitsing querystrin param
            // `query` is mandatory
            if (str === 'index' && typeof req.query !== 'undefined' && typeof req.query.query !== 'undefined') {

                // custom query
                query = util.deepcopy(this.$.queries[req.query.query]);

                // loop through query keys, replace all keys with values
                // from querystring (if querystring keys exist)
                for (var key in query) {
                    if (typeof req.query[key] !== 'undefined') {
                        query[key] = req.query[key];
                    }
                }

            } else {

                // regular query
                query = util.deepcopy(this.$.queries[str]);

                // loop through query keys, replace all keys starting with
                // `id` with values from req object
                for (var key in query) {
                    if (query[key].substr(0, 2) === 'id') {
                        query[key] = req.params[query[key]];
                    }
                }

            }

            return query;

        },

        /**
         * @method _setQueryFromBody(req)
         * Extracts values from req.body object, builds queries from blueprints.
         * @params {obj} req
         * @return {obj}
         */
        _setQueryFromBody : function (req, str) {

            // set query
            var query = util.deepcopy(this.$.queries[str]);

            // temporarily save req.body to utilize
            // get() with dot notation
            var res = new Base();
            res.$.tmp = util.deepcopy(req.body);

            // loop through all keys, replace
            // placeholders with data coming from
            // requets body
            for (var key in query) {
                query[key] = res.get('tmp.' + key);
            }

            return query;

        },

        /**
         * @method _setReference()
         * Sets reference to this resource on the global
         * server object.
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

        /**
         * @method _setRoutes
         * Sets resource routes based on set route and
         * endpoint settings.
         * @private
         */
        _setRoutes : function () {

            // preserve scope
            var self = this;

            var server = this.$.server;

            // extract app
            var app = this.$.app;

            // extract context
            var context = this.$.context;

            // extract route
            var route = (context !== '')
                ? context + this.$.route
                : this.$.route;

            // extract middleware, normalize
            var middleware = this.$.middleware;
            if (middleware.length === 0) {
                middleware.push(function (req, res, next) {
                    return next();
                });
            }

            // extract namespace
            var namespace = this.$.namespace;

            // LISTENER
            app.on(namespace, function (req, res, query, fn, override) {

                // normalize callback
                fn = fn || function (err, data, status, code, message) {
                    server.send(req, res, err, data, status, code, message);
                };

                // check if service or native CRUD
                var action = query.split(':');

                console.log(namespace, action);

                // invoke service action
                if (action.length > 1) {

                    // set action
                    if (req && !_.isEmpty(req)) {
                        // TODO: in case of internal event submission, req might be undefined
                        // TODO: or null, maybe change the way resource actions are called
                        // TODO: internally
                        req[self.$.server.get('object')].action = action[1];
                    }

                    // invoke action
                    return self.$.services[action[1]].call(self, req, fn, override);

                }

                // set action
                // TODO: in case of internal event submission, req might be undefined
                // TODO: or null, maybe change the way resource actions are called
                // TODO: internally
                if (req && !_.isEmpty(req)) {
                    req[self.$.server.get('object')].action = action[0];
                }

                // invoke native CRUD action
                self[action[0]](req, fn, override);

            });

            // EMITTERS

            // GET - retrieve
            app.get({
                name : 'Resource - GET (retrieve) - ' + route + '/:' + this.$.id,
                path : route + '/:' + this.$.id
            }, middleware, function (req, res, next) {

                // retrieve
                app.emit(namespace, req, res, 'retrieve');

                // no further routing
                return next(false);

            });


            // GET - index
            app.get({
                name : 'Resource - GET (index) - ' + route,
                path : route
            }, middleware, function (req, res, next) {

                // index
                app.emit(namespace, req, res, 'index');

                // no further routing
                return next(false);

            });

            // POST - service
            app.post({
                name : 'Resource - POST (service) - ' + route + '/(.*)',
                path : route + '/(.*)'
            }, middleware, function (req, res, next) {

                // extract service
                var service = req.query.service || null;

                // skip!
                // if no service
                if (!service) {
                    return server.send(req, res, true, null, 404, '00010');
                }

                console.log(service)

                // service
                app.emit(namespace, req, res, 'service:' + req.query.service.toLowerCase());

                // no further routing
                return next(false);

            });

            // POST - service
            /*
             app.post({
             name : 'Resource - POST (create/service) - ' + route + '/:' + this.$.id + '/(.*)',
             path : route + '/:' + this.$.id + '/(.*)'
             }, middleware, function (req, res, next) {

             // service
             app.emit(namespace, req, res, 'service:' + req.params[self.$.id] + ':' + req.url.split()[1]);

             // no further routing
             return next(false);

             });
             */

            // POST - create
            app.post({
                name : 'Resource - POST (create) - ' + route,
                path : route
            }, middleware, function (req, res, next) {

                // create
                app.emit(namespace, req, res, 'create');

                // no further routing
                return next(false);

            });

            // PUT - update
            app.put({
                name : 'Resource - PUT (update) - ' + route + '/:' + this.$.id,
                path : route + '/:' + this.$.id
            }, middleware, function (req, res, next) {

                // update
                app.emit(namespace, req, res, 'update');

                // no further routing
                return next(false);

            });

            // DELETE - delete
            app.del({
                name : 'Resource - DELETE (delete) - ' + route + '/:' + this.$.id,
                path : route + '/:' + this.$.id
            }, middleware, function (req, res, next) {

                // update
                app.emit(namespace, req, res, 'delete');

                // no further routing
                return next(false);

            });

            // OPTIONS - options
            app.opts({
                name : 'Resource - OPTIONS (options) - ' + route + '/:' + this.$.id,
                path : route + '/:' + this.$.id
            }, middleware, function (req, res, next) {

                // options
                // app.emit(namespace, req, res, 'options');
                server.send(req, res, null, null, 202);

                // no further routing
                return next(false);

            });

            // OPTIONS - options
            app.opts({
                name : 'Resource - OPTIONS (options) - ' + route,
                path : route
            }, middleware, function (req, res, next) {

                // options
                // app.emit(namespace, req, res, 'options');
                server.send(req, res, null, null, 202);

                // no further routing
                return next(false);

            });

        },

        // PUBLIC

        /**
         * @method index(req, fn[, override])
         * Fetches list, invokes callback, override flag
         * allows overriding access control (used by
         * internal calls).
         * @params {obj} req
         * @params {fun} fn
         * @params {bol} override
         */
        index : function (req, fn, override) {

            var self = this;

            // [+/-] exit
            // check access
            if (!override && !this._checkAccess(req, fn)) {
                return;
            }

            // [+/-] exit
            // check access rules
            if (!override && !this._checkAccessRules(req, fn)) {
                return;
            }

            // set limit
            // limit represents the maximum number of
            // documents retrieved from database, set
            // to a maximum number by default (check
            // resource configuration for default value)
            var limit = this._setLimit(req);

            // set offset
            // if incoming offset= querystring parameter
            // offset represents the starting point of
            // the database cursor which it uses to fetch
            // documents form database, (check resource
            // configuration for default value)
            var offset = this._setOffset(req);

            // set offset from page
            // if incoming page= querystring parameter
            // defines offset, we need to calculate
            // offset from incoming page number and
            // limit value, overwrites existing offset,
            // falls back to default offset, (check
            // resource configuration for default value)
            offset = this._setOffsetFromPage(req, limit, offset);

            // set sorting
            // sets default sorting object to mongo to know
            // in which order to return documents, (check
            // resource configuration for default value)
            var sort = this.$.defaults.sort;

            // set payload
            // sets specific payload to return based on
            // incoming querystring parameter payload=,
            // (check resource configuration for default
            // value)
            var payload = this._setPayload(req);

            // set query
            // queries are pre-defined in resource's config,
            // query is fetched by query name (default CRUD
            // verbs plus custom)
            var query = this._setQuery(req, 'index');

            // log
            req = util.log.time.resources(this.$.server, req, 'MONGO query');

            // query
            this.$.mongo.Model
                .find(query, payload, {
                    limit : limit,
                    skip  : offset,
                    sort  : sort
                })
                .exec(function (err, docs) {

                    // [-] exit
                    // if database error occured
                    if (err) {
                        return fn(true, null, 400, '00001');
                    }

                    // [-] exit
                    // if database did not return document(s)
                    if (!docs || !docs.length) {
                        return fn(true, null, 404, '00002');
                    }

                    // log
                    req = util.log.time.resources(self.$.server, req, 'MONGO done');

                    // [+] exit
                    return fn(null, docs, 200);

                });

        },

        /**
         * @method create(req, fn[, override])
         * Creates document, invokes callback, override
         * flag allows overriding access control (used by
         * internal calls).
         * @params {obj} req
         * @params {fun} fn
         * @params {bol} override
         */
        create : function (req, fn, override) {

            var self = this;

            // [+/-] exit
            // check access
            if (!override && !this._checkAccess(req, fn)) {
                return;
            }

            // [+/-] exit
            // check access rules
            if (!override && !this._checkAccessRules(req, fn)) {
                return;
            }

            // [-] exit
            // if incoming request has no body
            if (typeof req.body === 'undefined' || _.isEmpty(req.body)) {
                return fn(true, null, 400, '00003');
            }

            // set query
            // queries are pre-defined in resource's config,
            // query is fetched by query name (default CRUD
            // verbs plus custom)
            var query = this._setQueryFromBody(req, 'create');

            // log
            req = util.log.time.resources(this.$.server, req, 'MONGO query');

            // query
            this.$.mongo.Model
                .find(query, function (err, docs) {

                    // normalize
                    // so save/update are possible
                    docs = (!docs === true)
                        ? []
                        : docs;

                    // [-] exit
                    // if database error occured
                    if (err) {
                        return fn(true, null, 400, '00001');
                    }

                    // reset status
                    var status;

                    // create if not found yet, otherwise update
                    if (!docs.length) {

                        // set date
                        // add `modified` and `created` data
                        _.extend(req.body, {
                            _created : util.timestamp(),
                            _updated : util.timestamp()
                        });

                        // [+] create
                        // create new instance, update with data
                        // from request body object
                        docs[0] = new self.$.mongo.Model(req.body);

                        // set status
                        status = 201;

                    } else {

                        // set date
                        // add `modified`
                        _.extend(req.body, {
                            _updated : util.timestamp()
                        });

                        // [+] update
                        // extend document with incoming data from
                        // request body
                        _.extend(docs[0], req.body);

                        // set status
                        status = 204;

                    }

                    // save created/updated document to database
                    docs[0].save(function (err, doc) {

                        // log
                        req = util.log.time.resources(self.$.server, req, 'MONGO done');

                        // [-] exit
                        // if database error occured
                        if (err) {
                            return fn(true, null, 400, '00001');
                        }

                        // [+] exit
                        // created (201) or updated (204)
                        if (status === 201) {
                            return fn(null, doc, 201);
                        } else {
                            return fn(null, null, 204);
                        }

                    });

                });

        },

        /**
         * @method retrieve(req, fn[, override])
         * Finds single document, invokes callback, override
         * flag allows overriding access control (used by
         * internal calls).
         * @params {obj} req
         * @params {fun} fn
         * @params {bol} override
         */
        retrieve : function (req, fn, override) {

            var self = this;

            // [+/-] exit
            // check access
            if (!override && !this._checkAccess(req, fn)) {
                return;
            }

            // [+/-] exit
            // check access rules
            if (!override && !this._checkAccessRules(req, fn)) {
                return;
            }

            // set payload
            // sets specific payload to return based on
            // incoming querystring parameter payload=,
            // (check resource configuration for default
            // value)
            var payload = this._setPayload(req);

            // set query
            // queries are pre-defined in resource's config,
            // query is fetched by query name (default CRUD
            // verbs plus custom)
            var query = this._setQuery(req, 'retrieve');

            // log
            req = util.log.time.resources(this.$.server, req, 'MONGO query');

            // query
            this.$.mongo.Model
                .findOne(query, payload)
                .lean()
                .exec(function (err, doc) {

                    // [-] exit
                    // if database error occured
                    if (err) {
                        return fn(true, null, 400, '00001');
                    }

                    // [-] exit
                    // if database did not return document(s)
                    if (!doc) {
                        return fn(true, null, 404, '00002');
                    }

                    // log
                    req = util.log.time.resources(self.$.server, req, 'MONGO done');

                    // [+] exit
                    return fn(null, doc, 200);

                });

        },

        /**
         * @method update(req, fn[, override])
         * Updates document, invokes callback, override flag
         * allows overriding access control (used by internal
         * calls).
         * @params {obj} req
         * @params {fun} fn
         * @params {bol} override
         */
        update : function (req, fn, override) {

            var self = this;

            // [+/-] exit
            // check access
            if (!override && !this._checkAccess(req, fn)) {
                return;
            }

            // [+/-] exit
            // check access rules
            if (!override && !this._checkAccessRules(req, fn)) {
                return;
            }

            // [-] exit
            // if incoming request has no body
            if (typeof req.body === 'undefined' || _.isEmpty(req.body)) {
                return fn(true, null, 400, '00003');
            }

            // set query
            // queries are pre-defined in resource's config,
            // query is fetched by query name (default CRUD
            // verbs plus custom)
            var query = this._setQuery(req, 'update');

            // set date
            // add `modified` data
            _.extend(req.body, {
                _updated : util.timestamp()
            });

            // log
            req = util.log.time.resources(this.$.server, req, 'MONGO query');

            // query
            this.$.mongo.Model
                .find(query, function (err, docs) {

                    // [-] exit
                    // if database error occured
                    if (err) {
                        return fn(true, null, 400, '00001');
                    }

                    // [-] exit
                    // if database did not return document(s)
                    if (!docs || !docs.length) {
                        return fn(true, null, 404, '00002');
                    }

                    // extend document with incoming data from
                    // request body
                    _.extend(docs[0], req.body);

                    // save updated document to database
                    docs[0].save(function (err, doc) {

                        // [-] exit
                        // if database error occured
                        if (err) {
                            return fn(true, null, 400, '00001');
                        }

                        // log
                        req = util.log.time.resources(self.$.server, req, 'MONGO done');

                        // [+] exit
                        return fn(null, null, 204);

                    });

                });

        },

        /**
         * @method delete(req, fn[, override])
         * Deletes document, invokes callback, override flag
         * allows overriding access control (used by internal
         * calls).
         * @params {obj} req
         * @params {fun} fn
         * @params {bol} override
         */
        delete : function (req, fn, override) {

            var self = this;

            // [+/-] exit
            // check access
            if (!override && !this._checkAccess(req, fn)) {
                return;
            }

            // [+/-] exit
            // check access rules
            if (!override && !this._checkAccessRules(req, fn)) {
                return;
            }

            // set query
            // queries are pre-defined in resource's config,
            // query is fetched by query name (default CRUD
            // verbs plus custom)
            var query = this._setQuery(req, 'delete');

            // log
            req = util.log.time.resources(this.$.server, req, 'MONGO query');

            // query
            this.$.mongo.Model
                .find(query, function (err, docs) {

                    // [-] exit
                    // if database error occured
                    if (err) {
                        return fn(true, null, 400, '00001');
                    }

                    // [-] exit
                    // if database did not return document(s)
                    if (!docs || !docs.length) {
                        return fn(true, null, 404, '00002');
                    }

                    // save found document form database
                    docs[0].remove(function (err) {

                        // [-] exit
                        // if database error occured
                        if (err) {
                            return fn(true, null, 400, '00001');
                        }

                        // log
                        req = util.log.time.resources(self.$.server, req, 'MONGO done');

                        // [+] exit
                        return fn(null, null, 204);

                    });

                });

        },

        /**
         * @method methods(name, fn)
         * Adds method to instance, invoked in instance context.
         * @param {str} name
         * @param {fun} cb
         */
        methods : function (name, cb) {

            // normalize
            name = name.toLowerCase();

            var self = this;

            // set method
            this[name] = function (req, fn, override) {

                // [+/-] exit
                // check access
                if (!override && !self._checkAccess(req, fn)) {
                    return;
                }

                // [+/-] exit
                // check access rules
                if (!override && !self._checkAccessRules(req, fn)) {
                    return;
                }

                cb.apply(self, arguments);

            };

            return this;

        },

        /**
         * @method service(name, cb)
         * Adds service to instance, invoked in instance context.
         * @param {str} name
         * @param {fun} cb
         */
        service : function (name, cb) {

            // normalize
            name = name.toLowerCase();

            var self = this;

            // set services container
            this.$.services = this.$.services || {};

            // set default access rights, if not set yet
            if (!this.$.access.methods[name]) {
                this.$.access.methods[name] = {
                    allowedClientGroups : 100,
                    allowedClientKeys   : [],
                    deniedClientKeys    : []
                };
            }

            // set method
            this.$.services[name] = function (req, fn, override) {

                // [+/-] exit
                // check access
                if (!override && !self._checkAccess(req, fn)) {
                    return;
                }

                // [+/-] exit
                // check access rules
                if (!override && !self._checkAccessRules(req, fn)) {
                    return;
                }

                cb.apply(self, arguments);

            };

            return this;

        }

    });

});