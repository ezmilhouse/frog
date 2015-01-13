if (typeof define !== 'function') {
    var _ = require('underscore');
    var define = require('amdefine')(module);
}

define([
    './Base',
    './util'
], function (Base, util) {

    return Base.extend({

        /**
         * @method _ctor([obj])
         * Constructor of Middleware class.
         *
         * @params {optional}{obj} options
         * @return {*}
         */
        _ctor : function (options) {

            this.$ = {
                fn : null
            };

            if (options) {
                _.extend(this.$, options);
            }

            return this;

        }

    });

});