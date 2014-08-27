if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function () {

    /**
     * @singleton
     * Holds cached instances of Component, API as well as
     * config object.
     */
    var singleton = {
        app        : null,
        api        : null,
        clients    : null,
        components : {},
        config     : null,
        resources  : null,
        server     : null,
        text       : {}
    };

    return singleton;

});