var _ = require('underscore');
var define = require('amdefine')(module);
define('frog/config', require('frog').singleton.config);

define([
    'frog',
    'frog/config'
], function (frog, config) {

    var schema = new frog.Schema({
        collection : 'users',
        document   : {
            name : {type : String, index : true, default : 'Mr Frog'}
        },
        options    : {
            strict : false
        }
    });

    return schema;

});