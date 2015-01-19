if (typeof define === 'undefined') {
    var _ = require('underscore');
    var define = require('amdefine')(module);
    define('frog/api', require('frog').singleton.api);
    define('frog/config', require('frog').singleton.config);
}

define([
    'frog',
    'frog/api',
    'frog/config'
], function (frog, api, config) {

    /**
     * @object success
     * Global list of success messages.
     */
    var success = {

        // 200, ...

        200 : {
            code        : 200,
            description : 'request ok, retrieved entity, entity list',
            message     : 'OK'
        },

        201 : {
            code        : 201,
            description : 'request ok, entity created',
            message     : 'CREATED'
        },

        202 : {
            code        : 202,
            description : 'request ok, CORS, pre-flight',
            message     : 'ACCEPTED'
        },

        204 : {
            code        : 204,
            description : 'request ok,  updated/removed entity/ies',
            message     : 'NO_CONTENT'
        }

    };

    /**
     * @object errors
     * Global list of errors.
     */
    var errors = {

        // 400, ...

        400 : {
            code        : 400,
            description : 'request failed, unknown reason',
            message     : 'BAD_REQUEST'
        },

        401 : {
            code        : 401,
            description : 'request failed, not authorized, access denied',
            message     : 'NOT_AUTHORIZED'
        },

        403 : {
            code        : 403,
            description : 'request failed, forbidden, access denied',
            message     : 'FORBIDDEN'
        },

        404 : {
            code        : 404,
            description : 'request failed, not found, empty list',
            message     : 'NOT_FOUND'
        },

        409 : {
            code        : 409,
            description : 'request failed, validation failed',
            message     : 'CONFLICT'
        },

        // 400: OBJECT, VALIDATION

        400001 : {
            code        : 400001,
            description : 'request failed, request object (body, query, params) validation failed',
            message     : 'BAD_OBJECT'
        },

        // 400: MONGO (frog.js -> Service.js)

        400100 : {
            code        : 400100,
            description : 'mongo, query failed, mongo exception, document not created',
            message     : 'QUERY_FAILED'
        },

        400101 : {
            code        : 400101,
            description : 'mongo, query failed, mongo exception, no documents returned',
            message     : 'QUERY_FAILED'
        },

        400102 : {
            code        : 400102,
            description : 'mongo, query failed, id missing, no document retrieved',
            message     : 'QUERY_FAILED'
        },

        400103 : {
            code        : 400103,
            description : 'mongo, query failed, mongo exception, no document retrieved',
            message     : 'QUERY_FAILED'
        },

        400104 : {
            code        : 400104,
            description : 'mongo, query failed, body missing, no document created',
            message     : 'QUERY_FAILED'
        },

        /*
         400105 : {
         code        : 400105,
         description : 'mongo, query failed, body missing, no documents updated',
         message     : 'QUERY_FAILED'
         },
         */

        400106 : {
            code        : 400106,
            description : 'mongo, query failed, query missing (safe mode), no documents updated',
            message     : 'QUERY_FAILED'
        },

        400107 : {
            code        : 400107,
            description : 'mongo, query failed, mongo exception, no documents updated',
            message     : 'QUERY_FAILED'
        },

        400108 : {
            code        : 400108,
            description : 'mongo, query failed, id missing, no document updated',
            message     : 'QUERY_FAILED'
        },

        /*
         400109 : {
         code        : 400109,
         description : 'mongo, query failed, body missing, no document updated',
         message     : 'QUERY_FAILED'
         },
         */

        400110 : {
            code        : 400110,
            description : 'mongo, query failed, mongo exception, no document updated',
            message     : 'QUERY_FAILED'
        },

        400111 : {
            code        : 400111,
            description : 'mongo, query failed, query missing (safe mode), no documents removed',
            message     : 'QUERY_FAILED'
        },

        400112 : {
            code        : 400112,
            description : 'mongo, query failed, mongo exception, no documents deleted',
            message     : 'QUERY_FAILED'
        },

        400113 : {
            code        : 400113,
            description : 'mongo, query failed, mongo exception, no document deleted',
            message     : 'QUERY_FAILED'
        },


        // 404: GENERAL

        404001 : {
            code        : 404001,
            description : 'request failed, empty list (most likely from resource\'s index)',
            message     : 'NOT_FOUND'
        },

        // 400: MONGO (frog.js -> Service.js)

        404100 : {
            code        : 404100,
            description : 'mongo, query failed, empty list',
            message     : 'NOT_FOUND'
        },

        404101 : {
            code        : 404101,
            description : 'mongo, query failed, no document retrieved',
            message     : 'NOT_FOUND'
        },

        404102 : {
            code        : 404102,
            description : 'mongo, query failed, no documents updated',
            message     : 'NOT_FOUND'
        },

        404103 : {
            code        : 404103,
            description : 'mongo, query failed, no document updated',
            message     : 'NOT_FOUND'
        },

        404104 : {
            code        : 404104,
            description : 'mongo, query failed, no documents deleted',
            message     : 'NOT_FOUND'
        },

        404105 : {
            code        : 404105,
            description : 'mongo, query failed, no document deleted',
            message     : 'NOT_FOUND'
        },

        // 500

        500 : {
            code        : 500,
            description : 'request failed, unknown error',
            message     : 'UNKNOWN'
        }

    };

    /**
     * @object warnings
     * Global list of warnings.
     */
    var warnings = {};

    return {
        errors   : errors,
        success  : success,
        warnings : warnings
    };

});