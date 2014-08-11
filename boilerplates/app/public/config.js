define({

    // ########################################################################
    // ### DO NOT MAKE CHANGES BELOW THIS LINE ################################
    // ########################################################################

    // what you have in front of yu right now, are the
    // global configuration settings the bootstrapper
    // uses to load components and their dependencies.
    //
    // This is a production file therefore do not make
    // changes here. You can overwrite all settings by
    // adding a
    //
    //      config.local.js
    //
    // to the root of /components. As long as you copy
    // the structure of this file (or parts of the
    // structure) your local settings will overwrite
    // global ones.
    // Important! config.local.js files are listed in
    // .gitignore, so local settings will not make their
    // way into production.
    //
    // A local config file for ex might look like this:
    //
    // define({
    //     api : {
    //         endpoint : 'https://api.fanmiles.com/api'
    //     },
    //     require : {
    //         baseUrl : '../../'
    //     }
    // });

    // --- CONFIG: API

    // set api options here, options set here overwrite
    // global api options, handle differences between
    // environment (ex: development, production) via
    // repo branches
    api : {

        // authentication keys that allow API requests
        // to identify themselves, also handles cookie
        // lifespans for resources that require a logged
        // in user (ex: /me)
        auth     : {
            clientKey    : 'L99DyWApMsK2ahBg',
            cookie       : null,
            cookieExpire : 30,
            cookieName   : 'frog-session',
            session      : null
        },

        // endpoint that is used to make API urls
        // should be relative path to proxy in
        // production environment (ex: /api-fm),
        // for dev purposes you can also use absolute
        // paths to localhost or live api
        //
        // ex: in production
        // https://api.hostname.com
        //
        // ex: in development (live API)
        // https://api.fanmiles.com
        //
        // ex: in development (local API)
        // http://localhost:2200
        //
        // ex: in development (local API, relative, fm-api only)
        // /api

        // in IE below 10 you run into x-domain problems, therfore
        // you have to run against a /api proxy
        endpoint : (navigator.userAgent.indexOf("Trident/5") > -1) ?
            '/api' : '//' + window.location.hostname.replace(/^(www)/, 'api') + '/api'

    },

    // entry point of your appliaction usually the
    // index.js in your frog.server folder
    application : 'js/index',

    // --- CONFIG: SDK

    sdk        : {

        // sets whether or not you the minified build version
        // is included, relevant only for versioned or latest
        // builds, set to `null` if you need the not-minified
        // version
        build   : null,

        // sets sdk version to inbclude, possible values are
        // `null` (unbuild version for dev environments only),
        // 'latest' for latest build, or fixed version like
        // '0.1.40'
        version : null

    },

    // --- CONFIG: COMPONENTS

    // path defines that are used OUTSIDE requirejs to make
    // live simpler, mostly used while bootstrapping single
    // components
    components : {

        paths : {

            // root folder of all components (relative to
            // require baseUrl defined below)
            base : 'components',

            // location of components' index files relative
            // to component's root
            root : 'js/index'

        }

    },

    // --- CONFIG: REQUIRE JS

    // requirejs options used to handle dependencies in various
    // environments, most likely you want to overwrite baseUrl,
    // keep in mind that options listed here are also used for
    // the build process (with r.js optimizer)
    require    : {

        // base url for all dependencies required in define
        // blocks throughout you whole requirejs application
        baseUrl : '/',

        // extract the cache-bustin token from the last <script> tag (should be require.js),
        // this will now be added to every required file
        urlArgs : $('script[data-main]').last().data('main').replace(/.*t=([0-9]+).*/, 't=$1'),

        // third party dependencies and internal shortcuts/
        // rewrites, as will as shims for exporting
        paths   : {

            // DEPENDENCIES

            ejs        : 'support/ejs/ejs-0.8.5.min',
            json       : 'support/require/require-json-0.3.2.min',
            hashchange : 'support/jquery/jquery-hashchange-1.3.0.min',
            modernizr  : 'support/modernizr/modernizr-2.7.1.min',
            moment     : 'support/moment/moment-2.6.0.min',
            numeral    : 'support/numeral/numeral-1.4.5.min',
            ready      : 'support/require/require-domready-2.0.1.min',
            request    : 'support/superagent/superagent-1.14.1.min',
            text       : 'support/require/require-text-2.0.10.custom.min',
            underscore : 'support/underscore/underscore-1.4.2.min',
            async      : 'support/require/require.async.min',

            // INTERNALLY

            'frog'            : 'support/frog/frog',
            'html/views'     : '../html/views',
            'html'           : '../html',
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
            request    : {
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

    }

});