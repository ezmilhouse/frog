if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    './Base'
], function (Base) {

    return Base.extend({

        // --- @PRIVATE

        /**
         * ctor, Collection
         * @params {obj} options
         * @return {obj}
         */
        _ctor  : function (options) {

            this.$ = {
                data      : [],
                dataScope : [],
                scope     : null,
                scopes    : {}
            };

            if (options) {
                _.extend(this.$, options);
            }

            return this;

        },

        /**
         * @method scope([filter])
         * Returns filtered data or plain data (if filter
         * is not set) or empty array if filter could not
         * be found.
         * @params {str} filter
         * @return {arr}
         */
        scope : function(filter) {

            // normalize
            filter = filter || this.get('scope') || null;

            var data = this.get('data');

            // skip
            // if no filter, return plain data
            if (!filter) {
                return data;
            }

            // extract filter method
            var fn = this.get('scopes.' + filter);

            // skip
            // if unknown filter, return empty dataset
            if (typeof fn === 'undefined') {
                return [];
            }

            // filter data
            var dataScope = fn(data);

            // save scope data
            this.set('dataScope', dataScope);

            // return filtered data
            return dataScope;

        },

        /**
         * @method data([arr])
         * Getter/Setter for collection data
         * @params [arr] arr
         * @return {*}
         */
        data  : function (arr) {

            // normalize
            arr = arr || null;

            // get
            // return data if nothing comes in
            if (!arr) {
                return this.get('data');
            }

            // set
            // set data from incoming arr
            return this.set('data', arr);

        },

        /**
         * @method filter(name, fn)
         * Used to Add filter methods to collection instance, filter
         * methods are then being used by scope method to return
         * specific subsets of this.$.data
         * @params {str} name
         * @params {fun} fn
         * @returns {*}
         */
        filter : function (name, fn) {

            // get current scopes
            var scopes = this.get('scopes');

            // save new scope method
            scopes[name] = fn;

            // save updated scopes
            this.set('scopes', scopes);

            // exit
            return this;

        }

    });

});