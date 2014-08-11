if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    './Base'
], function (Base) {

    return Base.extend({

        // --- @PRIVATE

        /**
         * ctor, Model
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            this.$ = {
                data : null
            };

            if (options) {
                _.extend(this.$, options);
            }

            return this;

        },

        data : function () {
            return this.get('data');
        }

    });

});