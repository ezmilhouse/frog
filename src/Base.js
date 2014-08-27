if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var request = require('superagent');
    var _ = require('underscore');
}

define([
    './Inherit',
    './util',
    'underscore',
    './xhr'
], function (Inherit, util, _, request) {

    return Class.extend({

        // PRIVATE

        /**
         * ctor, Base
         * @params {optional}{obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            // reset global object
            this.$ = {};

            // add incoming options object to
            // global object
            if (options) {
                _.extend(this.$, options);
            }

            // make contructor chainable
            return this;

        },

        // PUBLIC

        /**
         * @method get([key])
         * Getter on this.$ object, supports dot notation.
         * Returns full this.$ if key is not set.
         * @params {optional}{str} key
         * @return {*}
         */
        get : function (key) {

            // normalize
            key = key || null;

            // if key is not set
            if (!key) {
                return this.$;
            }

            // if key, return specific value
            if (key) {

                // split incoming dotted key (ex. body.data.foo)
                // into array of key parts
                var arr = key.split('.');

                // deep copy this.$ object to avoid reference
                // collisions, while walking down the object
                // chain
                var obj = util.deepextend(true, {}, this.$);

                // loop through array of keys, check for
                // object keys, go deeper into the chain or
                // return undefined
                for (var i = 0; i < arr.length; i++) {
                    if (obj.hasOwnProperty(arr[i])) {
                        obj = obj[arr[i]];
                    } else {
                        // key not found, force undefined
                        return undefined;
                    }
                }

                // return value of last in chain (does not have
                // to be an object, could be anything)
                return obj;

            }

            // if no key, return all attributes
            if (!key) {
                return this.$;
            }

        },

        /**
         * @method set(mixed[,value])
         * Setter on this.$ object, supports dot notation.
         * Supports mixed/value pairs, objects or array of
         * objects as incoming data, calls itself recursively
         * in the object and array of object cases.
         * @params {required}{str} mixed
         * @params {optional}{obj} value
         * @return {this}
         */
        set : function (mixed, value) {

            // normalize
            mixed = mixed || null;
            value = value || null;

            // skip
            // if no key AND no value
            if (!mixed && !value) {
                return false;
            }

            // skip
            // if key is array, loop through array and call
            // .set() recursively
            if (_.isArray(mixed)) {
                for (var i = 0; i < mixed.length; i++) {
                    this.set(mixed[i]);
                }
                return this;
            }

            // skip
            // if key is object, loop through object and call
            // .set() recursively
            if (_.isObject(mixed)) {
                for (var i in mixed) {
                    this.set(i, mixed[i]);
                }
                return this;
            }

            // if key is string, set key values
            if (_.isString(mixed)) {

                // reset flag
                var isNew = false;

                // save original key string (used for later
                // event firing, to be implemented)
                var isKey = mixed;

                // reset current key;
                var str;

                // deep copy this.$ object to avoid reference
                // collisions, while walking down the object
                // chain
                var obj = this.$;

                // split incoming dotted key (ex. body.data.foo)
                // into array of key parts
                var arr = mixed.split('.');

                // loop through array of keys, check for
                // object keys, go deeper into the chain,
                // if at the end of the chain, set value
                for (var i = 0; i < arr.length; i++) {

                    // extract key
                    str = arr[i];

                    // if not at the end of chain, create empty
                    // object if not there yet, set isNew flag
                    // if the latter, if at the end of chain, set
                    // value
                    if (i < arr.length - 1) {

                        // new key, set flag
                        if (!obj[str]) {
                            isNew = true;
                        }

                        // set value empty object if not there yet
                        obj[str] = obj[str] || {};

                    } else {

                        // at end of chain set value
                        obj[str] = value;

                    }

                    // update this.$ object
                    obj = obj[str];

                }

                // make method chainable, return this
                return this;

            }

        },

        /**
         * @method noop(key[,value])
         * TODO: DEPRECATED
         * empty callback function, to be used as fake
         * callback when normalizing incoming method
         * params
         * @return {bol}
         */
        noop : function () {
            log('Warning: Base.noop() is deprecated, consider using frog.util.noop()');
            logTrace();
            return true;
        }

    });

});