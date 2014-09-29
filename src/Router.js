if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    './Base',
    './require',
    './Route'
], function (Base, require, Route) {

    return Base.extend({

        // --- @PRIVATE

        /**
         * ctor, Router
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            this.$ = {
                base      : null,
                context   : null,
                data      : {},
                location  : null,
                name      : null,
                params    : null,
                query     : null,
                routes    : [],
                sensitive : false,
                strict    : false
            };

            if (options) {
                _.extend(this.$, options);
            }

            return this;

        },

        /**
         * @method _dispatch(path)
         * tries to match paths against routes, invokes route
         * callback if match
         * @params path
         * @return {bol}
         */
        _dispatch : function (path, index) {

            index = index || 0;

            var self = this;

            var routes = this.$.routes;

            // loop through all routes and match incoming
            // path against route's regexp
            var valid;
            var validContext;
            for (var i = index; i < routes.length; i++) {

                // match
                if (!valid) {

                    // match against regexp
                    // returns true, false
                    valid = routes[i].route.match(path, []);

                    if (valid === true) {

                        // save context
                        this.$.context = routes[i].route.$;

                        // save params
                        this.$.params = routes[i].route.$.params;

                        // save query
                        this.$.query = routes[i].route.$.query;

                        // invoke callback, apply context
                        routes[i].fn.call(self, {

                            context : this.$.context,
                            data    : this.$.data,
                            params  : this.$.params,
                            query   : this.$.query

                        }, function (data) {

                            // add icnoming data to context
                            // data object
                            if (data) {
                                _.extend(self.$.data, data);
                            }

                            // check if more routes defined
                            var j = i + 1;
                            if (typeof routes[j] !== 'undefined') {

                                // if so try next
                                self._dispatch(path, j);

                            }

                        });

                        return true;

                    }

                } else {

                    // exit, on first match
                    return true;

                }

            }

            // no match
            return false;

        },

        // --- @PUBLIC

        /**
         * @method init()
         * initiates router, starts to listen on
         * hashchange events
         * @return {*}
         */
        end : function () {

            var self = this;

            var dispatch = function () {

                // save location first
                self.$.location = location;

                // extract hash
                var hash = location.hash !== '' ? location.hash : null;

                // extract uri
                var path = location.pathname;

                // add hash to path
                if (hash) {
                    path += hash;
                }

                // prepend context if set
                if (this.$.context) {
                    path = this.$.context + path;
                }

                // dispatch url
                self._dispatch(path);

            };

            require([
                'hashchange'
            ], function () {

                // dispatch on hashchange event
                $(window).hashchange(dispatch);

                // initial dispatch
                dispatch();

            });

            return this;

        },

        /**
         * method go([path])
         * invokes (close to) HTTP redirect, do not confuse it
         * with link like .href(...) function
         * http://stackoverflow.com/questions/503093/how-can-i-make-a-redirect-page-in-jquery-javascript
         * @params {str} path
         * @return {*}
         */
        navigateTo : function (uri) {

            // normalize
            uri = uri || '/';

            // get base
            var base = (this.get('base') === null) ? '' : this.get('base');

            // prepend uri, if base is set
            uri = base + uri;

            // initiates redirection, also avoiding endless
            // back button fiasco by replacing the last history
            // entry with the incoming path
            window.location.replace(uri);

            return this;

        },

        /**
         * @method setRouteCallback(path, fn)
         * sets route and route callback to invoked on match
         * @params {str} path
         * @params {fun} fn
         * @return {*}
         */
        setRouteCallback : function () {

            var self = this;

            // get base url
            var base = (self.$.base === null) ? '' : self.$.base;

            // convert into array
            var args = Array.prototype.slice.call(arguments);

            // isolate path
            var path = args[0];

            // home use case
            if (path === '#/' || path === '/') {
                path = base;
            }

            // prepend path, if base is set
            if (path !== base) {
                path = base + path;
            }

            // remove path, callbacks
            args.splice(0, 1);

            // loop through callbacks, attach callbacks to path
            _.each(args, function (fn) {

                self.$.routes.push({
                    route : new Route(path).init(),
                    fn    : function (req, next) {

                        // invoke callback
                        fn.call(self, req, next);

                    }
                });

            });

            return this;

        },

        // --- INTERFACE

        /**
         * @short navigateTo
         */
        now : function (path) {
            return this.navigateTo.apply(this, arguments);
        },

        /**
         * @short setRouteCallback
         */
        add : function () {
            return this.setRouteCallback.apply(this, arguments);
        }

    });

});