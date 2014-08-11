if (typeof define !== 'function') {
    var _ = require('underscore');
    var define = require('amdefine')(module);
}

define([
    './Inherit',
    './util',
    'underscore'
], function (Inherit, util, _) {

    var Flow = Class.extend({

        // PRIVATE

        /**
         * ctor, Flow
         * @params {optional}{obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            // reset global object
            this.$ = {
                last : null,
                idle : true,
                jobs : [],
                vars : {},
                done : null,
                dead : false,
                name : null
            };

            // add incoming options object to
            // global object
            if (options) {
                _.extend(this.$, options);
            }

            // make contructor chainable
            return this;

        },

        /**
         * @method _setFlow(obj[,par])
         * Adds callback to flow stack, handles seq and par callbacks
         * based on set par flag.
         * @params {required}{obj} obj
         * @params {required}{bol} par
         * @return {*}
         */
        _setFlow : function (obj, par) {

            // normalize
            switch (arguments.length) {
                case 0 :
                    return this;
                    break;
                case 1 :
                    obj = obj || null;
                    par = false;
                    break;
                default :
                    obj = obj || null;
                    par = par || false;
                    break;
            }

            if (par) {

                // if last callback was of type par, add this one to last
                // par array, if not create new par array
                if (this.$.last === 'par') {

                    // add callback to exsting par array
                    // in flow stack
                    this.$.jobs[this.$.jobs.length - 1].push(obj);

                } else {

                    // add callback in new par array to
                    // flow stack
                    this.$.jobs.push([obj]);

                }

                // set flag
                this._setLast('par');

            } else {

                // add callback to flow stack
                this.$.jobs.push(obj);

                // set flag
                this._setLast('seq');

            }

        },

        /**
         * @method _setLast(str)
         * Sets last flag.
         * @params {required}{str} str
         * @returns {*}
         */
        _setLast : function (str) {

            // normalize
            str = str || 'seq';

            // set flag
            this.$.last = str;

            // make chainable
            return this;

        },

        /**
         * @method _next(arr)
         * Invokes callbacks in flow stack.
         * @params {required}{arr} arr
         */
        _next : function (arr) {

            var self = this;

            // ---

            var go = function (arr, fn) {

                // remove first element
                arr.shift();

                // if still more than one callback
                if (arr.length > 0) {

                    // call recursive if not dead yet
                    if (!self.$.dead) {
                        return self._next(arr);
                    }

                    // if callback, invoke callback
                    if (fn) {
                        return fn();
                    }

                    // if no callback, invoke done call
                    self.$.done.call(self, null, self.$.data);

                } else {

                    if (fn) {
                        return fn();
                    }

                    // if no callback, invoke done call
                    self.$.done.call(self, null, self.$.data);

                }

            };

            var io = function (arr, fn) {

                // normalize
                // do not normalize to util.noop,
                // it is important for go() that
                // fn can be null
                fn = fn || null;

                if (arr[0].callback.length) {

                    // async
                    arr[0].callback.call(self, function (err, data) {

                        // skip!
                        if (arr[0].name === '__die__') {
                            return go(arr, fn);
                        }

                        // save
                        // that.data.push(data);
                        // if (arr[0].name) that.vars[arr[0].name] = data;
                        // if (!that.get(arr[0].name)) that.set(arr[0].name, data || null);
                        if (arr[0].name) {
                            self.set(arr[0].name, data || null);
                        }

                        go(arr, fn);

                    });

                } else {

                    // sync
                    var data = arr[0].callback.call(self);

                    // skip!
                    if (arr[0].name === '__die__') {
                        return go(arr, fn);
                    }

                    // save
                    // that.data.push(data);
                    // if (arr[0].name) that.vars[arr[0].name] = data;
                    // if (!that.get(arr[0].name)) that.set(arr[0].name, data || null);
                    if (arr[0].name) {
                        self.set(arr[0].name, data || null);
                    }

                    go(arr, fn);

                }

            };

            // skip
            // if some one died, call done
            // callback early, in this context
            // two params, err, data
            if (this.$.dead) {
                return this.$.done.call(this, null, this.$.data);
            }

            if (_.isArray(arr[0])) {

                if (arr[0].length > 0) {

                    var m = arr[0].length
                        , c = 0;

                    // if first key of incoming array is also an array,
                    // it indicates a `.par` block of functions. As those
                    // functions need to be executed in paralel, loop
                    // over them and return to main arr after all of those
                    // functions have called there finish callbacks.
                    for (var i = 0; i < m; i++) {

                        // If all functions are executed, return back to
                        // main jobs array.
                        io([arr[0][i]], function () {
                            c += 1;
                            if (c >= m) {
                                arr.shift();
                                return self._next(arr);
                            }
                        });

                    }

                } else {

                    // TODO: seems to be redundant, this.$.done(...) should be enough
                    if (arr.length > 0) {
                        io(arr);
                    } else {
                        this.$.done.call(this, null, this.$.data);
                    }

                }

            } else {

                // if still callbacks in stack, invoke callback
                // otherwise call done callback
                if (arr.length > 0) {
                    io(arr);
                } else {
                    this.$.done.call(this, null, this.$.data);
                }

            }

        },

        // PUBLIC

        /**
         * @method .die()
         * Breaks the whole flow, resets flow stack.
         * @return {*}
         */
        die : function (fn, value) {

            var self = this;

            // ---

            if (this.$.idle) {

                // if flow is idle, set a breakpoint callback
                // with name __die, that triggers end callback
                // later on
                this.$.jobs.push({
                    name     : '__die__',
                    callback : function () {
                        return self.die.call(self, fn);
                    }
                });

                return this;

            } else {

                if (fn || fn === false) {

                    // if incoming `callback` is of type function, function
                    // overwrites `.end()`, if not expects expression that
                    // returns boolean, if true, this.$.dead is set to true,
                    // otherwise nothing's happening, flow will go on.
                    if (_.isFunction(fn)) {

                        this.$.dead = true;
                        this.$.done = fn;

                    } else {

                        // if boolean, set flow stack to dead,
                        // invoke incoming callback (if of type
                        // function)
                        if (fn === true) {

                            // set dead flag
                            this.$.dead = true;

                            if (_.isFunction(value)) {
                                if (value.length) {
                                    value(false); // async
                                } else {
                                    this.$.done = value; // overwriting `.end()`
                                }
                            }

                        } else {

                            // async
                            if (_.isFunction(value)) {
                                if (value.length) {
                                    value(true); // async
                                } else {
                                    this.$.done = value; // overwriting `.end()`
                                }
                            } else {
                                return value || false;
                            }
                        }

                    }

                } else {

                    // flag as dead
                    this.$.dead = true;

                }

            }

        },

        /**
         * @method .end([fn])
         * Triggers execution of of current flow stack.
         * @params {optional}{fun} fn
         * @return {*}
         */
        end : function (fn) {

            // normalize
            fn = fn || util.noop;

            // set idle flag
            this.$.idle = false;

            // set ending callback
            this.$.done = fn;

            // start rolling
            this._next(this.$.jobs);

        },

        /**
         * @method .get(key, value)
         * Getter for data saved during execution of flow stack
         * callbacks, return full object if key is not set.
         * @params {optional}{str} key
         * @return {all}
         */
        get : function (key) {

            //  normalize
            key = key || null;

            // all vars
            if (!key) {
                return this.$.vars;
            }

            // specific key
            return this.$.vars[key];

        },

        /**
         * @method .par([name,]fn)
         * Adds paralel callback to flow stack.
         * @params {optional}{str} name
         * @params {required}{fun} fn
         * @return {*}
         */
        par : function (name, fn) {

            // normalize
            switch (arguments.length) {
                case 0 :
                    return this;
                    break;
                case 1 :
                    fn = name;
                    name = null;
                    break;
                default :
                    fn = fn || util.noop;
                    name = name || null;
                    break;
            }

            // add callback to stack flow
            this._setFlow({
                name     : name,
                callback : fn
            }, 'par');

            // make chainable
            return this;

        },

        /**
         * @method .parEach(arr)
         * Allows adding batches of paralel callbacks to flow
         * flow stack.
         * @params {required}{arr} arr
         * @return {*}
         */
        parEach : function (arr) {

            var self = this;

            // loop through all incoming callbacks
            // add callbacks to stack
            for (var i = 0; i < arr.length; i++) {
                (function (arr, i) {
                    self.par(arr[i]);
                })(arr, i)
            }

            return this;

        },

        /**
         * @method .seq([name,]fn)
         * Adds sequential callback to flow stack.
         * @params {optional}{str} name
         * @params {required}{fun} fn
         * @return {*}
         */
        seq : function (name, fn) {

            // normalize
            switch (arguments.length) {
                case 0 :
                    return this;
                    break;
                case 1 :
                    fn = name;
                    name = null;
                    break;
                default :
                    fn = fn || util.noop;
                    name = name || null;
                    break;
            }

            // add callback to flow stack
            this._setFlow({
                name     : name,
                callback : fn
            });

            // make it chainable
            return this;

        },

        /**
         * @method .seqEach(arr)
         * Allows adding batches of sequential callbacks to flow
         * flow stack.
         * @params {required}{arr} arr
         * @return {*}
         */
        seqEach : function (arr) {

            var self = this;

            // loop through all incoming callbacks
            // add callbacks to stack
            for (var i = 0; i < arr.length; i++) {
                (function (arr, i) {
                    self.seq(arr[i]);
                })(arr, i)
            }

            return this;

        },

        /**
         * @method .set(key, value)
         * Simple key/value store to keep data persistant within
         * muliple callback calls during execution of flow stack.
         * @params {required}{str} key
         * @params {required}{*}   value
         * @return {*}
         */
        set : function (key, value) {

            // normalize
            key = key || null;
            value = value || null;

            // skip
            // if no key string
            if (!key) {
                return this;
            }

            // save value
            this.$.vars[key] = value;

            // make chainable
            return this;

        }

    });

    // INTERFACE

    /**
     * @method init([options])
     * Instantiates Flow, returns instance.
     * @params {optional}{obj} options
     * @return {*}
     */
    var init = function (options) {
        return new Flow(options);
    };

    /**
     * @method .par([name,]fn);
     * Instantiates Flow, creating first par
     * using incoming parameters
     * @params {optional}{str} name
     * @params {required}{fun} fn
     * @return {*}
     */
    var par = function (name, fn) {

        // normalize
        switch (arguments.length) {
            case 0 :
                return new Flow();
                break;
            case 1 :
                fn = name;
                name = null;
                break;
            default :
                fn = fn || util.noop;
                name = name || null;
                break;
        }

        // create instance of flow
        var flow = new Flow();

        // add callback as first one
        // in stack
        flow.par.call(flow, name, fn);

        // make chainable
        return flow;

    };

    /**
     * @method .parEach(arr);
     * Instantiates Flow, creating first parEach
     * using incoming parameters
     * @params {optional}{arr} arr
     * @return {*}
     */
    var parEach = function (arr) {

        // create instance of flow
        var flow = new Flow();

        // add callback as first one
        // in stack
        flow.parEach.call(flow, arr);

        // make chainable
        return flow;

    };

    /**
     * @method .seq([name,]fn);
     * Instantiates Flow, creating first seq
     * using incoming parameters
     * @params {optional}{str} name
     * @params {required}{fun} fn
     * @return {*}
     */
    var seq = function (name, fn) {

        // normalize
        switch (arguments.length) {
            case 0 :
                return new Flow();
                break;
            case 1 :
                fn = name;
                name = null;
                break;
            default :
                fn = fn || util.noop;
                name = name || null;
                break;
        }

        // create instance of flow
        var flow = new Flow();

        // add callback as first one
        // in stack
        flow.seq.call(flow, name, fn);

        // make chainable
        return flow;

    };

    /**
     * @method .seqEach(arr);
     * Instantiates Flow, creating first seqEach
     * using incoming parameters
     * @params {required}{arr} arr
     * @return {*}
     */
    var seqEach = function (arr) {

        // create instance of flow
        var flow = new Flow();

        // add callback as first one
        // in stack
        flow.seqEach.call(flow, arr);

        // make chainable
        return flow;

    };

    return {
        init    : init,
        par     : par,
        parEach : parEach,
        seq     : seq,
        seqEach : seqEach
    };

});