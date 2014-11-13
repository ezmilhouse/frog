if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    'underscore',
    './Base',
    'cluster',
    'mongoose',
    'os',
    'restify',
    './singleton',
    './util'
], function (_, Base, cluster, mongoose, os, restify, singleton, util) {

    return Base.extend({

        /**
         * @method _ctor([obj])
         * Constructor of Handler.Object class.
         *
         * @params {optional}{obj} options
         * @return {*}
         */
        _ctor : function (options, local) {

            this.$ = {
                app         : null,
                application : null,
                clients     : [],
                cluster     : true,
                config      : options || null,
                cpus        : 1,
                debug       : false,
                dir         : null,
                env         : 'development',
                gzip        : true,
                headers     : {},
                jsonp       : true,
                local       : true,
                log         : true,
                mongo       : {
                    db       : 'frog',
                    password : '',
                    poolSize : 5,
                    url      : null,
                    user     : ''
                },
                name        : 'frog',
                object      : '_frog',
                paths       : {
                    resources : 'js/resources',
                    schemas   : 'js/schemas'
                },
                pkg         : null,
                port        : null,
                resources   : {},
                server      : null,
                services    : 'js/services',
                shell       : '/frog.shell',
                version     : '0.1.0',
                xdomain     : true
            };

            if (options) {
                _.extend(this.$, options);
            }

            // presets
            this._setShell();
            this._setLocal();
            this._setOptions(local);
            this._setVersion();
            this._setDebug();
            this._setEnvironment();
            this._setPort();
            this._setCluster();
            this._getCPUs();

            // make chainable
            return this;

        },

        // PRIVATE

        /**
         * @method _getCPUs()
         * Gets number of CPUs.
         *
         * @return {*}
         */
        _getCPUs : function () {

            // run if we're in the master process
            // count the machine's CPUs
            this.$.cpus = os.cpus().length;

            // make chainable
            return this;

        },

        /**
         * @method _setCluster()
         * Enable/Disable node processes to be clustered,
         * based on number of CPUs available.
         *
         * @returns {*}
         */
        _setCluster : function () {

            // set cluster
            this.$.cluster = (this.$.shell.u === 'true');

            // make chainable
            return this;

        },

        /**
         * @method _setDebug()
         * Enables/disables debug mode, if set REST server
         * will open up port 5858 for debugging purposes.
         * @returns {*}
         * @private
         */
        _setDebug : function() {

            // set debug from incoming shell option
            this.$.debug = (this.$.shell.d === true);

            // make chainable
            return this;

        },

        /**
         * @method _setEnvironemnt()
         * Sets environment, defaults to `development`.
         *
         * @return {*}
         */
        _setEnvironment : function () {

            // set environment
            this.$.env = this.$.shell.e || 'development';

            // make chainable
            return this;

        },

        /**
         * @method _setLocal()
         * Sets local flag, is `true` config object is extended
         * by config.local object.
         *
         * @return {*}
         */
        _setLocal : function () {

            // set local or not
            this.$.local = this.$.shell.l;

            // make chainable
            return this;

        },

        /**
         * @method _setOptions(local)
         * Extends production options with local ones in case
         * $.local is set.
         *
         * @params {required}{obj} local
         * @return {*}
         */
        _setOptions : function (local) {

            // skip
            // if local is not set (by incoming shell option)
            if (!this.$.local) {
                return this;
            }

            // extend options
            _.extend(this.$, local);

            // save config for every other
            // part of the application to
            // be used
            singleton.config = this.$;

            // make chainable
            return this;

        },

        /**
         * @method _setPort()
         * Sets port to run server on. Shell option beats
         * configuration, falls back to 2000.
         *
         * @return {*}
         */
        _setPort : function () {

            // set port
            this.$.port = this.$.shell.p || this.$.config.port || 2000;

            // make chainable
            return this;

        },

        /**
         * @method _setShell()
         * Sets incoming shell options.
         *
         * @return {*}
         */
        _setShell : function () {

            // require shell options
            this.$.shell = require(this.$.dir + this.$.shell);

            // make chainable
            return this;

        },

        /**
         * @method _steVersion()
         * Extracts application version from package.json.
         *
         * @return {*}
         */
        _setVersion : function () {

            // set version (coming in from
            // package.json)
            this.$.version = this.$.pkg ? this.$.pkg.version : '0.1.0';

            // make chainable
            return this;

        },

        /**
         * @method akaClientList(req, res, next)
         * Fetches clients list from database, caches list, (skipped
         * if already cached).
         *
         * TODO: I don't like this approach at all, why can clients
         * TODO: not be live? Why do we need this caching of clients
         * TODO: as global varibale?
         *
         * @params {required}{obj} req
         * @params {required}{obj} res
         * @params {required}{fun} next
         */
        _middlewareClients : function (req, res, next) {

            var self = this;

            // skip
            // if clients already loaded
            if (singleton.clients !== null) {
                return next();
            }

            // skip
            // if server instance comes with
            // list of clients
            if (self.$.clients.length > 0) {
                singleton.clients = self.$.clients;
                return next();
            }

            // fetch clients
            /*
            self.$.resources['resource:clients'].get('queries.index').call(self.$.resources['resource:clients'], {}, function (err, data, status, code) {

                // [-] exit
                if (err) {
                    self.send(req, res, true, null, 400, '00020');
                    return next(false);
                }

                // [-] exit
                if (!data || _.isEmpty(data)) {
                    self.send(req, res, true, null, 400, '00020');
                    return next(false);
                }

                // save clients list in cache
                singleton.clients = data;

                // [+] exit
                next();

            }, true);
            */

            next();

        },

        /**
         * @method _middlewareCookie(req, res, next)
         * Check if incoming request comes with cookie header, if so
         * extracts cookie (and session id) and saves them on the req
         * object. If cookie is not set, (maybe) existing cookie/session
         * on req object is reset.
         *
         * @params {required}{obj} req
         * @params {required}{obj} res
         * @params {required}{fun} next
         */
        _middlewareCookie : function (req, res, next) {

            var self = this;

            // reset session
            var session;

            // reset cookie
            var cookie;

            // get cookie name
            var cookieName = self.$.headers.session;

            // if incoming aka header contains session,
            // use sent in session, if not try to extract
            // session from existing cookie
            if (typeof req.headers[cookieName.toLowerCase()] !== 'undefined') {

                // set session based on incoming session header
                session = req.headers[cookieName.toLowerCase()];

            } else {

                // cookies
                cookie = util.parseCookie(req.headers);

                // check for ISAAC cookie key
                if (typeof cookie[cookieName] !== 'undefined') {

                    // save session, if cookie was found
                    session = cookie[cookieName];

                } else {

                    // reset if not found
                    session = null;

                }

            }

            if (session) {

                // save cookie information
                _.extend(req[self.$.object], {
                    cookie  : cookieName + '=' + session,
                    session : session
                });

            } else {

                // reset cookie information
                _.extend(req[self.$.object], {
                    cookie  : null,
                    session : null
                });

            }

            // exit
            next();

        },

        /**
         * @method _middlewareRequestObject(req, res, next)
         * Creates/resets _ object on incoming request object.
         *
         * @params {required}{obj} req
         * @params {required}{obj} res
         * @params {required}{obj} next
         */
        _middlewareRequestObject : function (req, res, next) {

            var self = this;

            // create _ request object
            req[self.$.object] = {
                action  : null,
                client  : null,
                cookie  : null,
                session : null,
                time    : []
            };

            // log
            req = util.log.time.resources(this, req, 'HTTP in');

            // exit
            next();

        },

        /**
         * @method _middlewareValidSession(ctx, req, res, next)
         * Restricts access to resource by checking for valid aka
         * session, exits with 401 if not set. If (re)set, session
         * was set by _middlewareCookie() middleware.
         *
         * TODO: Why are we using the context (scope) in that
         * TODO: weird way (as a parameter)?
         *
         * @params {required}{obj} ctx
         * @params {required}{obj} req
         * @params {required}{obj} res
         * @params {required}{fun} next
         */
        _middlewareValidSession : function (ctx, req, res, next) {

            // [-] exit
            // check for valid session
            // exit if not found
            if (!req[ctx.$.object].session) {
                ctx.send(req, res, true, null, 401, '00021');
                return next(false);
            }

            // [+] exit
            next();

        },

        /**
         * @method _log()
         * Stdouts server process information after new processes have
         * been started
         *
         * @returns {*}
         */
        _log : function () {

            // stdout log message
            util.log.node.process(process, this.$.port, this.$.debug);

            // make chainable
            return this;

        },

        /**
         * @method _run([fn])
         * Starts restify server instance by invoking .listen()
         * with given port.
         * @params {optional}{fun} fn
         * @return {*}
         */
        _run : function (fn) {

            // normalize
            fn = fn || util.noop;

            // preserve scope
            var self = this;

            // try mongo uri first
            var uri = this.$.mongo.url;

            // if not available, build it
            // from mongo options
            // ex: mongodb://user:1234@127.0.0.1:27017/default
            if (!uri) {

                // protocoll
                uri = 'mongodb://';

                // credentials (if available)
                if (this.$.mongo.username && this.$.mongo.password) {
                    uri += this.$.mongo.username;
                    uri += ':';
                    uri += this.$.mongo.password;
                    uri += '@';
                }

                // host
                uri += this.$.mongo.host;

                // port
                uri += ':';
                uri += this.$.mongo.port;

                // database
                uri += '/';
                uri += this.$.mongo.db;

            }

            // connect to mongo db
            mongoose.connect(uri, {
                server : {
                    poolSize : this.$.mongo.poolSize
                }
            }, function (err) {

                if (err) {
                    console.log('[frog] Unable to connect to database, no service on port ' + self.$.mongo.host + ':' + self.$.mongo.port);
                    return fn(true, err, 400);
                }

                // start server
                self.$.app.listen(self.$.port, function () {
                    self._log()
                });

            });

            // make chainable
            return this;

        },

        /**
         * @mtehod _try()
         * If cluster option is set to true, tries to invoke
         * multiple server processes based on number of CPUs.
         *
         * @return {*}
         */
        _try : function () {

            // listen for dying workers
            cluster.on('exit', function (worker) {

                // replace the dead worker,
                // we're not sentimental
                cluster.fork();

            });

            if (cluster.isMaster) {

                // get number of CPUs
                var c = this.$.cpus;

                // create a worker for each CPU
                for (var i = 0; i < c; i += 1) {

                    // start worker
                    cluster.fork();

                }

            } else {

                // start next process
                this._run();

            }

            // make chainable
            return this;

        },

        // PUBLIC

        /**
         * @method send(req, res, err, data[,status][,code])
         * Builds response payload, sends response object in success
         * and error cases back to client.

         * @params {required}{obj} req
         * @params {required}{obj} res
         * @params {required}{bol} err
         * @params {required}{obj|arr|str} data
         * @params {optional}{int} status
         * @params {optional}{str} code
         */
        send : function (req, res, err, data, status, code) {

            // normalize
            status = status || 200;
            code = code || util.codes[status] || 200;

            // log
            req = util.log.time.resources(this, req, 'HTTP out');

            // reset payload
            var payload;

            if (err) {

                // build payload
                payload = {
                    code    : code,
                    debug   : this.$.debug,
                    data    : data || null, // JSON.parse(JSON.stringify(data), true) || null,
                    error   : true,
                    status  : status,
                    success : false
                };

                // add time breaks
                if (this.$.debug) {
                    _.extend(payload, {
                        time : util.calc.timeDiff(req[this.$.object].time)
                    });
                }

                // error
                // always HTTP status 200
                res.send(200, payload);

                // log
                util.log.node.req.error(req, status);

            } else {

                // build payload
                payload = {
                    code    : code,
                    data    : data || null, // JSON.parse(JSON.stringify(data), true) || null,
                    debug   : this.$.debug,
                    error   : false,
                    status  : status,
                    success : true
                };

                // add time breaks
                if (this.$.debug) {
                    _.extend(payload, {
                        time : util.calc.timeDiff(req[this.$.object].time)
                    });
                }

                // index case
                if (_.isArray(data)) {
                    _.extend(payload, {
                        count : data.length
                        // TODO:
                        // page
                        // offset
                        // limit
                    });
                }

                // success
                // always HTTP status 200
                res.send(200, payload);

                // log
                util.log.node.req.success(req, status);

            }

        },

        /**
         * @method setup([options])
         * Creates new restify instance sets configurations, ect.
         * Does not start the server, incoming option object will
         * extend this.$
         *
         * @params {required}{obj} options
         * @return {*}
         */
        setup : function (options) {

            // normalize
            options = options || {};

            // extend
            _.extend(this.$, options);

            // preserve scope
            var self = this;

            // Creates named server instance, sets options accordingly.
            var app = restify.createServer({
                // certificate    : '',
                // key            : '',
                // formatters     : {},
                // log            : {},
                // spdy           : {},
                // handleUpgrades : false,
                name    : this.$.name,
                version : this.$.version
            });

            // SERVER: PREWARE
            // Allows you to add in handlers that run before routing occurs.
            app.pre(function (req, res, next) {

                // REQUEST

                var headers = self.$.headers;

                // force client to only accept json
                req.header('Accept', 'application/json');

                // RESPONSE

                // force application to respond with JSON (utf8)
                res.header('Content-Type', 'application/json; charset=utf-8');

                //
                if (!self.$.xdomain) {
                    return next();
                }

                // allow x-domain access
                res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, ' + headers.key + ', ' + headers.session);
                res.header('Access-Control-Allow-Methods', 'HEAD, GET, POST, PUT, DELETE, OPTIONS');
                res.header('Access-Control-Allow-Origin', '*');

                // set x-domain headers
                switch (req.method) {

                    case 'OPTIONS' :

                        // preflight, sets allowed http methods for
                        // follow-up request
                        res.header('Allow', 'HEAD', 'GET, POST, PUT, DELETE');

                        break;

                    default :
                        break;

                }

                // exit
                next();

            });

            // SERVER: MIDDLEWARE
            // Allows you to add in handlers that run no matter what the
            // route.

            // Parses out the Accept header, and ensures that the server
            // can respond to what the client asked for.
            app.use(restify.acceptParser(app.acceptable));

            // Parses out the Authorization header as best restify can.
            // Sets req.authorization, req.username
            app.use(restify.authorizationParser());

            // Parses out the HTTP Date header (if present) and checks for
            // clock skew (default allowed clock skew is 300s, like Kerberos).
            // You can pass in a number, which is interpreted in seconds,
            // to allow for clock skew.
            app.use(restify.dateParser(60));

            // Parses the HTTP query string (i.e., /foo?id=bar&name=mark).
            // If you use this, the parsed content will always be available
            // in req.query, additionally params are merged into req.params.
            app.use(restify.queryParser({
                mapParams : false
            }));

            // Supports checking the query string for callback or jsonp and
            // ensuring that the content-type is appropriately set if JSONP
            // params are in place. There is also a default application/javascript
            // formatter to handle this.
            if (this.$.jsonp) {
                app.use(restify.jsonp());
            }

            // Blocks your chain on reading and parsing the HTTP request body.
            // Switches on Content-Type and does the appropriate logic.
            app.use(restify.bodyParser({
                mapParams      : false,
                overrideParams : false
            }));

            // If the client sends an accept-encoding: gzip header (or one
            // with an appropriate q-val), then the server will automatically
            // gzip all response data.
            if (this.$.gzip) {
                app.use(restify.gzipResponse());
            }

            // Sets up a child bunyan logger with the current request id filled
            // in, along with any other parameters you define.
            if (this.$.log) {
                app.use(restify.requestLogger());
            }

            // SERVER: MIDDLEWARE: CUSTOM
            // Custom middleware handling specific requirements for incoming
            // requests.

            // resets request object on request
            app.use(function (req, res, next) {
                self._middlewareRequestObject.call(self, req, res, next);
            });

            // checks whether or not cookie is set
            // saves session/cookie on request object if
            // available, otherwise resets session/cookie
            app.use(function (req, res, next) {
                self._middlewareCookie.call(self, req, res, next);
            });

            // fetches client list from db, saves in cache
            app.use(function (req, res, next) {
                self._middlewareClients.call(self, req, res, next);
            });

            // SERVER: EVENTS
            // Handle all kinds of errors, including uncaught exceptions.
            app.on('uncaughtException', util.log.node.uncaughtException);

            // save restify app
            singleton.app = this.$.app = app;

            // save Server.REST instance
            singleton.server = this;

            // make chainable
            return this;

        },

        /**
         * @method start(options)
         * Starts setup server and application.
         *
         * @params {optional}{obj} options
         * @return {*}
         */
        start : function (options) {

            // setup application
            this.setup(options);

            // setup application
            require(this.$.dir + this.$.application);

            // create multiple node processes
            // in cluster mode
            if (this.$.cluster === true) {
                return this._try();
            }

            // create single node process
            this._run();

            // make chainable
            return this;

        }

    });

});