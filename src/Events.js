if (typeof define !== 'function') {
    var _ = require('underscore');
    var define = require('amdefine')(module);
}

define([
    './Base'
], function (Base) {

    return Base.extend({

        // --- @PRIVATE

        /**
         * ctor, Events
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            this.$ = {
                events       : {},
                maxListeners : 10
            };

            if (options) {
                _.extend(this.$, options);
            }

            return this;

        },

        /**
         * @method _normalizeType(args)
         * Normalizes arguments `type` and `listener` based on event's
         * context. Defaults to global namespace, if
         * @params {arr} args
         * @return {obj}
         */
        _normalizeType : function (args) {

            var ctx,
                type,
                listener;

            // normalize!
            switch (args.length) {

                case 3 :

                    ctx = args[0];
                    type = args[1];
                    listener = args[2];

                    // ---

                    // set global namespace if context doesn't
                    // provide `id`
                    type = (ctx.get && ctx.id() !== null)
                        ? ctx.id() + ':' + type
                        : '_global:' + type;


                    break;

                default : // type & listener

                    type = '_global:' + args[0];
                    listener = args[1];

                    break;

            }

            // ---

            return  {
                type     : type,
                listener : listener
            };

        },

        /**
         * @method .setMaxListeners([num])
         * Getter/Setter for max. number of listeners. Incoming number
         * will be converted into integer.
         * @params {num} num
         * @return {int|*}
         */
        setMaxListeners : function (num) {

            // normalize!
            num = num || null;

            // skip!
            // if num is of wrong type
            if (num && !_.isNumeric(num)) {

                this.error.logger({
                    type   : 'warning',
                    class  : 'Events',
                    method : '.setMaxListeners()',
                    msg    : 'param `num` of wrong type, must be numeric',
                    data   : arguments,
                    file   : 'Events.js'
                });

                return false;

            }

            // if num, set maxListeners
            if (num) {

                // normalize!
                num = parseInt(num);

                this.$.maxListeners = num;

            }

            // if no num, return max listeners
            if (!num) {
                return this.$.maxListeners;
            }

            // ---

            return this;

        },

        /**
         * @method .emit([ctx,] type[,mixed,mixed ...])
         * Emit event (named `type`) with 0, 1, or 2 arguments in
         * context `ctx`.
         * @params {obj} ctx
         * @params {str} type
         * @params {***} mixed
         * @return {bol}
         *
         * Examples:
         *
         *      // trigger globally
         *     events.emit('foo');
         *     events.emit('foo', {...});
         *     events.emit('foo', {...}, {...});
         *
         *     // listeners accordingly
         *     events.on('foo', function() { ... })
         *     events.on('foo', function(a) { ... })
         *     events.on('foo', function(a, b) { ... })
         *
         *      // trigger in context
         *     events.emit(model, 'foo');
         *     events.emit(model, 'foo', {...});
         *     events.emit(model, 'foo', {...}, {...});
         *
         *     // listeners accordingly
         *     events.on(model, 'foo', function() { ... })
         *     events.on(model, 'foo', function(a) { ... })
         *     events.on(model, 'foo', function(a, b) { ... })
         *
         */
        emit : function () {

            var i,
                arr,
                ctx,
                type,
                eventParams = [];

            // ---

            // normalize
            for (i = 0; i < arguments.length; i++) {

                switch (i) {

                    case 0 :

                        // might be `type` (string)
                        // or `ctx` (object)
                        if (_.isString(arguments[i])) {
                            type = arguments[i];
                            ctx = null;
                        } else {
                            type = type || null;
                            ctx = arguments[i];
                        }

                        break;

                    case 1 :

                        // might be `type` (string)
                        // or event param object (object)
                        if (_.isString(arguments[i])) {
                            type = arguments[i];
                        } else {
                            type = type || null;
                            eventParams.push(arguments[i]);
                        }

                        break;

                    default : // > 1, always event param obj

                        eventParams.push(arguments[i]);

                        break;

                }

            }

            // skip!
            // if type is array
            if (type && _.isArray(type)) {

                for (i = 0; i < type.length; i++) {

                    if (ctx) {
                        arr = [ctx, type[i]];
                        //this.emit(ctx, type[i], eventParams[0], eventParams[1]);
                    } else {
                        arr = [type[i]];
                        //this.emit(type[i], eventParams[0], eventParams[1]);
                    }

                    // unlimited number of arguments possible
                    arr.concat(eventParams);
                    this.emit.apply(this, arr);

                }

                return this;

            }

            // skip!
            // if no `type`, or wrong type
            if (!type || !_.isString(type)) {

                this.error.logger({
                    type   : 'warning',
                    class  : 'Events',
                    method : '.emit()',
                    msg    : 'param `type` of wrong type, must be string',
                    data   : type,
                    file   : 'Events.js'
                });

                return false;

            }

            // normalize
            type = (ctx && ctx.get && ctx.id() !== null)
                ? ctx.id() + ':' + type
                : '_global:' + type;

            var handler,
                listeners;

            // ---

            this.$.events = this.$.events || {};
            handler = this.$.events[type] || null;

            // skip!
            // if no handler
            if (!handler) {
                //console.warn('.emit() failed -> no handler found');
                return false;
            }

            // skip!
            // if handler of wrong type
            if (handler && !_.isFunction(handler) && !_.isArray(handler)) {

                this.error.logger({
                    type   : 'warning',
                    class  : 'Events',
                    method : '.emit()',
                    msg    : '`handler` of wrong type, must be function or array of functions',
                    data   : handler,
                    file   : 'Events.js'
                });

                return false;

            }

            // ---

            var l,
                args;

            // ---

            // if handler is function
            if (_.isFunction(handler)) {

                if (eventParams.length === 0) {
                    handler.call(this);
                } else {
                    handler.apply(this, eventParams);
                }

                return true;

            }

            // if handler is array
            if (_.isArray(handler)) {

                listeners = handler.slice();
                for (i = 0, l = listeners.length; i < l; i++) {
                    listeners[i].apply(this, eventParams);
                }

                return true;

            }

        },

        /**
         * @method .addListener(type, listener)
         * Binds listener `str` (or array of `str`) to handler `func` (or
         * array of `func`).
         * @params {str|arr} type
         * @params {fun|arr} listener
         * @return {*}

         * Examples:
         *
         *     events.addListener('foo', function() {});
         *     events.addListener(['foo1', 'foo2'], function() {});
         *     events.addListener('foo', [
         *          function() { ... },
         *          function() { ... }
         *     ]);
         *
         */
        addListener : function (type, listener) {

            // normalize!
            type = type || null;
            listener = listener || null;

            // skip!
            // if wrong type
            if (!_.isFunction(listener) && !_.isArray(listener)) {
                return;
            }

            // ---

            var i;

            // ---

            // skip!
            // if type is array, loop and call recursively
            if (_.isArray(type)) {
                for (i = 0; i < type.length; i++) {
                    this.addListener(type[i], listener);
                }
                return this;
            }

            // skip!
            // if listener is array, loop and call recursively
            if (_.isArray(listener)) {
                for (i = 0; i < listener.length; i++) {
                    this.addListener(type, listener[i]);
                }
                return this;
            }

            // ---

            // to avoid recursion in the case that type == "newListeners"! Before
            // adding it to the listeners, first emit "newListeners".
            if (this.$.events.newListener) {
                this.emit('newListener', type, _.isFunction(listener.listener) ?
                    listener.listener : listener);
            }

            if (!this.$.events[type]) {

                // optimize the case of one listener. Don't need the extra array object.
                this.$.events[type] = listener;

            } else if (_.isArray(this.$.events[type])) {

                // if we've already got an array, just append.
                this.$.events[type].push(listener);

            } else {

                // adding the second element, need to change to array.
                this.$.events[type] = [this.$.events[type], listener];

            }

            // check for listener leak
            if (_.isArray(this.$.events[type]) && !this.$.events[type].warned) {

                var m;

                m = this.$.maxListeners;

                if (m && m > 0 && this.$.events[type].length > m) {

                    this.$.events[type].warned = true;

                    this.error.logger({
                        type   : 'warning',
                        class  : 'Events',
                        method : '.addListener()',
                        msg    : 'LEAK! Too many listeners!',
                        data   : arguments,
                        file   : 'Events.js'
                    });

                }

            }

            return this;

        },

        /**
         * @method .addListenerOnce(type, listener)
         * Binds listener `str` (or array of `str`) to handler `func` (or
         * array of `func`). Listener will die after being handled once.
         * @params {str|arr} type
         * @params {fun|arr} listener
         * @return {*}

         * Examples:
         *
         *     events.addListenerOnce('foo', function() {});
         *     events.addListenerOnce(['foo1', 'foo2'], function() {});
         *     events.addListenerOnce('foo', [
         *          function() { ... },
         *          function() { ... }
         *     ]);
         *
         */
        addListenerOnce : function (type, listener) {

            // normalize!
            type = type || null;
            listener = listener || null;

            // skip!
            // if wrong type
            if (!_.isFunction(listener) && !_.isArray(listener)) {

                this.error.logger({
                    type   : 'warning',
                    class  : 'Events',
                    method : '.addListenerOnce()',
                    msg    : '`listener` of wrong type, must be function or array of functions',
                    data   : arguments,
                    file   : 'Events.js'
                });

                return false;

            }

            // ---

            var that = this;

            // ---

            var i;

            // ---

            // skip!
            // if type is array, loop and call recursively
            if (_.isArray(type)) {
                for (i = 0; i < type.length; i++) {
                    this.addListenerOnce(type[i], listener);
                }
                return this;
            }

            // skip!
            // if listener is array, loop and call recursively
            if (_.isArray(listener)) {
                for (i = 0; i < listener.length; i++) {
                    this.addListenerOnce(type, listener[i]);
                }
                return this;
            }

            // ---

            function g() {

                that.removeListener(type, g);
                listener.apply(this, arguments);

            }

            g.listener = listener;

            // ---

            that.on(type, g);

            // ---

            return this;

        },

        /**
         * @method .removeListener(type, listener)
         * Removes specific handler form listener or all handlers
         * from listener (defacto remove listener).
         * @params {str} type
         * @params {fun} listener
         * @return {*}
         * Examples:
         *
         *     var foo1 = function() { ... };
         *     var foo2 = function() { ... };
         *     events.on('foo', [foo1, foo2]);
         *
         *     // remove handler 'foo1'
         *     events.removeHandler('foo', foo1);
         *
         *     // remove all handlers
         *     events.removeHandler('foo');
         *
         */
        removeListener : function (type, listener) {

            // normalize!
            type = type || null;
            listener = listener || null;

            // skip!
            // if no specific listener, remove all listeners
            if (type && !listener) {
                this.removeAllListeners(type);
                return false;
            }

            // skip!
            // if wrong type
            if (listener && !_.isFunction(listener)) {

                this.error.logger({
                    type   : 'warning',
                    class  : 'Events',
                    method : '.removeListener()',
                    msg    : '`listener` of wrong type, must be function',
                    data   : arguments,
                    file   : 'Events.js'
                });

                return false;

            }

            // does not use listeners(), so no side effect of creating events[type]
            if (!this.$.events || !this.$.events[type]) return this;

            // ---

            var list,
                position;

            // ---

            list = this.$.events[type];

            if (_.isArray(list)) {

                position = -1;

                for (var i = 0, length = list.length; i < length; i++) {

                    if (list[i] === listener ||
                        (list[i].listener && list[i].listener === listener)) {
                        position = i;
                        break;
                    }

                }

                if (position < 0) return this;

                list.splice(position, 1);
                if (list.length == 0)
                    delete this.$.events[type];

                if (this.$.events.removeListener) {
                    this.emit('removeListener', type, listener);
                }

            } else if (list === listener || (list.listener && list.listener === listener)) {

                delete this.$.events[type];

                if (this.$.events.removeListener) {
                    this.emit('removeListener', type, listener);
                }
            }

            return this;

        },

        /**
         * @method .removeAllListeners(type)
         * Removes all handlers from listener (defacto removes listener).
         * @params {str} type
         * @return {*}
         *
         * Examples:
         *
         *     var foo1 = function() { ... };
         *     var foo2 = function() { ... };
         *     events.on('foo', [foo1, foo2]);
         *
         *     // remove 'foo'
         *     events.removeListener('foo');
         *
         */
        removeAllListeners : function (type) {

            if (!this.$.events) return this;

            // fast path
            if (!this.$.events.removeListener) {

                if (arguments.length === 0) {
                    this.$.events = {};
                } else if (type && this.$.events && this.$.events[type]) {
                    this.$.events[type] = null;
                }

                return this;

            }

            // slow(ish) path, emit 'removeListener' events for all removals
            if (arguments.length === 0) {

                for (var key in this.$.events) {
                    if (key === 'removeListener') continue;
                    this.removeAllListeners(key);
                }

                this.removeAllListeners('removeListener');
                this.$.events = {};

                return this;

            }

            // ---

            var listeners;

            // ---

            listeners = this.$.events[type];

            if (_.isArray(listeners)) {

                while (listeners.length) {
                    // LIFO order
                    this.removeListener(type, listeners[listeners.length - 1]);
                }

            } else if (listeners) {

                this.removeListener(type, listeners);

            }

            this.$.events[type] = null;

            return this;

        },

        /**
         * @method .listeners([type])
         * Get handlers of specific listener or all handlers.
         * @param  {str} type
         * @return {arr}
         *
         * Examples
         *
         *      events.on('foo', function() { ... });
         *
         *      // returns array of handlers of listener `foo`
         *      events.listeners('foo');
         *
         *      // returns obj of all listeners containing arrays
         *      // of their handlers
         *      events.listeners();
         *
         */
        listeners : function (type) {

            type = type || null;

            // skip!
            // if wrong type
            if (type && !_.isString(type)) {
                return;
            }

            // if type, return listeners of type
            if (type) {

                if (this.$.events[type]) {

                    if (!_.isArray(this.$.events[type])) {
                        return [this.$.events[type]];
                    }

                    return this.$.events[type].slice(0);

                } else {
                    return [];
                }

            }

            // if no type, return all listeners
            if (!type) {
                return this.$.events;
            }

        },

        // --- Shortcuts & Wrappers

        /**
         * @method .on([ctx,] type, listener)
         * Wrapper for `.addListener()` method, normalizes `type` and
         * `listener` params based on given `ctx`.
         * @param  {obj} ctx
         * @param  {str|arr} type
         * @param  {fun|arr} listener
         * @return {*}
         */
        on : function (ctx, type, listener) {

            var args;

            // ---

            args = this._normalizeType(arguments);
            this.addListener(args.type, args.listener);

            return this;

        },

        /**
         * @method .once([ctx,] type, listener)
         * Wrapper for `.addListenerOnce()` method, normalizes `type` and
         * `listener` params based on given `ctx`.
         * @params {obj} ctx
         * @params {str|arr} type
         * @params {fun|arr} listener
         * @return {*}
         */
        once : function (ctx, type, listener) {

            var args;

            // ---

            args = this._normalizeType(arguments);
            this.addListenerOnce(args.type, args.listener);

            return this;

        },

        /**
         * @method .off([ctx,] type, listener)
         * Wrapper for `.removeListener()` method, normalizes `type` and
         * `listener` params based on given `ctx`.
         * @params {obj} ctx
         * @params {str|arr} type
         * @params {fun|arr} listener
         * @return {*}
         */
        off : function (ctx, type, listener) {

            var args;

            // ---

            args = this._normalizeType(arguments);
            this.removeListener(args.type, args.listener);

            return this;

        },

        /**
         * @method .offAll([ctx,] type, listener)
         * Wrapper for `.removeAllListeners()` method, normalizes
         * `type` and `listener` params based on given `ctx`.
         * @params {obj} ctx
         * @params {str|arr} type
         * @params {fun|arr} listener
         * @return {*}
         */
        offAll : function (ctx, type, listener) {

            var args;

            // ---

            args = this._normalizeType(arguments);
            this.removeAllListeners(args.type, args.listener);

            return this;

        }

    });

});