if (typeof define !== 'function') {
    var _ = require('underscore');
    var define = require('amdefine')(module);
}

define([
    './Base',
    './util'
], function (Base, util) {

    return Base.extend({

        // PRIVATE

        /**
         * ctor, I18n
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            this.$ = {
                country  : null,
                language : null,
                locale   : null,
                text     : {}
            };

            if (options) {
                _.extend(this.$, options);
            }

            // prepare
            this._setCountry();
            this._setLanguage();
            this._setRegion();
            this._setText();

            return this;

        },

        /**
         * @method _setCountry()
         * Creates shortcut for this.$.country token.
         * @return {str}
         */
        _setCountry : function() {

            // set shortcut
            this.country = this.$.country || null;

            // make chainable
            return this;

        },

        /**
         * @method _setLanguage()
         * Creates shortcut for this.$.language token.
         * @return {str}
         */
        _setLanguage : function() {

            // set shortcut
            this.language = this.$.language || null;

            // make chainable
            return this;

        },

        /**
         * @method _setRegion()
         * Creates shortcut for this.$.region token.
         * @return {str}
         */
        _setRegion : function() {

            // set shortcut
            this.region = this.$.region || null;

            // make chainable
            return this;

        },

        /**
         * @method _setText()
         * Creates subset of this.$.text based on set
         * language token
         * @return {obj}
         */
        _setText : function() {

            // return text based on set language
            this.text = this.$.text[this.$.language] || {};

            // make chainable
            return this;

        },

        // PUBLIC

        /**
         * @method change([options])
         * Update this.$ options, re-runs prep methods,
         * used to switch language, country, region
         * application wide.
         * @params {optional}{obj} options
         * @return {*}
         */
        change : function(options) {

            // update options
            if (options) {
                _.extend(this.$, options);
            }

            // re-run preps
            this._setCountry();
            this._setLanguage();
            this._setRegion();
            this._setText();

            // make chainable
            return this;

        },

        /**
         * @object text
         * Holds subset of this.$.text based on set
         * language.
         */
        text : {}

    });

});