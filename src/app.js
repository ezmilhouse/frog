if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    './singleton'
], function (singleton) {

    /**
     * @app
     * In server-side application this object holds
     * app object (express server), makes it there-
     * for accessable from everywhere
     */
    return function() {
        return singleton.app;
    };

});