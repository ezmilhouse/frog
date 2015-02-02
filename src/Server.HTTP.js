if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    'underscore',
    './app',
    './Base',
    'body-parser',
    'cluster',
    'compression',
    'connect-redis',
    'connect-slashes',
    'cookie-parser',
    'ejs-locals',
    'express',
    'express-less',
    'express-session',
    'method-override',
    'multer',
    'serve-favicon',
    './Flow',
    'moment',
    'os',
    './singleton',
    './util'
], function (_, app, Base, bodyParser, cluster, compression, RedisStore, slashes, cookieParser, engine, express, less, session, methodOverride, multer, favicon, Flow, moment, os, singleton, util) {

    return Base.extend({

        // PRIVATE

        /**
         * ctor, Server
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options, local) {

            this.$ = {
                app         : null,
                application : null,
                cluster     : true,
                config      : options || null,
                cpus        : 1,
                dir         : null,
                env         : 'development',
                favicon     : null,
                local       : true,
                name        : null,
                port        : null,
                public      : '/public',
                redis       : null,
                server      : null,
                sessions    : null,
                shell       : '/frog.shell',
                text        : {},
                version     : null,
                views       : '/server/html'
            };

            if (options) {
                _.extend(this.$, options);
            }

            // presets
            this._setShell();
            this._setLocal();
            this._setOptions(local);
            this._setEnvironment();
            this._setPackage();
            this._setPort();
            this._setCluster();
            this._setText();
            this._getCPUs();
            this._setRedis();

            // make chainable
            return this;

        },

        /**
         * @method _getCPUs()
         * Gets number of CPUs.
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
         * @returns {*}
         */
        _setCluster : function () {

            // set cluster
            this.$.cluster = (this.$.shell.u === 'true');

            // make chainable
            return this;

        },

        /**
         * @method _setEnvironemnt()
         * Sets environment, defaults to `development`.
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
         * Sets port to run server on. Shell option beats configuration,
         * falls back to 2000.
         * @return {*}
         */
        _setPort : function () {

            // set port
            this.$.port = this.$.shell.p || this.$.config.port || 2000;

            // make chainable
            return this;

        },

        /**
         * @method _setRedis()
         * Sets redis store instance to be used as
         * session storage.
         * @returns {*}
         */
        _setRedis : function () {

            // create redis store constructor
            RedisStore = RedisStore(session);

            // create redis store instance
            this.$.redis = new RedisStore({
                host: this.$.config.redis.host,
                port: this.$.config.redis.port
            });

            // add redis instance to session
            // as storage instance
            this.$.sessions.store = this.$.redis;

            // make chainable
            return this;

        },

        /**
         * @method _setShell()
         * Sets incoming shell options.
         * @return {*}
         */
        _setShell : function () {

            // require shell options
            this.$.shell = require(this.$.dir + this.$.shell);

            // make chainable
            return this;

        },

        /**
         * @method _setText()
         * Sets text, save it to singleton.
         */
        _setText : function () {

            // save to singleton
            singleton.text = require(this.$.dir + this.$.text);

            // make chainable
            return this;

        },

        /**
         * @method _setPackage()
         * Sets version and application name.
         * @return {*}
         */
        _setPackage : function () {

            // open package.json
            var package = require(this.$.dir + '/package.json');

            // save name
            this.$.name = package.name;

            // save version
            this.$.version = package.version;

            // make chainable
            return this;

        },

        /**
         * @method _log()
         * Stdouts server process information after new processes have
         * been started
         * @returns {*}
         */
        _log : function () {

            // stdout log message
            util.log.node.process(process, this.$.port);

            // make chainable
            return this;

        },

        /**
         * @method _run()
         * Starts express server instance by invoking .listen()
         * with given port.
         * @return {*}
         */
        _run : function () {

            // preserve scope
            var self = this;

            // run if we're in a worker process
            // start server
            this.$.app.listen(this.$.port, function () {
                self._log();
            });

            // make chainable
            return this;

        },

        /**
         * @mtehod _try()
         * If cluster option is set to true, tries to invoke
         * multiple server processes based on number of CPUs.
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
         * @method setup([options])
         * Creates new express instance stes configurations, ect.
         * Does not start the server, incoming option object will
         * extend this.$
         * @params {required}{obj} options
         * @return {*}
         */
        setup : function (options) {

            // normalize
            options = options || {};

            // extend
            _.extend(this.$, options);

            // init server
            var app = express();

            // save environment
            app.set('env', this.$.env);

            // save port
            app.set('port', this.$.port);

            // save root directory
            app.set('dir', this.$.dir);

            // save whether or not use local config file
            app.set('local', this.$.local);

            // save public folder
            app.set('public', this.$.dir + this.$.public);

            // save version
            app.set('version', this.$.version);

            // handle views, rendering
            app.engine('html', engine);

            // rendering engine
            app.set('view engine', 'html');

            // set view directory
            app.set('views', this.$.dir + this.$.views);

            // sets routing trailing slash rule
            app.set('strict routing', false);

            app.set('trust proxy', this.$.config.trustedProxy);

            // for parsing application/json
            app.use(bodyParser.json());

            // for parsing application/x-www-form-urlencoded
            app.use(bodyParser.urlencoded({ extended: true }));

            // for parsing multipart/form-data
            app.use(multer());

            // enables less compiling on the fly
            // should only be used in development
            // environment
            app.use('/less-css', less(this.$.dir + this.$.public + '/less', {
                compress : true,
                debug    : true
            }));

            // set expires headers
            app.use('*', function (req, res, next) {
                res.set('Cache-Control', 'public, max-age=345600'); // 4 days
                res.set('Expires', new Date(Date.now() + 345600000).toUTCString());
                next();
            });

            // handle cookies
            app.use(cookieParser());

            // handle sessions
            app.use(session(this.$.sessions));

            // handle session errors
            app.use(function (req, res, next) {

                // check if session has been lost
                if (!req.session) {
                    return util.log.redis.down();
                }

                // otherwise continue
                next();

            });

            // add gzip compression
            app.use(compression());

            // handle favicon
            app.use(favicon(this.$.dir + this.$.favicon));

            // handle static files
            app.use(express.static(this.$.dir + this.$.public));

            // force trailing slash
            // app.use(slashes());

            // save express app
            singleton.app = this.$.app = app;

            // save Server instance
            singleton.server = this;

            // make chainable
            return this;

        },

        /**
         * @method start()
         * Starts setup server and application.
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