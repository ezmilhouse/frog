if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function () {

    // lightweight wrapper for console.log() to avoid all kinds
    // of FF problems if console.log() is somewhere left in prd
    // code
    window.log = function () {

        if (this.console) {
            console.log('>>>');
            console.log.apply(this.console, arguments);
            console.log('<<<');
        }

    };

    window.logtrace = function () {

        if (this.console) {
            console.log('>>>');
            console.log.apply(this.console, arguments);
            console.log(Error().stack.replace('Error', '---').replace('at Error (native)', 'Stack'));
            console.log('<<<');
        }

    };

    return {
        log      : window.log,
        logtrace : window.logtrace
    };

});