if (typeof define !== 'function') {
    var _ = require('underscore');
    var define = require('amdefine')(module);
}

define([
    'frog'
], function (frog) {

    var text = {
        de : {
            headlineWelcome : 'o_O - frog.js',
            metaBrowseHappy : 'Du benutzt einen <strong>veralteten</strong> Browser. Bitte <a href="http://browsehappy.com/">aktualisiere deinen Browser</a>.',
            metaCopyRight   : '&copy; 2014',
            metaDescription : 'o_O - frog.js - Spring, kleiner Frosch! Spring!',
            metaTitle : 'o_O'
        },
        en : {
            headlineWelcome : 'o_O - frog.js',
            metaBrowseHappy : 'You are using an <strong>outdated</strong> browser. Please <a href="http://browsehappy.com/">upgrade your browser</a> to improve your experience.',
            metaCopyRight   : '&copy; 2014',
            metaDescription : 'o_O - frog.js - Jump, little frog! Jump!.',
            metaTitle : 'o_O'
        }
    };

    return text;

});