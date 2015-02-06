if (typeof define !== 'function') {
    var _ = require('underscore');
    var define = require('amdefine')(module);
}

define([
    './Base',
    './Flow',
    './util',
    './xhr'
], function (Base, flow, util, xhr) {

    return Base.extend({

        // PRIVATE

        /**
         * ctor, Api
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            this.$ = {
                context  : null,
                endpoint : '/api',
                headers  : {
                    'Content-Type' : 'application/json'
                },
                host     : null,
                port     : null,
                protocol : 'https'
            };

            if (options) {
                _.extend(this.$, options);
            }

            return this;

        },

        /**
         * @method _setUrl(url)
         * Builds request url based on set url parameters like
         * prototocol, host, endpoint, etc.
         * @params {required}{str} url
         * @return {str}
         */
        _setUrl : function (url) {

            // skip
            // if incoming is fully qualified url
            if (url.substr(0, 4) === 'http') {
                return url;
            }

            var str = '';

            // add protocol
            if (this.$.protocol) {
                str += this.$.protocol + '://';
            }

            // add host
            if (this.$.host) {
                str += this.$.host;
            }

            // add port
            if (this.$.port) {
                str += ':' + this.$.port;
            }

            // add endpoint
            if (this.$.endpoint) {
                str += this.$.endpoint;
            }

            // add context
            if (this.$.context) {
                str += this.$.context;
            }

            // add url
            str += url;

            return str;

        },

        // PUBLIC

        /**
         * @method .del(url[,fn])
         * DELETE url with optional body callback.
         * @params {required}{str} url
         * @params {optional}{fun} fn
         * @return {*}
         */
        del : function () {

            // overwrite url
            arguments[0] = this._setUrl(arguments[0]);

            // set xhr
            var req = xhr.del.apply(xhr, arguments);

            // set xhr headers
            if (this.$.headers) {
                req.set(this.$.headers);
            }

            return req;

        },

        /**
         * @method .get(url[,data][,fn])
         * GET api url with optional querystring data, callback.
         * @params {required}{str} url
         * @params {optional}{obj|fun} data
         * @params {optional}{fun} fn
         * @return {*}
         */
        get : function () {

            // overwrite url
            arguments[0] = this._setUrl(arguments[0]);

            // set xhr
            var req = xhr.get.apply(xhr, arguments);

            // set xhr headers
            if (this.$.headers) {
                req.set(this.$.headers);
            }

            return req;

        },

        /**
         * @method .post(url[,data][,fn])
         * POST api url with optional body data, callback.
         * @params {required}{str} url
         * @params {optional}{obj|fun} data
         * @params {optional}{fun} fn
         * @return {*}
         */
        post : function () {

            // overwrite url
            arguments[0] = this._setUrl(arguments[0]);

            // set xhr
            var req = xhr.post.apply(xhr, arguments);

            // set xhr headers
            if (this.$.headers) {
                req.set(this.$.headers);
            }

            return req;

        },

        /**
         * @method .put(url[,data][,fn])
         * PUT api url with optional body data, callback.
         * @params {required}{str} url
         * @params {optional}{obj|fun} data
         * @params {optional}{fun} fn
         * @return {*}
         */
        put : function () {

            // overwrite url
            arguments[0] = this._setUrl(arguments[0]);

            // set xhr
            var req = xhr.put.apply(xhr, arguments);

            // set xhr headers
            if (this.$.headers) {
                req.set(this.$.headers);
            }

            return req;

        }

    });

});