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
                app                   : null,
                application           : null,
                clients               : [],
                cluster               : true,
                config                : options || null,
                cpus                  : 1,
                debug                 : false,
                dir                   : null,
                env                   : 'development',
                gzip                  : true,
                jsonp                 : true,
                local                 : true,
                log                   : true,
                messages              : {
                    errors   : null,
                    success  : null,
                    warnings : null
                },
                mongo                 : {
                    db       : 'frog',
                    password : '',
                    poolSize : 5,
                    url      : null,
                    user     : ''
                },
                name                  : 'frog',
                object                : '_frog',
                paths                 : {
                    resources : 'js/resources',
                    schemas   : 'js/schemas'
                },
                pkg                   : null,
                port                  : null,
                resources             : {},
                server                : null,
                services              : 'js/services',
                shell                 : '/frog.shell',
                version               : '0.1.0',
                xdomain               : true,
                xdomainAllowedHeaders : [
                    'Accept',
                    'Content-Type',
                    'Origin',
                    'X-Requested-With'
                ],
                xdomainAllowedMethods : [
                    'HEAD',
                    'GET',
                    'POST',
                    'PUT',
                    'DELETE',
                    'OPTIONS'
                ]
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
        _setDebug : function () {

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
        send : function (req, res, err, data, status, code, debug) {

            // normalize
            status = status || 200;
            err = status >= 400;

            // normalize
            switch(arguments.length) {
                case 6 :
                    if (_.isNumber(code)) {
                        code = code || status;
                        debug = false;
                    } else {
                        debug = code || false;
                        code = status;
                    }
                    break;
                case 7 :
                    code = code || status;
                    debug = debug || this.$.debug || false;
                    break;
                default : // 5
                    code = status;
                    debug = false;
                    break;
            }

            // get messages
            var msg = this.$.messages || {};

            // set message in case of success
            if (status >= 200 && status < 300) {
                if (msg.success) {
                    if (msg.success[code]) {
                        msg = msg.success[code];
                    } else {
                        msg = msg[status];
                    }
                } else {
                    msg.message = 'OK';
                }
            }

            // set message in case of warnings
            if (status >= 300 && status < 400) {
                if (msg.warnings) {
                    if (msg.warnings[code]) {
                        msg = msg.warnings[code];
                    } else {
                        msg = msg[status];
                    }
                } else {
                    msg.message = 'WARNING';
                }
            }

            // set message case of errors
            if (status >= 400) {
                if (msg.errors) {
                    if (msg.errors[code]) {
                        msg = msg.errors[code];
                    } else {
                        msg = msg.errors[status];
                    }
                } else {
                    msg.message = 'FAILED';
                    msg.description = 'No description yet.'
                }
            }

            // description fallback
            if (typeof msg.description === 'undefined') {
                msg.description = '';
            }

            // set payload
            var payload = {
                code        : code,
                data        : data || null,
                debug       : debug,
                description : msg.description,
                error       : !!err,
                message     : msg.message,
                status      : status,
                success     : !err
            };

            // index case
            if (_.isArray(payload.data)) {
                _.extend(payload, {
                    count : data.length
                });
            }

            // update, delete case
            if (status === 204 && (data && typeof data._count !== 'undefined')) {
                _.extend(payload, {
                    count : data._count,
                    data  : null
                });
            }

            // always HTTP status 200
            res.send(200, payload);

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

                // fetch list of headers
                var headers = self.$.xdomainAllowedHeaders.join(',');

                // fetch list of methods
                var methods = self.$.xdomainAllowedMethods.join(',');

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
                res.header('Access-Control-Allow-Headers', headers);
                res.header('Access-Control-Allow-Methods', methods);
                res.header('Access-Control-Allow-Origin', '*');

                // set x-domain headers
                switch (req.method) {

                    case 'OPTIONS' :

                        // preflight, sets allowed http methods for
                        // follow-up request
                        res.header('Allow', methods);

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