var define = require('amdefine')(module);

define({

    /**
     * @important
     * This files holds production settings of your application
     * only, if you need to overwrite settings here, create your
     * own config.local.js file in your application's root folder.
     */

    /**
     * @key {required}{str} application
     * Relative path from application's root to server-side
     * entry point of your application. For starters leave
     * it the way it is.
     */
    application : '/server/js/index',

    /**
     * @key {required}{str} dir
     * Absolute system path to applications root folder, it's
     * usually the folder this file is located in, therefore
     * you can stick with to node's __dirname.
     */
    dir : __dirname,

    /**
     * @key {required}{str} endpoint
     * Most of the time you don't want to run your api against
     * the relative root / of your domain, set the endpoint to
     * set a context url, namespace.
     */
    endpoint : '/api',

    /**
     * @obj headers
     * List of allowed headers requests to the API can come with.
     *
     * @key {required}{str} key
     *      Requests have to identify themselves as belonging to
     *      a registered client key. The `frog-key` header allows
     *      you to set the name of the header key to look for.
     *
     * @key {optional}{str} session
     *      If you plan to allow requests against resources that
     *      require a valid session (access token), set the name
     *      of the header key to expect here.
     *
     */
    headers : {
        key     : 'Client-Key',
        session : 'Access-Token'
    },

    /**
     * @key {optional}{str} key
     *      TODO: might be worth deprecating
     *      In your development environment you might want to
     *      access api resources by overwriting (non-)extisting
     *      client keys, in this case, you can set a master
     *      client key here.
     *      Please don't use this option in production szenarios,
     *      keep it strictly a development feature.
     */
    key : null,

    /**
     * @obj mongo
     * TODO: should be able to carry all available mongo options, plz
     * TODO: doublecheck
     * Holds all mongoDB related configurations. If `url` is set,
     * all other access rules are ignored. Helpful links:
     * http://blog.mongolab.com/2013/11/deep-dive-into-connection-pooling/
     * http://docs.mongodb.org/manual/reference/connection-string/
     *
     * @key {optional}{str} db
     *      Name of database to connect to (by default), will be
     *      created, if it does not exist.
     * @key {optional}{str} host
     *      Host to look for when connecting to the database.,
     *      Defaults to `localhost`, or `127.0.0.1`
     * @key {optional}{str} password
     *      Set password to be used to authorize connection.
     * @key {optional}{int} poolSize
     *      Connection pooling allows you to re-use database
     *      connections, important to increase performance.
     * @key {optional}{int} port
     *      The port the server can connect to the database on,
     *      mongo's default port is 27017, check with your database
     *      configuration, keep prots in sync
     * @key {optional}{url} url
     *      You can connect to a mongo database using its standard
     *      URI connection scheme, if `url` is ste here, all other
     *      options (regarding database connection) are going to be
     *      ignored, use to overwrite. Use comma separated list to
     *      connect to multiple hosts.
     *      ex: mongodb://user:1234@127.0.0.1:27017/default
     * @key {optional}{str} user
     *      Set username to be used to authorize connection.
     */
    mongo   : {
        db       : 'default',
        host     : '127.0.0.1',
        password : null,
        poolSize : 5,
        port     : 27017,
        url      : null,
        user     : null
    },

    /**
     * @key {required}{str} object
     * TODO: key name is far too generic, let'S find a
     * TODO: better name
     * An object is added to every restify `req` object, to
     * keep data persistant on the request level, defults too
     * `req._`, When renaming be careful that you don't over-
     * write native restify `req` object keys, it is a good
     * idea to start with a underscore _
     */
    object : '_',

    /**
     * @key {required}{int} port
     * The port the frog node application will run on, in
     * development you can access your app on localhost:port,
     * in production environments you might want to set the
     * upstream of your NGINX (or APACHE) to this port.
     *
     * ATTENTION
     * Most of the time you will start your application by
     * using frog's shell script ./forg.shell.sh or the frog-
     * cli. If send a port via shell script, the port in
     * configuration files will be overwritten.
     */
    port : 2100,

    /**
     * @key {required}{str} server
     * Relative path from your application's root to the place
     * you hold your server-side code.
     */
    server  : '/server',

    /**
     * @key {required}{str} shell
     * Relative path from your application's root to the place
     * the applications shell script (which is used to perform
     * certain application functions ex: start, stop, restart,
     * most of the tim ein deployment settings).
     */
    shell   : '/frog.shell'

});