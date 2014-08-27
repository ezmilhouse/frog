if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    './Base',
    './util'
], function (Base, util) {

    return Base.extend({

        // PRIVATE

        /**
         * ctor, Collection
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            this.$ = {
                api       : null,
                data      : [],
                dataScope : [],
                endpoint  : '/',
                index     : '_id',
                Model     : [],
                model     : null,
                offset    : 0,
                limit     : 100,
                scope     : null,
                scopes    : {}
            };

            if (options) {
                _.extend(this.$, options);
            }

            return this;

        },

        // PUBLIC: FIND, GETTERS, SETTERS

        /**
         * @method getById(id, obj)
         * Returns single item, identified by id.
         * @params {required}{str} id
         * @return {obj|null}
         */
        getById : function (id) {

            // extract index key
            var index = this.$.index;

            // extract data
            var data = this.$.data || [];

            // loop through all items, find matching
            // id, return if matched
            for (var i = 0; i < data.length; i++) {

                // match id
                if (data[key] === id) {

                    // exit result
                    return data[key];

                }

            }

            // exit, no results
            return null;

        },

        /**
         * @method getById(id, obj)
         * Returns multiple items, identified by
         * matching property value
         * @params {required}{str} key
         * @params {required}{str} val
         * @return {arr || null}
         */
        getByProperty : function (key, val) {

            // extract data
            var data = this.$.data || [];

            // filter
            var arr = [];
            for (var i = 0; i < data.length; i++) {
                if (data[key] === val) {
                    arr.push(data[key]);
                }
            }

            // exit, no results
            if (arr.length === 0) {
                return null;
            }

            // exit
            return arr;

        },

        /**
         * @method setById(id, obj)
         * Updates single item in collection, identified
         * by id, with values of object obj.
         * @params {required}{str} id
         * @params {required}{obj} obj
         * @return {*}
         */
        setById : function (id, obj) {

            // extract index key
            var index = this.$.index;

            // extract data
            var data = this.$.data || [];

            // loop through all items, find matching
            // id, update data set
            for (var i = 0; i < data.length; i++) {

                // match id
                if (data[key] === id) {

                    // update data
                    _.extend(data[key], obj);

                    // exit with result
                    return data[key];

                }

            }

            // exit, no results
            return null;

        },

        // PUBLIC: CRUD

        /**
         * @method index([fn])
         * Fetches resource items as index list, handles
         * offsets and limits as well, maintains, mirror
         * data array locally
         * @params {optional}{obj} options
         * @params {optional}{fun} fn
         */
        index : function (options, fn) {

            // normalize
            switch (arguments.length) {
                case 0 :
                    options = null;
                    fn = util.noop;
                    break;
                case 1 :
                    if (_.isFunction(options)) {
                        fn = options;
                        options = null;
                    } else {
                        fn = util.noop;
                        options = options || {};
                    }
                    break;
                default :
                    options = options || {};
                    fn = fn || util.noop;
                    break;
            }

            var self = this;

            // get api
            var api = this.$.api;

            // get url
            var url = this.$.url;

            // get limit
            var limit = (!options || typeof options.limit === 'undefined')
                ? self.get('limit')
                : options.limit;

            // get offset
            var offset = (!options || typeof options.offset === 'undefined')
                ? self.get('offset')
                : options.offset;

            // request
            api
                .get(url)
                .query({
                    limit  : limit,
                    offset : offset
                })
                .end(function (err, body, status) {

                    // error
                    if (err || body.error) {
                        console.log('o(O', err, body, status);
                        return fn(true);
                    }

                    // get data
                    var data = self.$.data || [];

                    // calculate difference between offset
                    // and current data.length in case offset
                    // is higher than current data.length
                    // ex:
                    // data:   50
                    // offset: 80
                    // limit:  20
                    // -> offset = 80 - (80-50) = 30
                    var diff = 0;
                    if (data.length < offset) {

                        // calc difference
                        diff = offset - data.length;

                        // calc real offset
                        offset = offset - (diff);

                    }

                    // calc range from zero to start of limit
                    var range = offset + diff;

                    // calc keys to loop through
                    var items = range + limit;

                    // now we need to fill up the data array
                    // properly, means that all kyes must be
                    // in the array, whether or not they con-
                    // tain data
                    var j = 0;
                    for (var i = 0; i < items; i++) {

                        // within the range between 0 and
                        // real offset, just use existing
                        // or create empty index set to
                        // null
                        // in range between offset and limit
                        // add new keys, or overwrite with
                        // body of request data
                        if (i < range) {
                            data[i] = data[i] || null;
                        } else {
                            data[i] = body.data[j] || null;
                            j++;
                        }

                    }

                    // save
                    self.$.data = data;

                    // exit
                    fn(null, data);

                });

        },

        /**
         * @method update([options][,fn])
         * Aupdates single item in collection.
         * @params {optional}{obj} options
         *    @key id
         *    @key data
         * @params {optional}{fun} fn
         * @returns {*}
         */
        update : function (options, fn) {

            var self = this;

            // normalize
            switch (arguments.length) {
                case 0 :
                    options = null;
                    fn = util.noop;
                    break;
                case 1 :
                    if (_.isFunction(options)) {
                        fn = options;
                        options = null;
                    } else {
                        fn = util.noop;
                        options = options || {};
                    }
                    break;
                default :
                    options = options || {};
                    fn = fn || util.noop;
                    break;
            }

            // extract id
            var id = options.id;

            // extract data
            var data = options.data || {};

            // update item, returns item
            var item = this.setById(id, data);

            // skip
            // not found
            if (!item) {
                return fn(true, null, 404);
            }

            // skip
            // if saving is not wanted
            if (!options.save) {
                return fn(null, item, 204);
            }

            // get api
            var api = this.$.api;

            // get url
            var url = this.$.url + '/' + id;

            api
                .put(url)
                .send(item)
                .end(function (err, body, status) {

                    // error
                    if (err || body.error) {
                        console.log('o(O', err, body, status);
                        return fn(true);
                    }

                    // exit
                    fn(null, item, 204);

                });

        },

        // PUBLIC

        /**
         * @method data([arr])
         * Getter/Setter for collection data
         * @params [arr] arr
         * @return {*}
         */
        data : function (arr) {

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

        },

        /**
         * @method scope([filter])
         * Returns filtered data or plain data (if filter
         * is not set) or empty array if filter could not
         * be found.
         * @params {str} filter
         * @return {arr}
         */
        scope : function (filter) {

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

        }

    });

});