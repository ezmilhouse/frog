if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    define('frog/api', require('frog').singleton.api);
    define('frog/config', require('frog').singleton.config);
}

define([
    'frog',
    'frog/api',
    'frog/config'
], function (frog, api, config) {

    var schema = new frog.Schema({
        collection : 'clients',
        document   : {
            email  : { type : String, index : true },
            group  : { type : String, index : true, default : 100 },
            name   : { type : String },
            key    : { type : String, index : true },
            secret : { type : String, index : true }
        },
        options    : {
            strict : false
        }
    });

    return schema;

});