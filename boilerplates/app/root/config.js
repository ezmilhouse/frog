var define = require('amdefine')(module);

define({

    /**
     * @important
     * This files holds production settings of your application
     * only, if you need to overwrite settings here, create your
     * own config.local.js file in your application's root folder.
     */

    /**
     * @obj api
     * Holds all configuration options necessary to connect
     * frog application with API endpoint.
     *
     * @key {required}{str} endpoint
     *      The endpoint that is used to access API resources,
     *      in most case relative to host (in profuction) but
     *      can also be absolute path (also including port).
     *      @examples
     *      https://api.domain.com
     *      https://api.domain.com/api
     *      http://localhost:2000
     *      http://localhost:2000/api
     *      /api
     * @key {optional}{obj} headers
     *      Object holding default headers to be sent with
     *      request a frog client makes requests to the API,
     *      usually content type, accept headers, as well as
     *      app specific authentication headers.
     * @key {required}{str} host
     *      The hostname of your application, set it without
     *      protocol or uri (ex: api.example.com)
     * @key {optional}{int} port
     *      If necessary add port the API runs on, often not
     *      necessary in production environments but comes in
     *      handy while in development, set to `null` if not
     *      necessary.
     * @key {required}{str} protocol
     *      Either https or http, stongly recommended to use
     *      https connections only.
     */
    api : {
        endpoint : '/api',
        headers  : {
            'Accept'       : 'application/json',
            'Content-Type' : 'application/json'
        },
        host     : 'api.domain.com',
        port     : null,
        protocol : 'https'
    },

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
     * @key {required}{str} favicon
     * Relative path from project root to location of your
     * application's favicon, favicons don't mean the world,
     * but produce nasty 404 errors in your network panel if
     * not set.
     */
    favicon : '/public/favicon.ico',

    /**
     * @obj i18n
     * Holds all configuration options that are i18n related,
     * default locale settings. You can set all of those
     * settings dynamically throughout your applications (and
     * you should), settings here only define the defaults and
     * fallbacks.
     *
     * @key {required}{str} country
     *      The 2 digit iso code of the default country, must
     *      be uppercase.
     * @key {required}{str} language
     *      The 2 digit iso code of the default language, must
     *      be lowercase.
     * @key {required}{str} locale
     *      Country in language combined as iso locale.
     * @key {required}{str} region
     *      The 2 digit region code, nothing iso here, routes
     *      by default will be prefixed /[region]/[language],
     *      set to null if you don't need them. Must be
     *      lowercase if set.
     */
    i18n : {
        country  : 'DE',
        language : 'de',
        locale   : 'de_DE',
        region   : 'de'
    },

    /**
     * @key {required}{int} port
     * The port the frog node application will run on, in
     * development you can access your app on localhost:port,
     * in production environments you might want to set the
     * upstream of your NGINX (or APACHE) to this port.
     */
    port : 2510,

    /**
     * @key {required}{str} public
     * Relative path from your application's root to the place
     * you hold your client-side code.
     */
    public : '/public',

    /**
     * @key {required}{str} root
     * Your frog applications needs a DOM root element that will
     * be added right before the closing body tag, it will be
     * identified by it's class name later on, therefore set a
     * unique and valid CSS class name (NOT selector) here.
     */
    root : 'frog-root',

    /**
     * @obj sdk
     * Let's you control if you run against a build or unbuild
     * version of frog, you can set a certian build number if
     * you like and you can decide whether to run against the
     * minified or unminified version.
     *
     * @key {optional}{str} build
     *      If set other than `null` application runs with not
     *      minified version of a specific build, if set to
     *      `min` it uses the minified version. Only relevant
     *      if @key version is set to other than `null`.
     *
     * @key {optional}{str} version
     *      If set to other than `null`, application uses build
     *      of specific version (ex: 0.1.96) of the frog sdk. if
     *      set to `null` application runs with unbuild development
     *      version of frog.
     */
    sdk : {
        build   : null,
        version : null
    },

    /**
     * @obj sessions
     * 1:1 representation of the express-session module's options
     * object, frog applications use that module to handle all
     * sessions. Find more documentation here:
     * https://github.com/expressjs/session
     */
    sessions : {
        cookie            : {
            path     : '/',
            httpOnly : true,
            secure   : true,
            maxAge   : 8640000
        },
        name              : 'frog',
        resave            : true,
        rolling           : false,
        saveUninitialized : true,
        secret            : 'frogfrogfrogfrogfrogfrogfrog',
        unset             : 'destroy'
    },

    /**
     * @key {required}{str} server
     * Relative path from your application's root to the place
     * you hold your server-side code.
     */
    server : '/server',

    /**
     * @key {required}{str} shell
     * Relative path from your application's root to the place
     * the applications shell script (which is used to perform
     * certain application functions ex: start, stop, restart,
     * most of the tim ein deployment settings).
     */
    shell : '/frog.shell',

    /**
     * @key {required}{str} text
     * Relative path from your application's root to the place
     * the applications gets it's i18n text object from, important,
     * this file is used server-side as well as client-side, so
     * don't put anything secret in there, just dumb text.
     */
    text : '/server/js/misc/misc.text',

    /**
     * @key {required}{str} views
     * Relative path from your application's root to the place
     * the applications holds it's server-side views and layout
     * files.
     */
    views : '/server/html'

});