if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    './Base'
], function (Base) {

    return Base.extend({

        // --- @PRIVATE

        /**
         * ctor, Route
         * @params {str} path
         * @params {obj} options
         * @return {*}
         */
        _ctor : function (path, options) {

            options = options || {};

            this.$ = {
                keys   : [],
                params : null,
                path   : path,
                query  : null,
                regexp : null,
                uri    : null
            };

            // reset options, overwrite width those
            // coming in as param
            this.$.options = {
                sensitive : false,
                strict    : false
            };

            _.extend(this.$.options, options);

            return this;

        },

        /**
         * @method _pathToRegEx(path, keys[,sensitive][,strict])
         * converts route's path into matchable regex
         * @params {str} path
         * @params {arr} keys
         * @params {bol} sensitive
         * @params {bol} strict
         * @return {str}
         */
        _pathToRegEx : function (path, keys, sensitive, strict) {

            var self = this;

            // skip
            if (path instanceof RegExp) {
                return path;
            }

            // normalize
            if (path instanceof Array) {
                path = '(' + path.join('|') + ')';
            }

            path = path
                .concat(strict ? '' : '/?')
                .replace(/\/\(/g, '(?:/')
                .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, function (_, slash, format, key, capture, optional) {

                    keys.push({
                        name     : key,
                        optional : !!optional
                    });

                    // save keys
                    self.$.keys = keys;

                    slash = slash || '';

                    return ''
                        + (optional ? '' : slash)
                        + '(?:'
                        + (optional ? slash : '')
                        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
                        + (optional || '');

                })
                .replace(/([\/.])/g, '\\$1')
                .replace(/\*/g, '(.*)');

            return new RegExp('^' + path + '$', sensitive ? '' : 'i');

        },

        /**
         * @method _querystringToObject(query)
         * converts querystring into object of querystring params
         * @params {str} query
         * @return {obj}
         */
        _querystringToObject : function (query) {

            var params = query.split('&');

            var obj = {};
            var arr;
            for (var i = 0; i < params.length; i++) {
                arr = params[i].split('=');
                if (arr[1]) {
                    obj[decodeURIComponent(arr[0])] = decodeURIComponent(arr[1]);
                }
            }

            return obj;

        },

        // --- @PUBLIC

        /**
         * @method init()
         * initiates route, normalizes regex
         * @return {*}
         */
        init : function () {

            // normalize regex
            this.$.regexp = this._pathToRegEx(this.$.path, this.$.keys, this.$.options.sensitive, this.$.options.strict);

            return this;

        },

        // ---

        /**
         * @method match(path, params)
         * matches incoming path against known routes,
         * re-formats matched route result object,
         * extracts params, extracts querystring
         * @params {str} path
         * @params {arr} params
         * @return {bol}
         */
        match : function (path, params) {

            var keys = this.$.keys;
            var query = path.split('?')[1] || null;
            var queryIndex = path.indexOf('?');
            var uri = ~queryIndex ? path.slice(0, queryIndex) : path;

            // console.log(path);
            // console.log(keys);
            // console.log(query);
            // console.log(queryIndex);
            // console.log(uri);

            // try to match
            var match = this.$.regexp.exec(uri);
            // console.log(match);

            // skip
            if (!match) {
                return false;
            }

            // console.log(match);

            // format result
            var key;
            var val;
            for (var i = 1; i < match.length; i++) {
                key = keys[i - 1];
                val = (typeof match[i] === 'string')
                    ? decodeURIComponent(match[i])
                    : match[i];
                if (key) {
                    // normalize to lower case
                    key.name.toLowerCase();
                    params[key.name] = undefined !== params[key.name]
                        ? params[key.name]
                        : val;
                } else {
                    params.push(val);
                }
            }

            this.$.uri = uri;
            this.$.params = params;
            this.$.query = (query !== null) ? this._querystringToObject(query) : null;

            return true;

        }

    });

});