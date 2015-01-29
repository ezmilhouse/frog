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
     * @key {optional}{str} context
     *      If set contet will be added to endpoint, ex: if
     *      context is set to /v1 and endpoint is  set to /api
     *      requests will run against /api/v1/[RESOURCE]
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
        context  : null,
        endpoint : (function () {

            // all browser
            var endpoint_all = '/api';

            // ie10 and below
            var endpoint_ie9 = '/api';

            // if you set the API endpoint to a absolute path
            // (outside) of your host, you might run into x-
            // domain problems in certain versions of IE. In
            // IE below 10 you run into x-domain problems,
            // therefore you MUST run against a proxy relative
            // to the same host (ex: /api)
            return (navigator.userAgent.indexOf("Trident/5") > -1)
                ? endpoint_ie9
                : endpoint_all;

        })(),
        headers  : {
            'Accept'       : 'application/json',
            'Content-Type' : 'application/json'
        },
        host     : 'api.domain.com',
        port     : 2000,
        protocol : 'https'
    },

    /**
     * @key {required}{str} application
     * Relative path from host's public root to client-side
     * entry point of your application. For starters leave
     * it the way it is.
     */
    application : 'js/index',

    /**
     * @obj {required}{str} component
     * Adds options for use of frog's component interface.
     *
     * @key {optional}{str} paths.base
     *      Root folder of all components (relative to
     *      require baseUrl defined below)
     * @key {optional}{str} paths.root
     *      Location of components' index files (relative to
     *      component's root).
     */
    components : {
        paths : {
            base : 'components',
            root : 'js/index'
        }
        // prefix : 'frog-'
    },

    /**
     * @obj {required}{str} facebook
     * Adds Facebook credentials to config object, allows to
     * use frog's Facebook implementation.
     *
     * @key {optional}{str} app
     *      Id of Facebook application.
     * @key {optional}{arr} permissions
     *      Array of Facebook access permissions, sometimes
     *      called scope (will end up as scope string) in
     *      Facebook SDK initialization.
     */
    facebook : {
        app         : '1234567890',
        permissions : [
            'email'
        ]
    },

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
     * @obj require
     * All client-side dependencies in frog.js are organized
     * via require.js, this object is a exact mapping of the
     * require.js options object, find docs here:
     * http://requirejs.org/docs/api.html
     *
     * @important
     * please keep in mind that options used here are also used
     * in the build process using require.js optimizer (r.js)
     *
     * @key {optional}{str} baseUrl
     *      Base url require.js uses to build paths through the
     *      whole application, strong recommendation to use '/'.
     * @key {optional}{str} urlArgs
     *      The require.js urlArgs help to cache burst your app's
     *      files. extract the cache-bustin token from the last
     *      <script> tag (should be require.js), this will now be
     *      added to every required file.
     * @key {optional}{str} paths
     *      Third party dependencies and internal shortcuts/
     *      rewrites, as well as shims for exporting.
     * @key {optional}{str} shim
     *      Handles the way third party libraries expose them-
     *      selves when pulled in via require.js.
     */
    require : {
        baseUrl : '/',
        urlArgs : $('script[data-main]').last().data('main').replace(/.*t=([0-9]+).*/, 't=$1'),
        paths   : {
            // thrid party
            async             : 'support/require/require.async.min',
            ejs               : 'support/ejs/ejs-0.8.5.min',
            json              : 'support/require/require-json-0.3.2.min',
            hashchange        : 'support/jquery/jquery-hashchange-1.3.0.min',
            modernizr         : 'support/modernizr/modernizr-2.8.3.custom.min',
            moment            : 'support/moment/moment-2.6.0.min',
            numeral           : 'support/numeral/numeral-1.4.5.min',
            ready             : 'support/require/require-domready-2.0.1.min',
            superagent        : 'support/superagent/superagent-1.14.1.min',
            text              : 'support/require/require-text-2.0.10.custom.min',
            underscore        : 'support/underscore/underscore-1.4.2.min',
            // rewrites, shortcuts
            'src'             : 'support/frog/src',
            'frog'            : (function () {

                // check for sdk version
                var version = $('script[data-version]').last().data('version');

                // check for sdk build
                var build = $('script[data-build]').last().data('build');

                // use unbuild by default
                var sdk = 'support/frog/frog';

                // set correct build
                if (version && version !== '') {
                    sdk = 'support/frog/builds/' + version + '/frog-' + version;
                    if (build && build !== '') {
                        sdk += '.min'
                    }
                }

                // set
                return sdk;

            })(),
            'html/views'      : '../html/views',
            'html'            : '../html',
            'frog/components' : 'components',
            'frog/support'    : 'support'
        },
        shim    : {
            ejs        : {
                exports : 'ejs'
            },
            modernizr  : {
                exports : 'Modernizr'
            },
            moment     : {
                exports : 'moment'
            },
            numeral    : {
                exports : 'numeral'
            },
            superagent : {
                exports : 'superagent'
            },
            underscore : {
                exports : '_'
            }
        },
        config  : {
            // allowing cross-domain XHR requests for text files
            // set policy in useXhr block if necessary
            text : {
                useXhr : function (url, protocol, hostname, port) {
                    return true; // allowing everything at the moment
                }
            }
        }
    },

    /**
     * @key {required}{str} text
     * Relative path from your application's public root to the place
     * the applications gets it's i18n text object from, important,
     * this file is used server-side as well as client-side, so
     * don't put anything secret in there, just dumb text.
     */
    text : 'js/misc/misc.text'

});