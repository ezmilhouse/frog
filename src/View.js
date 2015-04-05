if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    './Base',
    './date',
    './Flow',
    './util',
    'ejs'
], function (Base, date, flow, util, ejs) {

    return Base.extend({

        // PRIVATE

        /**
         * ctor, View
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            this.$ = {
                compiled : null,
                data     : {
                    date : date,
                    util : util
                },
                i18n     : null,
                markup   : null,
                mode     : 'html',
                file     : null,
                rendered : null,
                selector : 'body'
            };

            if (options) {
                _.extend(this.$, options);
            }

            return this;

        },

        // ---

        /**
         * @method _compile()
         * compiles template from markup
         * @return {*}
         */
        _compile : function () {

            // compile incoming string
            this.$.compiled = ejs.compile(this.$.markup);

            return this;

        },

        /**
         * @method _load([fn])
         * loads template remotely, tries DOM first, invokes
         * callback when done
         * @params {fun} fn
         */
        _load : function (fn) {

            var self = this;

            // normalize
            // add extension if necessary
            var file = this.$.file.split('.');
            if (file[file.length - 1] !== this.$.mode) {
                this.$.file = file + '.' + this.$.mode;
            }

            // buid path to markup file
            // force ejs extension to avoid
            // 500er errors
            var path = 'text!' + this.$.file;

            // load markup
            try {

                // first check inline
                // ex: '#html-index', id="html-index"
                this.$.markup = $('#html-' + this.$.file).html();
                if (this.$.markup) {
                    if (fn) {
                        return fn.call(this, this.$.markup);
                    }
                    return;
                }

                // if not found inline, check if already required
                this.$.markup = require(path);

                // invoke callback
                fn.call(this, this.$.markup);

            } catch (e) {

                // require if not required yet
                require([
                    path
                ], function (markup) {
                    self.$.markup = markup;
                    if (fn) {
                        return fn.call(self, self.$.markup);
                    }
                });

            }

        },

        /**
         * @method _render()
         * renders compiled template, injects into DOM
         * @return {*}
         */
        _render : function () {

            // render template from compiled
            this.$.rendered = this.$.compiled({
                data : this.$.data,
                i18n : this.$.i18n
            });

            // using standard jquery injection methods
            switch (this.$.mode) {

                // changed syntax, markup first
                case 'replaceAll' :
                    $(this.$.rendered).replaceAll(this.$.selector);
                    break;

                default :
                    $(this.$.selector)[this.$.mode](this.$.rendered);
                    break;

            }

            return this;

        },

        // PUBLIC

        /**
         * @method data(obj)
         * extends view's data object
         * @params {obj} obj
         * @return {*}
         */
        data : function (obj) {

            // normalize
            obj = obj || null;

            // skip
            // if no incoming or incoming is not object
            if (!obj || !_.isObject(obj)) {
                return this;
            }

            // get current data
            var data = this.get('data');

            // extend current data with incoming
            _.extend(data, obj);

            // save updated data object
            this.set('data', data);

            // exit
            return this;

        },

        i18n : function(obj) {

            this.$.i18n = obj;

            return this;

        },

        /**
         * @method render([fn])
         * sums up load, compile and render process, skips
         * those already accomplished, invokes callback
         * when done
         * @params {fun} fn
         * @return {*}
         */
        render : function (obj, fn) {

            var self = this;

            // ---

            // normalize
            switch (arguments.length) {
                case 1 :
                    if (_.isFunction(obj)) {
                        fn = obj;
                        obj = {};
                    } else {
                        fn = util.noop;
                        obj = obj || {};
                    }
                    break;
                default :
                    obj = obj || {};
                    fn = fn || util.noop;
                    break;
            }

            // ---

            // update data
            this.data(obj);

            // ---

            flow
                .seq(function (next) {

                    // skip
                    // if already loaded
                    if (self.$.markup) {
                        return next();
                    }

                    // load markup, next when done
                    self._load(function () {
                        next();
                    });

                })
                .seq(function (next) {

                    // skip
                    // if already compiled
                    if (self.$.compiled) {
                        return next();
                    }

                    // compile markup
                    self._compile();

                    next();

                })
                .seq(function () {

                    // render template
                    self._render();

                    // invoke callback
                    if (fn) {
                        return fn.call(self, self.$.rendered);
                    }

                })
                .end();

        }

    });

});