if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function () {

    /**
     * @method log()
     * Lightweight wrapper for console.log() to avoid all kinds
     * of FF problems if console.log() is somewhere left in prod
     * code.
     */
    window.log = function () {
        if (this.console && typeof this.console.log !== 'undefined') {
            console.log.apply(this.console, arguments);
        }
    };

    /**
     * @method trc()
     * Lightweight wrapper for console.logtrace() to avoid all kinds
     * of FF problems if console.log() is somewhere left in prod
     * code.
     */
    window.trc = window.logtrace = function () {
        if (this.console && typeof this.console.log !== 'undefined') {
            console.log.apply(this.console, arguments);
            console.log(Error().stack.replace('Error', '---').replace('at Error (native)', 'Stack'));
        }
    };

    /**
     * @method wrn()
     * Lightweight wrapper for console.lwarn() to avoid all kinds
     * of FF problems if console.log() is somewhere left in prod
     * code.
     */
    window.wrn = function() {
        if (this.console && typeof this.console.warn !== 'undefined') {
            console.warn.apply(this.console, arguments);
        }
    };

    return {
        log      : window.log,
        logtrace : window.logtrace,
        trc      : window.logtrace,
        warn     : window.warn,
        wrn      : window.wrn
    };

});