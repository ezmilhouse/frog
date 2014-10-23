(function () {

    var initializing = false, fnTest = /xyz/.test(function () {
        xyz;
    }) ? /\b_super\b/ : /.*/;

    // The base Class implementation (does nothing)
    this.Class = function () {
    };

    // Create a new Class that inherits from this class
    Class.extend = function (prop) {

        var _init = '_ctor';
        var _super = this.prototype;

        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;

        // Copy the properties over onto the new prototype
        for (var name in prop) {

            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(prop[name]) ?
                (function (name, fn) {
                    return function () {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, prop[name]) :
                prop[name];
        }

        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this[_init])
                this[_init].apply(this, arguments);
        }

        // Populate our constructed prototype object
        Class.prototype = prototype;

        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;

        // And make this class extendable
        Class.extend = arguments.callee;

        return Class;
    };

})();
define("src/Inherit", function(){});



define('src/util',[
    'moment',
    'numeral'
], function (moment, numeral) {

    var util = {

        /**
         * @object codes
         * List of application wide fallback status codes
         * and messages.
         */
        codes : {
            '200' : 'OK',
            '201' : 'OK_CREATED',
            '202' : 'OK_ACCEPTED',
            '204' : 'OK_NO_CONTENT',
            '400' : 'ERROR_BAD_REQUEST',
            '401' : 'ERROR_UNAUTHORIZED',
            '403' : 'ERROR_FORBIDDEN',
            '404' : 'ERROR_NOT_FOUND',
            '409' : 'ERROR_CONFLICT',
            '500' : 'ERROR_INTERNAL_SERVER_ERROR'
        },

        /**
         * @object date
         * Everything date related.
         */
        date : {

            formats : {
                iso       : 'YYYY-MM-DDTHH:mm:ss.sss',
                local     : {
                    de     : 'DD.MM.YYYY - HH:mm:ss',
                    de_day : 'DD.MM.YYYY'
                },
                utc       : 'MM-DD-YYYY HH:mm:ss ZZ',
                utcutc    : 'ddd MMM DD YYYY HH:mm:ss.sss ZZ',
                utc_parse : 'ddd MMM DD YYYY HH:mm:ss.sss ZZ'
            },

            /**
             * @method date.setLocal(str[,type])
             * Takes UTC timestring, creates moment object,
             * converts into local time, returns formatted
             * date string.
             *
             * @params {required}{str} time
             * @params {optional}{str} type
             * @return {str}
             */
            local : function (time, type) {

                // normalize
                type = type || 'de';
                type = util.date.formats.local[type];

                // return local date string
                return moment(time).local().format(type);

            },

            /**
             * @method date.getUTC()
             * Creates current date string in UTC format.
             *
             * @returns {*}
             */
            utc : function () {
                return moment.utc().format(util.date.formats.utc);
            },

            /**
             * @method date.getUTCLocal()
             * Creates current local date in UTC format,
             *
             * @return {str}
             */
            utcLocal : function (time, format) {

                // use incoming time (or not), creates time
                // UTC string like:
                // Fri Sep 05 2014 15:53:09 GMT+0200
                if (time) {
                    return moment.utc(time, format).local().format(util.date.formats.utc);
                }

                return moment.utc().local().format(util.date.formats.utc);

            }

        },

        /**
         * @object date
         * Everything related to hashing.
         */
        hash : {

            /**
             * @method sha1(str)
             * Hashing incoming string using sha1.
             * @params {required}{str} str
             * @return {str}
             */
            sha1 : function (str) {
                return crypto.createHash('sha1').update(str).digest('hex');
            }

        },

        /**
         * @object moment
         * Proxy to moment library.
         */
        moment : moment,

        /**
         * @method trim(val)
         * Trimms string, uses jquery if available otherwise
         * falls back to native js method.
         *
         * @params {required}{str} val
         * @return {str}
         */
        trim : function (val) {

            // skip
            // if undefined
            if (typeof val === 'undefined') {
                return val;
            }

            // force string
            val = val.toString();

            // jquery is available
            if (typeof $ !== 'undefined') {
                return $.trim(val);
            }

            // jquery not available
            return val.replace(/^\s+|\s+$/gm,'');

        },

        /**
         * @method guid(num)
         * Generates given number of GUIDs, returns array of
         * numbers.
         *
         * @params {required}{num} num
         * @return {arr}
         */
        guid : function (num) {

            // normalize
            num = num || 1;

            // calc random number
            var s4 = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };

            // concat random numbers
            var go = function () {
                return (s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4());
            };

            // loop through as many as given numbvers
            var arr = [];
            for (var i = 0; i < num; i++) {
                arr.push(go());
            }

            return arr;

        },







        // EVERYTHING BELOW THIS LINE SHOULD BE CONSIDERED
        // DEPRECATED, UP FOR RE-EVALUATION

        /**
         * @constants KEYCODE_n
         * Keycodes of special keys, mostly used in jquery
         * events context.
         */
        KEYCODE_ESC : 27,

        /**
         * @object calc
         * Calculations of all sorts.
         */
        calc : {

            /**
             * @method timeDiff(arr)
             * Caculates timedifferences in ms between arr of
             * incoming timestamps, returns verbosed results
             * object.
             * @params {required}{arr} arr
             * @return {obj}
             */
            timeDiff : function (arr) {

                // set decimals
                var decimals = 4;

                // reset differences
                var diff = [];

                // alsways start with zero
                //diff.push('0.00s');

                // loop through all breaks calculate
                // difference to next one
                for (var i = 0; i < arr.length; i++) {
                    if (i - 1 >= 0) {
                        diff.push(((arr[i].time - arr[i - 1].time) / 1000).toFixed(decimals) + 's - ' + arr[i].note);
                    } else {
                        diff.push('0.0000s - ' + arr[i].note);
                    }
                }

                // calc total time
                var total = arr[arr.length - 1].time - arr[0].time;

                // prepare response
                var obj = {
                    logs  : arr,
                    total : (total / 1000).toFixed(decimals),
                    diff  : diff,
                    text  : 'Done in ' + (total / 1000).toFixed(decimals) + ' seconds.'

                };

                return obj;

            }
        },

        /**
         * @method deepcopy(obj)
         * Returns deep copy of a simple object (therefore)
         * returned object will lose all refrences to original
         * one.
         * @params {required} obj
         * @return {obj}
         */
        deepcopy : function (obj) {
            return JSON.parse(JSON.stringify(obj));
        },

        /**
         * @method deepcopy([deep,]target,object1[,objectn])
         * Returns deep copy of a simple object (therefore)
         * returned object will lose all refrences to original
         * one.
         * @params {optional}{bol} deep
         * @params {required}{obj} target
         * @params {required}{obj} object1
         * @params {optional}{obj} objectn
         * @return {obj}
         */
        deepextend : function () {

            /**
             * @method isPlainObj(obj)
             * Validates incoming object, checks whether it's
             * empty object or not.
             * @params {required}{obj} obj
             * @return {bol}
             */
            var isPlainObj = function (obj) {

                // bust be an object.
                // because of IE, we also have to check the presence of
                // the constructor property, make sure that DOM nodes
                // and window objects don't pass through, as well
                if (!obj || !this.object || obj.nodeType) {
                    return false;
                }

                try {

                    // not own constructor property must be Object
                    if (obj.constructor && !hasOwn.call(obj, 'constructor') && !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                        return false;
                    }

                } catch (e) {

                    // IE8,9 will throw exceptions on certain host
                    // objects #9897
                    return false;

                }

                // own properties are enumerated firstly, so to speed up,
                // if last one is own, then all properties are own.
                var key;
                for (key in obj) {
                }

                // return boolean
                return key === undefined || hasOwn.call(obj, key);

            };

            // ---

            var options;
            var name;
            var src;
            var copy;
            var copyIsArray;
            var clone;
            var target = arguments[0] || {};
            var i = 1;
            var length = arguments.length;
            var deep = false;

            // handle a deep copy situation
            if (typeof target === 'boolean') {

                // normalize
                deep = target;
                target = arguments[1] || {};

                // skip the boolean
                // and the target
                i = 2;

            }

            // handle case when target is a string or
            // something (possible in deep copy)
            if (typeof target !== 'object' && !_.isFunction(target)) {
                target = {};
            }

            // loop through all incoming objects
            for (i = 0; i < length; i++) {

                // only deal with non-null/undefined values
                if ((options = arguments[ i ]) != null) {

                    // extend the base object
                    for (name in options) {

                        src = target[ name ];
                        copy = options[ name ];

                        // prevent never-ending loop
                        if (target === copy) {
                            continue;
                        }

                        // recurse if we're merging plain objects or arrays
                        if (deep && copy && ( isPlainObj(copy) || (copyIsArray = _.isArray(copy)) )) {

                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && _.isArray(src) ? src : [];
                            } else {
                                clone = src && isPlainObj(src) ? src : {};
                            }

                            // never move original objects, clone them
                            target[ name ] = util.deepextend(deep, clone, copy);


                        } else if (copy !== undefined) {

                            // don't bring in undefined values
                            target[ name ] = copy;

                        }

                    }

                }

            }

            // return the modified object
            return target;

        },

        /**
         * @object format
         * Helper methods to format strings, numbers, dates, etc.
         */
        format : {

            /**
             * @method date(str)
             * TODO: DEPRECATED
             * TODO: seems to be too Germany specific
             * Format incoming str into German date string.
             * @params {required}{str} str
             * @return {str}
             */
            date : function (str) {

                log('Warning: util.format.date() is deprecated (at this location), has to live somewhere else.');

                return moment(str).format('DD.MM.YYYY - HH:mm:ss');

            },

            /**
             * @method number(num)
             * TODO: DEPRECATED
             * TODO: seems to be too Germany specific
             * TODO: for now hard-coded to German settings
             * Format number according to locale, more specifically
             * the thousands separator.
             * @pramas {required}{num} num
             * @return {str}
             */
            number : function (i, locale) {

                log('Warning: util.format.number() is deprecated (at this location), has to live somewhere else.');

                // normalize
                locale = locale = 'de_DE';

                // set options
                numeral.language(locale, {
                    delimiters : {
                        thousands : '.',
                        decimal   : ','
                    },
                    currency   : {
                        symbol : '€'
                    }
                });
                // numeral.language(locale);

                // returns updated string
                return numeral(i).format('0,0');

            }

        },

        /**
         * @method isBusy
         * TODO: DEPRECATED
         * Add .frog-busy class to incoming element (or selector).
         * @params {required}{obj|str} el
         * @return {bol}
         */
        isBusy : function (el) {

            log('Warning: util.isBusy() is deprecated, now handled by Handler.Form');

            // normalize
            el = $(el);

            // add frog-busy class
            el.addClass('frog-busy');

            return true;

        },

        /**
         * @method isIdle
         * TODO: DEPRECATED
         * Removes .frog-busy class from incoming element (or selector).
         * @params {required}{obj|str} el
         * @return {bol}
         */
        isIdle : function (el) {

            log('Warning: util.isIdle() is deprecated, now handled by Handler.Form');

            // normalize
            el = $(el);

            // remove frog-busy class if attached
            if (el.hasClass('frog-busy')) {
                el.removeClass('frog-busy');
                return true;
            }

            return false;

        },

        /**
         * @object log
         * Various loggers.
         */
        log : {
            mongo : {
                down  : function () {
                    var str = '';
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[mongodb] no connection, service down';
                    console.log(str);
                },
                error : function () {
                    var str = '';
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[mongodb] error occured';
                    console.log(str);
                },
                exit  : function () {
                    var str = '';
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[mongodb] service exited';
                    console.log(str);
                },
                up    : function () {
                    var str = '';
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[mongodb] connection established';
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[mongodb] service up, runs on http://' + this.host + ':' + this.port;
                    console.log(str);
                }
            },
            node  : {
                process           : function (process, port) {
                    var str = '';
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] Process (PID): ' + process.pid;
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] Node.js: ' + process.versions.node;
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] Running on port ' + port + ', debug on port ' + process.debugPort;
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] Visit at http://localhost:' + port;
                    console.log(str);
                },
                exception         : function (type, err, stack) {
                    var str = '';
                    str += '\n';
                    if (stack) {
                        str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] ' + type.toUpperCase() + ': ' + err.stack;
                    } else {
                        str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] ' + type.toUpperCase() + ': ' + err;
                    }
                    console.log(str);
                },
                uncaughtException : function (req, res, route, err) {
                    var str = '';
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] ' + status;
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] ' + req.method + ' ' + req.url;
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] REFERER ' + req.headers.referer;
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] USER-AGENT ' + req.headers['user-agent'];
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] ' + err.stack;
                    console.log(str);
                },
                req               : {
                    error   : function (req, status) {
                        var str = '';
                        str += '\n';
                        str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] ' + status;
                        str += '\n';
                        str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] ' + req.method + ' ' + req.url;
                        str += '\n';
                        str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] REFERER ' + req.headers.referer;
                        str += '\n';
                        str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] USER-AGENT ' + req.headers['user-agent'];
                        console.log(str);
                    },
                    success : function (req, status) {
                        var str = '';
                        str += '\n';
                        str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] ' + status;
                        str += '\n';
                        str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] ' + req.method + ' ' + req.url;
                        str += '\n';
                        str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] REFERER ' + req.headers.referer;
                        str += '\n';
                        str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] USER-AGENT ' + req.headers['user-agent'];
                        console.log(str);
                    }
                },
                up                : function () {
                    var str = '';
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] server started';
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] service up, runs on http://localhost:' + this.$.port;
                    console.log(str);
                },
                workers           : {
                    up   : function (server) {
                        var str = '';
                        str += '\n';
                        str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] worker up';
                        console.log(str);
                    },
                    down : function (server, worker) {
                        var str = '';
                        str += '\n';
                        str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] worker with PID ' + worker.id + ' died, rip, his mother loved him';
                        console.log(str);
                    }
                }
            },
            time  : {

                /**
                 * @method _setLogTime(req)
                 * Adds timelog to request object.
                 * @params {required}{obj} req
                 * @return {obj}
                 */
                resources : function (server, req, note) {

                    // extract request object key
                    var key = server.get('object');

                    // create, if does not exist yet
                    if (typeof req[key] === 'undefined') {
                        req[key] = {};
                    }

                    // create, if does not exist yet
                    if (typeof req[key].time === 'undefined') {
                        req[key].time = [];
                    }

                    // add time
                    req[key].time.push({
                        time : new Date().getTime(),
                        note : note
                    });

                    // exit
                    return req;

                }

            }

        },

        /**
         * @object messages
         * Various messages.
         */
        messages : {

            // success messages
            '2xx' : {

                '00000' : 'Request, response, ok.',

                '00001' : 'X-domain preflight request (OPTIONS), response, ok.',

                '00002' : 'Web hook request (POST), response, ok.'

            },

            // errors messages
            '4xx' : {

                // UNKNOWN

                '00000' : 'Unknown error.',

                // DATABASE

                '00001' : 'Failed to connect to database.',

                '00002' : 'Document(s) not found.',

                // REQUESTS

                '00003' : 'Request body not found.',

                '00004' : 'Request body is missing required keys.',

                '00021' : 'Request querystring not found.',

                '00022' : 'Request querystring is missing required keys.',

                // ROUTES

                '00010' : 'Resource not found.',

                // HEADERS

                '00011' : 'Missing key header.',

                // not used
                '00012' : '',

                '00013' : 'Missing session header.',

                '00014' : 'Invalid key header.',

                // not used
                '00015' : '',

                '00016' : 'HTTP method not allowed.',

                '00017' : 'Client group not allowed.',

                '00018' : 'Client key not allowed.',

                '00019' : 'Client key denied.',

                '00020' : 'Clients could not be retrieved.'

            }

        },

        /**
         * @method mouseWheelListener(evt)
         * TODO: DEPRECATED
         * TODO: WRONG LOCATION
         * Helper method only used in modal context, disables scoll
         * while modal is shown
         * @params {required}{obj} evt
         */
        mouseWheelListener : function (evt) {
            log('Warning: util.mouseWheelListener() is deprecated (at this location), has to live somewhere else.');
            evt.preventDefault();
        },

        /**
         * @object : modal
         * TODO: DEPRECATED
         * TODO: WRONG LOCATION
         * Helper options, methods to make modals work.
         */
        modal : {

            /**
             * @property height
             * The height for the modal.
             */
            height : 600,

            /**
             * @property cssClass
             * The main css class for the modal.
             */
            cssClass : 'frog-modal-default',

            /**
             * @property content
             * The modal content element for manipulations.
             * For now it will be inside modal body element
             */
            content : null,

            /**
             * @property outer
             * The modal outer element for manipulations.
             */
            outer : null,

            /**
             * @property close
             * The modal close element for manipulations.
             */
            close : null,

            /**
             * @property mask
             * The modal backstrecht element for manipulations.
             */
            mask : null,

            /**
             * @property body
             * The modal body element for manipulations.
             */
            body : null,

            /**
             * @property afterShow
             * The callback after showing the modal.
             */
            afterShow : null,

            /**
             * @property afterHide
             * The callback after hiding the modal.
             */
            afterHide : null,

            /**
             * @method init(options[,fn])
             * Hides modal, basically remove .frog-overlay from
             * html tag.
             * @params {required}{obj} options
             * @params {optional}{fun} fn
             * @return {*}
             */
            init : function (options, fn) {

                log('Warning: util.modal.init() is deprecated (at this location), has to live somewhere else.');

                var that = this;

                // normalize
                fn = fn || util.noop;

                // Checkout passed options
                for (var opt in options) {
                    if ({}.hasOwnProperty.call(options, opt)) {
                        this[opt] = options[opt];
                    }
                }

                // Check if we've already the modal into the DOM
                if ($('.' + this.cssClass + ' .frog-modal-body').html()) {
                    fn(this);
                    return this;
                }

                // Create wrappers
                this.body = $('<div class="frog-modal-body"></div>');
                this.close = $('<div class="frog-modal-close">X</div>');
                this.mask = $('<div class="frog-modal-mask"></div>');
                this.outer = $('<div class="frog-modal">');

                // Set the structure
                $('body').append(
                    this.outer
                        .append(this.body.append(this.content))
                        .append(this.close)
                        .append(this.mask)
                        .addClass(this.cssClass)
                        .css({
                            height : this.height + 'px'
                        })
                        .delay(500)
                        .queue(function (next) {
                            fn(that);
                            next();
                        })
                );

                // Set the close event when clicking on close
                this.close
                    .unbind()
                    .bind('click', this.hide);

                // Set the close event when clicking on mask
                this.mask
                    .unbind()
                    .bind('click', this.hide);

                // Set the close event when pressing ESC key
                $(document).on('keyup', function (evt) {
                    if (evt.keyCode === util.KEYCODE_ESC) {
                        that.hide();
                    }
                });

                return this;

            },

            /**
             * @method hide([fn])
             * Hides modal, basically switches .frog-overlay-in/out from
             * html tag.
             * @params {optional}{fun} fn
             * @return {*}
             */
            hide : function (fn) {

                log('Warning: util.modal.hide() is deprecated (at this location), has to live somewhere else.');

                // normalize
                fn = fn || this.afterHide || util.noop;

                // remove trigger class
                $('html')
                    .removeClass('frog-modal-in')
                    .addClass('frog-modal-out');

                // Detach the nullifying mouse wheel listener
                $(document).off('mousewheel', util.mouseWheelListener);

                // invoke callback
                if (typeof fn === 'function') {
                    fn(this);
                }

                return this;

            },

            /**
             * @method show()
             * Shows modal, basically switches .frog-overlay-in/out from
             * html tag.
             * @params {optional}{fun} fn
             * @return {*}
             */
            show : function (fn) {

                log('Warning: util.modal.show() is deprecated (at this location), has to live somewhere else.');

                // normalize
                fn = fn || this.afterShow || util.noop;

                // add trigger class
                $('html')
                    .removeClass('frog-modal-out')
                    .addClass('frog-modal-in');

                // Attach the nullifying mouse wheel event
                $(document).on('mousewheel', util.mouseWheelListener);

                // invoke callback
                if (typeof fn === 'function') {
                    fn(this);
                }

                return this;

            },

            /**
             * @method destroy()
             * Destroys modal.
             * @params {optional}{fun} fn
             * @return {*}
             */
            destroy : function (fn) {

                log('Warning: modal.destroy() is deprecated (at this location), has to live somewhere else.');

                // normalize
                fn = fn || util.noop;

                // just detach the DOM element
                this.outer.detach();

                // invoke callback
                if (typeof fn === 'function') {
                    fn(this);
                }

                return this;

            }
        },

        /**
         * @method noop()
         * Empt function to help normalize callbacks.
         * @returns {boolean}
         */
        noop : function () {
            return true;
        },

        /**
         * @method parseCookie(headers)
         * Extracts cookie from headers object, returns
         * object with cookie names as keys.
         * @params {required}{obj} headers
         * @return {obj}
         */
        parseCookie : function (headers) {

            var list = {};
            var cookie = headers['cookie'];

            // loop through all cookies, re-format
            cookie && cookie.split(';').forEach(function (cookie) {
                var parts = cookie.split('=');
                list[parts.shift().trim()] = parts.join('=');
            });

            return list;

        },

        /**
         * @method timestamp()
         * Returns current timestamp.
         */
        timestamp : function () {
            return new Date().getTime();
        },

        /**
         * @method time()
         * Returns local Date/Time string.
         * @returns {string}
         */
        time : function () {
            return new Date().toLocaleString();
        },

        /**
         * @method validate(data, keys, fn)
         * Very basic validation method that checks incoming
         * data object to be not nulkl/undefined, and compares
         * incoming array of keys with data object keys, returns
         * error if keys are missing.
         * @params {required}{obj} data
         * @params {required}{arr} keys
         * @params {required}{fun} fn
         */
        validate : function (data, keys, fn) {

            if (!data || _.isEmpty(data)) {
                return fn('00003');
            }

            for (var i = 0; i < keys.length; i++) {
                if (typeof data[keys[i]] === 'undefined') {
                    return fn('00004');
                }
            }

            // exit
            fn(null);

        }

    };

    return util;

});


define('src/xhr',[
    'superagent',
    './util'
], function (request, util) {

    /**
     * @method .end([fn])
     * Overwrites superagent's instance .end
     * method to return better params on end
     * callback.
     * @params {optional}{fun} fn
     * @return {*}
     */
    request.end = function(fn) {

        // normalize
        fn = fn || util.noop;

        return this.run(function (response) {

            // skip
            // handle xhr error
            if (response.error) {
                return fn(true, response.error, response.status, 'XHR_ERROR', response);
            }

            // skip
            // handle response error
            if (response.body && response.body.status >= 400) {
                return fn(true, response.body, response.body.status, response.body.code, response);
            }

            // handle success
            return fn(null, response.body, response.body.status, response.body.code, response);

        });

    };

    /**
     * @method .get(url[,data][,fn])
     * GET url with optional querystring data, callback.
     * @params {required}{str} url
     * @params {optional}{obj|fun} data
     * @params {optional}{fun} fn
     * @return {*}
     */
    request.get = function(url, data, fn){

        var req = request('GET', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function() {
            request.end.apply(req, arguments);
        };

        // normalize
        if ('function' == typeof data) {
            fn = data;
            data = null;
        }

        if (data) {
            req.query(data);
        }

        if (fn) {
            req.end(fn);
        }

        return req;

    };

    /**
     * @method .head(url[,data][,fn])
     * HEAD url with optional body data, callback.
     * @params {required}{str} url
     * @params {optional}{obj|fun} data
     * @params {optional}{fun} fn
     * @return {*}
     */
    request.head = function(url, data, fn){

        var req = request('HEAD', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function() {
            request.end.apply(req, arguments);
        };

        // normalize
        if ('function' == typeof data) {
            fn = data;
            data = null;
        }

        if (data) {
            req.send(data);
        }

        if (fn) {
            req.end(fn);
        }

        return req;

    };

    /**
     * @method .del(url[,fn])
     * DELETE url with optional body callback.
     * @params {required}{str} url
     * @params {optional}{fun} fn
     * @return {*}
     */
    request.del = function(url, fn){

        var req = request('DELETE', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function() {
            request.end.apply(req, arguments);
        };

        if (fn) {
            req.end(fn);
        }

        return req;

    };

    /**
     * @method .patch(url[,data][,fn])
     * PATCH url with optional body data, callback.
     * @params {required}{str} url
     * @params {optional}{obj|fun} data
     * @params {optional}{fun} fn
     * @return {*}
     */
    request.patch = function(url, data, fn){

        var req = request('PATCH', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function() {
            request.end.apply(req, arguments);
        };

        // normalize
        if ('function' == typeof data) {
            fn = data;
            data = null;
        }

        if (data) {
            req.send(data);
        }

        if (fn) {
            req.end(fn);
        }

        return req;

    };

    /**
     * @method .post(url[,data][,fn])
     * POST url with optional body data, callback.
     * @params {required}{str} url
     * @params {optional}{obj|fun} data
     * @params {optional}{fun} fn
     * @return {*}
     */
    request.post = function(url, data, fn){

        var req = request('POST', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function() {
            request.end.apply(req, arguments);
        };

        // normalize
        if ('function' == typeof data) {
            fn = data;
            data = null;
        }

        if (data) {
            req.send(data);
        }

        if (fn) {
            req.end(fn);
        }

        return req;

    };

    /**
     * @method .put(url[,data][,fn])
     * PUT url with optional body data, callback.
     * @params {required}{str} url
     * @params {optional}{obj|fun} data
     * @params {optional}{fun} fn
     * @return {*}
     */
    request.put = function(url, data, fn){

        var req = request('PUT', url);

        // overwrite end method on instance
        req.run = req.end;
        req.end = function() {
            request.end.apply(req, arguments);
        };

        // normalize
        if ('function' == typeof data) {
            fn = data;
            data = null;
        }

        if (data) {
            req.send(data);
        }

        if (fn) {
            req.end(fn);
        }

        return req;

    };

    return request;

});


define('src/Base',[
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


define('src/Flow',[
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


define('src/Api',[
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


define('src/Collection',[
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
            if (typeof options.save !== 'undefined' && options.save === false) {
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


define('src/singleton',[],function () {

    /**
     * @singleton
     * Holds cached instances of Component, API as well as
     * config object.
     */
    var singleton = {
        app        : null,
        api        : null,
        clients    : null,
        components : {},
        config     : null,
        resources  : null,
        server     : null,
        text       : {}
    };

    return singleton;

});


define('src/date',[
    'moment'
], function (moment) {

    var date = {

        formats : {
            utc : 'MM-DD-YYYY HH:mm:ss.sss ZZ',
            iso : 'YYYY-MM-DDTHH:mm:ss.sss',
            tpl : {
                'de'     : 'DD.MM.YYYY - HH:mm:ss',
                'de_day' : 'DD.MM.YYYY'
            }
        },

        // ---

        getUTC : function () {

            // create time string
            // fomatted utc style
            var time = moment.utc().format(date.formats.utc);

            // exit
            return time;

        },

        getUTCLocal : function () {

            // create local time string
            // formatted utc style
            var time = moment().local().format(date.formats.utc);

            // exit
            return time;

        },

        /**
         * @method as(time, pattern[,format])
         * Converts incoming timestring (of a specific pattern)
         * into whatever format, defaults to the utc default.
         * @params {required}{str} time
         * @params {required}{str} pattern
         * @params {optional}{str} format
         * @return {str}
         */
        as : function (time, pattern, format) {

            // normalize
            // force utc if not set
            format = format || date.formats.utc;

            // create formatted timestring
            // based on incoming time (optionally in a
            // specific pattern) and exit format
            var time = moment(time, pattern).format(format);

            // exit
            return time;

        },

        /**
         * @method is(time[,format])
         * Method to be used in templates to format incoming
         * UTC timestrings in a consistent style alongside pre-
         * defined formats/formats
         * @params {required}{str} time
         * @params {optional}{str} format
         * @return {*}
         */
        is : function (time, format) {

            // normalize
            switch (arguments.length) {
                case 0 :
                    return null;
                    break;
                case 1 :
                    time = time || null;
                    format = date.formats.tpl['de'];
                    break;
                default :
                    time = time || null;
                    format = date.formats.tpl[format] || format;
                    break;
            }

            // create formatted timestring
            // based on incoming time and exit format
            var time = moment(time, date.formats.utc).format(format);

            // exit
            return time;

        }

    };

    return date;

});


define('src/View',[
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
                api      : null,
                compiled : null,
                data     : {
                    date : date,
                    util : util
                },
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
            this.$.rendered = this.$.compiled(this.$.data);

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


define('src/Component',[
    './Api',
    './Base',
    './singleton',
    './Flow',
    './util',
    './View'
], function (Api, Base, singleton, Flow, util, View) {

    var Component = Base.extend({

        // PRIVATE

        /**
         * ctor, Component
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            this.$ = {
                data     : {
                    debug        : false,
                    dependencies : [],
                    version      : null
                },
                config   : null,
                el       : null,
                meta     : null,
                id       : null,
                file     : null,
                selector : null,
                layout   : 'layout',
                view     : null
            };

            if (options) {
                _.extend(this.$, options);
            }

            // get component element
            this._getComponent();

            // get component element's data attributes
            this._getData();

            // get component's layout file
            this._getFile();

            // set component in cache
            this._cache();

            return this;

        },

        /**
         * @method _getComponnet()
         * Extracts component's jequery object.
         * @return {*}
         */
        _getComponent : function () {

            // set selector
            this.$.selector = '[data-component=' + this.$.id + ']';

            // get component element
            this.$.el = $(this.$.selector);

            // make chainable
            return this;

        },

        /**
         * @method _getData()
         * Extracts values from component's data attributes.
         * @return {*}
         */
        _getData : function () {

            // get, save component's data attributes
            this.$.data = this.$.el.data();

            // make chainable
            return this;

        },

        /**
         * @method _getFile()
         * Sets path to layout template file.
         * @return {*}
         */
        _getFile : function () {

            // create file url
            var file = '';
            file += 'frog';
            file += '/components/';
            file += this.$.id;
            file += '/html';
            file += '/' + this.$.layout;

            // save
            this.$.file = file;

            // make chainable
            return this;

        },

        /**
         * @method _getModules(modules, modulesOrder[,fn])
         * Uses ordered array of key names to return a ordered
         * array of module object, invokes callback when done
         * @params {required}{arr} modules
         * @params {optional}{fun} fn
         */
        _getModules : function(modules, fn) {

            // normalize
            fn = fn || util.noop;

            // reset array
            var arr = [];
            var obj = {};

            // loop through ordered names, replace names
            // with module objects, therefore you kept
            // order of modules
            for (var i = 0; i < modules.length; i++) {

                // save in order
                arr[i] = modules[i].module;

                // save with key
                obj[modules[i].name] = modules[i].module;

            }

            // exit
            return fn(null, obj, arr);

        },

        /**
         * @method _cache()
         * Caches component instance.
         * @return {*}
         */
        _cache : function() {

            // save components
            singleton.components[this.$.id] = this;

            // make chainable
            return this;

        },

        /**
         * @method _render([fn])
         * Renders component layout into target element.
         * @params fn
         */
        _render : function (fn) {

            // normalize
            fn = fn || util.noop;

            // preserve scope
            var self = this;

            // create view instance
            var view = new View({
                file     : this.$.file,
                globals  : {
                    component : this
                },
                selector : this.$.selector
            });

            // save
            this.$.view = view;

            // render layout into selector
            view.render(function () {
                fn.apply(self, arguments);
            });

        },

        /**
         * @method _trigger()
         * Trigger initialization of component, basically
         * require component's index.js
         */
        _trigger : function() {

            // preserve scope
            var self = this;

            // get config
            var config = this.$.config;

            // build base url
            var base = '';
            base += config.components.paths.base + '/' + this.$.id;
            base += '/' + config.components.paths.root;

            // set config, component
            define('frog/components/' + this.$.id, singleton.components[this.$.id]);

            // require the component index
            // and callback
            try {
                require(base);
            } catch (e) {
                require([base]);
            }

        },

        // PUBLIC

        /**
         * @method bootstrap([config][,render][,fn])
         * Bootstrap component, invoke rendering layout.
         * @params {optional}{obj} config
         * @params {optional}{bol} render
         * @params {optional}{fun} fn
         */
        bootstrap : function (config, render, fn) {

            // normalize
            switch(arguments.length) {
                case 1 :
                    if (_.isObject(config)) {
                        config = config || {};
                        render = false;
                        fn = util.noop;
                    }
                    if (_.isBoolean(config)) {
                        render = config || false;
                        config = {};
                        fn = util.noop;
                    }
                    if (_.isFunction(config)) {
                        fn = config || util.noop;
                        config = {};
                        render = false;
                    }
                    break;
                case 2 :
                    config = config || {};
                    if (_.isBoolean(render)) {
                        render = render || false;
                        fn = util.noop;
                    }
                    if (_.isFunction(render)) {
                        fn = render || util.noop;
                        render = false;
                    }
                    break;
                default :
                    config = config || {};
                    render = render || false;
                    fn = fn || util.noop;
                    break;
            }

            // preserve scope
            var self = this;

            // set config, cache
            singleton.config = this.$.config = config;

            // get data
            var data = this.$.data;

            Flow
                .seq(function (cb) {

                    // skip
                    // if no dependencies
                    if (typeof data === 'undefined' || typeof data.dependencies === 'undefined' || !_.isString(data.dependencies)) {
                        return cb();
                    }

                    // convert into arr of dependencies
                    var arr = data.dependencies.split(',');

                    // reset counters
                    var m = arr.length;
                    var c = 0;

                    // loop through all dependencies, call
                    // bootstrap recursively
                    for (var i = 0; i < arr.length; i++) {

                        // create new instance, bootstrap
                        new Component({
                            id : arr[i]
                        }).bootstrap(config, function (err, component) {

                                // update counter
                                c += 1;

                                // exit
                                if (c >= m) {
                                    return cb();
                                }

                            });

                    }

                })
                .seq(function (cb) {

                    // skip
                    // if initial render is other than true
                    if (!render) {

                        // trigger requiring componnets index.js
                        self._trigger();

                        // exit
                        return fn.call(self, null, self);

                    }

                    // render component into target selector
                    // invoke callback
                    self._render(function() {

                        // trigger requiring componnets index.js
                        self._trigger();

                        // invoke callback in component context
                        fn.call(self, null, self);

                    });

                })
                .end();

        },

        /**
         * @method .id([str])
         * Getter/Setter for component's id attribute.
         * @return {str|*}
         */
        id : function (str) {

            // normalize
            str = str || null;

            // set
            if (str) {
                this.$.id = id;
                return this;
            }

            // get
            return this.$.id;

        },

        /**
         * @method require(paths[,fn])
         * Abstracts require functionality, always async, even if
         * module is already loaded, invokes callback when done
         * @params {required}{arr} paths
         * @params {optional}{fun} fn
         */
        require : function(paths, fn) {

            // normalize
            fn = fn || util.noop;

            // preserve scope
            var self = this;

            // reset
            var arr;
            var str;

            // reset counters
            var m = paths.length;
            var c = 0;

            // reset modules required
            var modules = {};
            var ordered = [];
            var bypaths = [];

            // build module key name based onb file name
            // ex: js/views/view.header -> viewHeader
            for (var i = 0; i < paths.length; i++) {

                // save module path as name
                bypaths[i] = paths[i];

                // closure
                (function (paths, i) {

                    // create path
                    var path = '';
                    path += 'frog/components';
                    path += '/' + self.$.id;
                    path += '/' + paths[i];

                    // require modules, try sync first, might be loaded
                    // somewhere else, if that fails, do the async way
                    // require path
                    require([path], function (module) {

                        // extract file name
                        var parts = bypaths[i].split('/');

                        // save modules order
                        ordered[i] = {
                            name   : parts[parts.length - 1],
                            module : module
                        };

                        // exit
                        c += 1;
                        if (c >= m) {
                            self._getModules(ordered, fn);
                        }

                    });

                })(paths, i);

            }

        }

    });

    return Component;

});


define('src/Email',[
    'underscore',
    './Base',
    './Flow',
    './util'
], function (_, Base, Flow, util) {

    return Base.extend({

        /**
         * @method _ctor([obj])
         * Constructor of Emails class.
         *
         * @params {optional}{obj} options
         * @return {*}
         */
        _ctor : function (options, local) {

            this.$ = {
                dir       : null,
                i18n      : null,
                password  : null,
                protocol  : 'SMTP',
                sender    : {
                    email    : null,
                    name     : null,
                    service  : 'Gmail',
                    user     : null,
                    password : null
                },
                state     : 'idle', // ok
                template  : null,
                templates : null
            };

            if (options) {
                _.extend(this.$, options);
            }

            // prepare
            this._setDir();
            this._setTransport();

            // make chainable
            return this;

        },

        // PRIVATE

        /**
         * @method _.getData(data)
         * Extends incoming data, extends data with default
         * data (ex: with text).
         *
         * @params {required}{obj} data
         * @return {obj}
         */
        _setData : function (data) {
            return _.extend(data, {
                i18n : this.$.i18n
            });
        },

        /**
         * @method _setDir([fn])
         * Fetches, pre-compile email templates, sets
         * ready state.
         *
         * @params {optional}{fun} fn
         */
        _setDir : function (fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            // read templates folder, fetch markup,
            // pre-compile
            templates(this.$.dir, function (err, tpl) {

                // [-] exit
                if (err) {
                    return fn(true, null, 400, 'ERROR_EMAIL_TEMPLATES_COULD_NOT_BE_LOADED');
                }

                // save
                self.$.templates = tpl;

                // set ready state
                self.$.state = 'ok';

                // [+] exit
                fn(null, null, 200);

            });

        },

        /**
         * @method _setTransport()
         * Sets up the transport layer.
         *
         * @return {*}
         */
        _setTransport : function () {

            // initiatiate transport credentials
            this.$.transport = nodemailer.createTransport({
                auth    : {
                    user : this.$.sender.user,
                    pass : this.$.sender.password
                },
                service : this.$.sender.service
            });

            // make chainable
            return this;

        },

        // PUBLIC

        /**
         * @method send([fn])
         * Invokes sending emails.
         *
         * @params {required}{obj} options
         *    @key {required}{obj} data
         *    @key {required}{str} email
         *    @key {required}{str} subject
         *    ok @key {required}{str} template
         * @params {optional}{fun} fn
         */
        send : function (options, fn) {

            // normalize
            fn = fn || util.noop;

            var self = this;

            Flow
                .seq(function (cb) {

                    var seq = this;

                    // skip
                    // if already ready
                    if (self.$.state === 'ok') {
                        return cb();
                    }

                    // prepare templates folder
                    self._setDir(cb)

                })
                .seq(function (cb) {

                    var seq = this;

                    // normalize
                    var data = self._setData(options.data);

                    // compile email with data object
                    self.$.templates(options.template, data, function (err, html, text) {

                        // [-] exit
                        if (err) {
                            return fn(true, null, 400, 'ERROR_EMAIL_NOT_RENDERED');
                        }

                        // save html/text
                        seq.set('html', html);
                        seq.set('text', text);

                        // next
                        cb();

                    });

                })
                .seq(function (cb) {

                    var seq = this;

                    // prepare message
                    var message = {
                        from    : self.$.sender.name + ' <' + self.$.sender.email + '>',
                        to      : '<' + options.email + '>',
                        subject : options.subject,
                        html    : seq.get('html')
                    };

                    // send email
                    self.$.transport.sendMail(message, function (err, body) {

                        // [-] exit
                        if (err) {
                            return fn(true, null, 400, 'ERROR_EMAIL_NOT_SENT');
                        }

                        // [+] exit
                        fn(null, body, 200);

                    });

                })
                .end();

        }

    });

});


define('src/Events',[
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


define('src/Events.Singleton',[
    './Events'
], function (Events) {
	return new Events();
});


define('src/Facebook',[
    './Base',
    './Flow',
    './util',
    './xhr'
], function (Base, Flow, util, xhr) {

    return Base.extend({

        // PRIVATE

        /**
         * ctor, Api
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            this.$ = {
                appId                : null,
                cookie               : false,
                endpoint             : null,
                frictionlessRequests : false,
                friends              : [],
                friendsInvitable     : [],
                hideFlashCallback    : null,
                locale               : 'de_DE',
                login                : null,
                permissions          : [],
                permissionsSet       : [],
                sdk                  : '//connect.facebook.net/[1]/sdk.js',
                status               : false,
                user                 : null,
                version              : 'v2.0',
                xfbml                : false
            };

            if (options) {
                _.extend(this.$, options);
            }

            // prepare
            this._setEndpoint();

            return this;

        },

        /**
         * @method _setEndpoint()
         * Creates SDK endpoint based on url and locale.
         * @returns {*}
         */
        _setEndpoint : function () {

            // cretae endpoint
            this.$.endpoint = this.$.sdk.replace('[1]', this.$.locale);

            // make chainable
            return this;

        },

        /**
         * @method _getFriends([fn])
         * Fetches all friends of a user.
         * @params {optional}{fun} fn
         */
        _getFriends : function (fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

        },

        /**
         * @method _getFriendsInvitable([fn])
         * Fetches all friends of a user that can be
         * invited to your application.
         * @params {optional}{fun} fn
         */
        _getFriendsInvitable : function (fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            Flow
                .seq(function (cb) {

                    self._getStatus(function (err, body, status, code) {

                        // exit
                        // not connected
                        if (err) {
                            return fn(err, body, status, code);
                        }

                        // next
                        cb();

                    });

                })
                .seq(function (cb) {

                    // fetch list of invitable friends
                    FB.api('/me/invitable_friends', function (res) {

                        // error
                        // facebook api error
                        if (res && !res.error) {
                            return fn(true, res.error, 400, 'facebook_api_error');
                        }

                        // save
                        self.$.friendsInvitable = res.data;

                        // exit
                        fn(null, self.$.friendsInvitable, 200);

                    });

                })
                .end();

        },

        /**
         * @method : _getFriendsKnown([fn])
         * Gets list of friends who are also connected to
         * this app, AND have also granted the `user_friends`
         * permission.
         * @params {optional}{fun} fn
         */
        _getFriendsKnown : function(fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            // getch list
            FB.api('/me/friends', function (res) {

                // error
                // facebook api error
                if (res && !res.error) {
                    return fn(true, res.error, 400, 'facebook_api_error');
                }

                // save
                self.$.friends = res.data || [];

                // exit
                fn(null, self.$.friends, 200);

            });


        },

        /**
         * @method _getPermissions([fn])
         * Fetches all user permissions granted for
         * your application.
         * @params {optional}{fun} fn
         */
        _getPermissions : function (fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            Flow
                .seq(function (cb) {

                    self._getLoginStatus(function (err, body, status, code) {

                        // exit
                        // not connected
                        if (err) {
                            return fn(err, body, status, code);
                        }

                        // next
                        cb();

                    });

                })
                .seq(function (cb) {

                    FB.api('/me/permissions', function (res) {

                        // error
                        // facebook api error
                        if (res && !res.error) {
                            return fn(true, res.error, 400, 'facebook_api_error');
                        }

                        // save permissions
                        self.$.permissionsSet = res.data;

                        // exit
                        fn(null, self.$.permissionsSet, 200);

                    });

                })
                .end();

        },

        /**
         * @method _getSdk([fn])
         * Injects SDK into DOM
         */
        _getSdk : function (fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            // callback, invoked once the SDK is loaded
            // after being injected
            window.fbAsyncInit = function () {

                FB.init({
                    appId                : self.$.appId,
                    cookie               : self.$.cookie,
                    frictionlessRequests : self.$.frictionlessRequests,
                    hideFlashCallback    : self.$.hideFlashCallback,
                    status               : self.$.status,
                    version              : self.$.version,
                    xfbml                : self.$.xfbml
                });

                // invoke callback
                fn();

            };

            // inject script tag into DOM, please keep in mind that the
            // SDK's locale only affects the text of XFBML elements, like
            // login or share buttons, the dialogues' language is set by
            // the user's own settings and cannot be controlled by this
            // locale setting.
            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s);
                js.id = id;
                js.src = '//connect.facebook.net/' + self.$.locale + '/sdk.js';
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));

        },

        /**
         * @method _getStatus([fn])
         * Gets user's login status.
         * @params {optional}{fun} fn
         */
        _getStatus : function (fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            Flow
                .seq(function (cb) {

                    // get login status, save user
                    FB.getLoginStatus(function (res) {
                        self.set('login', res);
                        cb();
                    })

                })
                .seq(function (cb) {

                    // check different states
                    switch (self.$.login.status) {

                        // the user is logged in in Facebook AND has
                        // authenticated our app, authResponse object
                        // is available
                        case 'connected' :

                            // reset user
                            self.$.user = {};

                            return fn(null, 200, self.$.login);

                            break;

                        // user is logged in in Facebook BUT HAS NOT
                        // authenticated our app yet, high chance of
                        // conversion in this state
                        case 'not_authorized' :

                            // error
                            return fn(true, 401, self.$.login);

                            break;

                        // user is not logged in in Facebook, therefore
                        // we don't know if he is or is not connected
                        // to our app, user is unknown
                        default :

                            // error
                            return fn(true, 401, self.$.login);

                            break;

                    }

                })
                .end();

        },

        /**
         * @method _getUser([fn])
         * Fetches user data.
         * @params {optional}{fun} fn
         */
        _getUser : function (fn) {

            var self = this;

            // fetch user information
            FB.api('/me', function (res) {

                // error
                if (res && res.error) {
                    return fn(true, res, 400, 'BAD_REQUEST');
                }

                // save user data
                self.$.user = _.extend(self.$.user, res);

                // exit
                fn(null, self.$.user, 200);

            });

        },

        /**
         * @method _getUserImages(fn)
         * Fetches user images.
         * @params {optional}{fun} fn
         */
        _getUserImage : function (fn) {

            var self = this;

            // fetch user information
            FB.api('/me/picture', {
                height   : '200',
                redirect : 'false',
                type     : 'normal',
                width    : '200'
            }, function (res) {

                // error
                if (res && res.error) {
                    return fn(true, res, 400, 'BAD_REQUEST');
                }

                // save user data
                self.$.user = _.extend(self.$.user, {
                    picture : res.data
                });

                // exit
                fn(null, self.$.user, 200);

            });

        },

        // PUBLIC

        /**
         * @method friends([subset][,fn])
         * Fetches all or subset of user's friennds.
         * @params {optional}{str} subset
         * @params {optional}{fun} fn
         */
        friends : function (subset, fn) {

            var self = this;

            // normalize
            switch (arguments.length) {
                case 1 :
                    if (_.isFunction(subset)) {
                        fn = subset;
                        subset = null;
                    } else {
                        subset = subset || null;
                        fn = util.noop;
                    }
                    break;
                default :
                    subset = subset || null
                    fn = fn || util.noop;
                    break;
            }

            // fetch subset of friends or all
            // by default
            switch (subset) {

                case 'invitable' :
                    self._getFriendsInvitable(fn);
                    break;

                case 'known' :
                    self._getFriendsKnown(fn);
                    break;

                default : // all
                    self._getFriends(fn);
                    break;

            }

        },

        /**
         * @method init()
         * Initiates SDK, invokes injection, loading.
         * @params {optional}{fun} fn
         * @return {*}
         */
        init : function (fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            Flow
                .seq(function (cb) {

                    // get SDK, load SDK
                    self._getSdk(cb);

                })
                .seq(function (cb) {

                    // get user's login status
                    self._getStatus(cb);

                })
                .par(function (cb) {

                    // fetch user info
                    self._getUser(cb);

                })
                .par(function (cb) {

                    // fetch user image
                    self._getUserImage(cb);

                })
                .end(function () {

                    // set ready state
                    self.$.ready = true;

                    // exit
                    fn(null, self.$.user, 200);

                });

        },

        /**
         * @method invite(message[, fn])
         * Allows facebook user to invite his friends.
         * @params {required}{str} message
         * @params {optional}{fun} fn
         */
        invite : function (message, fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            Flow
                .seq(function (cb) {

                    // check if permission to invite friends
                    // is granted
                    self._getPermissions(function (err, body, status, code) {

                        // error
                        // could not get permissions
                        if (err) {
                            return fn(err, body, status, code);
                        }

                        var perm = _.find(body, function (obj) {
                            obj.permission === 'user_friends';
                        });

                        // error
                        // missing permission
                        if (!perm) {
                            return fn(true, null, 401, 'missing_permissin');
                        }

                        // next
                        cb();

                    });

                })
                .seq(function (cb) {

                    // fetch list of invitable friends
                    self._getFriendsInvite(function (err, body, status, code) {

                        // error
                        if (err) {
                            return fn(err, body, status, code);
                        }

                        // next
                        cb();

                    });

                })
                .seq(function (cb) {

                    var seq = this;

                    // resets list of friend ids
                    var ids = [];

                    // loop through all invitable friends,
                    // extract invitable id
                    for (var i = 0; i < self.$.friendsInvitable.length; i++) {
                        ids.push(self.$.friendsInvitable[i].id);
                    }

                    // re-format into string of comma separated
                    // id strings
                    ids = ids.join(',');

                    // invoke friend invites
                    FB.ui({
                        method  : 'apprequests',
                        message : message,
                        to      : ids

                    }, function (res) {

                        // exit
                        // facebook api error
                        if (res && !res.error) {
                            return fn(true, res.error, 400, 'facebook_api_error');
                        }

                        trc(res.data);

                        // save
                        seq.set('invites', res.data);

                        // next
                        cb()

                    });

                })
                .seq(function (cb) {

                    // save invite ids on user
                    // to later track invite
                    // results

                    // exit
                    fn(null, null, 200);

                })
                .end();

        },

        /**
         * @method login([fn])
         * Logs in user, if successful, gets basic user information,
         * saves information on $.user
         * @params {optional}{fun} fn
         */
        login : function (fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            frog.Flow
                .seq(function (cb) {

                    // normalize permissions
                    var perms = self.$.permissions || [];

                    // invoke login dialogue
                    FB.login(function (res) {

                        // everything went well, user is now
                        // connected to out app, therefore
                        // save user
                        if (res.status === 'connected') {
                            self.$.user = res.authResponse;
                            return cb();
                        }

                        // otherwise save attempt
                        self.$.login = res;

                        // error
                        return fn(true);

                    }, {

                        // set permissions scope
                        scope : perms.join(',')

                    });

                })
                .par(function (cb) {

                    // fetch user info
                    self._getUser(cb);

                })
                .par(function (cb) {

                    // fetch user image
                    self._getUserImage(cb);

                })
                .end(function () {
                    fn(null, self.$.user, 200);
                });

        },

        /**
         * @method .ready()
         * Checks whether or not SDK is loaded and initiated.
         * @return {bol}
         */
        ready : function () {
            return this.$.ready || false;
        }

    });

});


define('src/validations',[
    './util'
], function (util) {

    /**
     * @object _validations
     * Collections of form field validation methods
     */
    var validations = {

        /**
         * @method ifRange(val, arr, fn)
         * Is optional, if set validates against isRange().
         * Otherwise returns true.
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        ifRange : function (val, arr, fn) {

            // reset flag
            var valid = false;

            if (val && val !== '') {
                valid = validations.isRange(val, arr, fn);
            }

        },

        /**
         * @method isChecked(val, arr, fn)
         * Checks form element against being checked or not,
         * input[type=checkbox], input[type=radio].
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isChecked : function (val, arr, fn) {

            // reset flag
            var valid = false;

            valid = $('[name=' + arr[1] + ']').is(':checked');

            // reverse results
            // fn(err) convention
            return fn(!valid);

        },

        /**
         * @method isCreditCard(val, arr, fn)
         * Validates against credit card format.
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isCreditCard : function (val, arr, fn) {

            // reset flag
            var valid = false;

            // accept only spaces, digits and dashes
            if (/[^0-9 \-]+/.test(val)) {

                // reverse results
                // fn(err) convention
                return fn(true);

            }

            var nCheck = 0,
                nDigit = 0,
                bEven = false,
                n, cDigit;

            val = val.replace(/\D/g, "");

            // basing min and max length on
            // http://developer.ean.com/general_info/Valid_Credit_Card_Types
            if (val.length < 13 || val.length > 19) {
                return false;
            }

            for (n = val.length - 1; n >= 0; n--) {
                cDigit = val.charAt(n);
                nDigit = parseInt(cDigit, 10);
                if (bEven) {
                    if (( nDigit *= 2 ) > 9) {
                        nDigit -= 9;
                    }
                }
                nCheck += nDigit;
                bEven = !bEven;
            }

            valid = ( nCheck % 10 ) === 0;

            // reverse results
            // fn(err) convention
            return fn(!valid);

        },

        /**
         * @method isEmail(val, arr, fn)
         * Validates against email format.
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isEmail : function (val, arr, fn) {

            // reset flag
            var valid = false;

            // set regex
            // http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
            var rex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            // get results
            valid = rex.test(val);

            // reverse results
            // fn(err) convention
            return fn(!valid);

        },

        /**
         * @method isEmails(val, arr, fn)
         * Validates multiple str against email format.
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isEmails : function (val, arr, fn) {

            // reset flag
            var valid = false;

            // reverse results
            // fn(err) convention
            return fn(!valid);

        },

        /**
         * @method isEnum(val, arr, fn)
         * Validates against list enumerated values.
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isEnum : function (val, arr, fn) {

            // reset flag
            var valid = false;

            // remove first key
            arr.splice(0, 1);

            // [+] valid
            // in array
            if (arr.indexOf(val) > -1) {
                valid = true;
            }

            // reverse results
            // fn(err) convention
            return fn(!valid);

        },

        /**
         * @method isEqualTo(val, arr, fn)
         * Checks if incoming matches given.
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isEqualTo : function (val, arr, fn) {

            // reset flag
            var valid = false;

            // compare valings
            valid = val === arr[1];

            // reverse results
            // fn(err) convention
            return fn(!valid);

        },

        /**
         * @method isEqualToField(val, arr, fn)
         * Checks if incoming matches value of incoming field's
         * current value.
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isEqualToField : function (val, arr, fn) {

            // reset flag
            var valid = false;

            // extract value from other field
            // identifier is field name
            var value = $('[name=' + arr[1] + ']', this.$.el).val();

            // compare
            valid = value === val;

            // reverse results
            // fn(err) convention
            return fn(!valid);

        },

        /**
         * @method isInList(val, arr, fn)
         * Checks if incoming value is also in list
         * of select options.
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isInList : function (val, arr, fn) {

            // reset flag
            var valid = false;

            // fetch element
            var el = $('[name=' + arr[1] + ']', this.$.el);

            // loop through select options,
            // checks if incoming value is
            // in select option list, return
            // true if matched
            var value;
            $('option', el).each(function () {
                value = $(this).val();
                if (value !== '' && value === val) {
                    valid = true;
                }
            });

            // reverse results
            // fn(err) convention
            return fn(!valid);

        },

        /**
         * @method isMax(val, arr, fn)
         * Checks if number is <= max.
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isMax : function (val, arr, fn) {

            // reset flag
            var valid = false;

            // force integer
            val = parseInt(val);

            // check if lt (eq) than max
            valid = val <= arr[1];

            // reverse results
            // fn(err) convention
            return fn(!valid);

        },

        /**
         * @method isMax(val, arr, fn)
         * Checks if valing length is <= max.
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isMaxLength : function (val, arr, fn) {

            // reset flag
            var valid = false;

            // check val length
            valid = val.length <= arr[1];

            // reverse results
            // fn(err) convention
            return fn(!valid);

        },

        /**
         * @method isMin(val, arr, fn)
         * Checks if number >= min.
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isMin : function (val, arr, fn) {

            // reset flag
            var valid = false;

            // force integer
            val = parseInt(val);


            // check is gt (eq) to than min
            valid = val >= arr[1];

            // reverse results
            // fn(err) convention
            return fn(!valid);

        },

        /**
         * @method isMin(val, arr, fn)
         * Checks if valing length is >= min.
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isMinLength : function (val, arr, fn) {

            // reset flag
            var valid = false;

            // check val length
            valid = val.length >= arr[1];

            // reverse results
            // fn(err) convention
            return fn(!valid);

        },

        /**
         * @method isNoop(val, arr, fn)
         * Returns true (valid), always!
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isNoop : function(val, arr, fn) {

            // force true
            var valid = true;

            // reverse results, to meet
            // fn(err) convention
            return fn(!valid);
        },

        /**
         * @method isRange(val, arr, fn)
         * Checks if number is between min and max.
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isRange : function (val, arr, fn) {

            // reset flag
            var valid = false;

            // force integer
            val = parseInt(val);

            // check range
            valid = val >= parseInt(arr[1]) && val <= parseInt(arr[2]);

            // reverse results, to meet
            // fn(err) convention
            return fn(!valid);

        },

        /**
         * @method isRangeLength(val, arr, fn)
         * Checks if valing length is between min and max.
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isRangeLength : function (val, arr, fn) {

            // reset flag
            var valid = false;

            // check range
            valid = val.length >= arr[1] && val.length <= arr[2];

            // reverse results, to meet
            // fn(err) convention
            return fn(!valid);

        },

        /**
         * @method isNumbersOnly(val, arr, fn)
         * Checks if incoming is numbers only.
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isNumbersOnly : function (val, arr, fn) {

            // reset flag
            var valid = false;

            valid = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(val);

            // reverse results, to meet
            // fn(err) convention
            return fn(!valid);

        },

        /**
         * @method isOptional(val, arr, fn)
         * Validates against emptyness, only if not empty :-).
         * Basically here for consistency reasons.
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isOptional : function (val, arr, fn) {

            // reset flag
            var valid = false;

            // skip if no input
            if (typeof val === 'undefined' || val === null || val === '') {

                // all good, is optional, therefore
                // only validated if more than nothing
                return fn();

            }

            valid = util.trim(val).length >= 1;

            // reverse results, to meet
            // fn(err) convention
            return fn(!valid);

        },

        /**
         * @method isRequired(val, arr, fn)
         * Validates against emptyness.
         * @params {required}{val} val
         * @params {required}{arr} arr
         * @params {required}{fun} fn
         */
        isRequired : function (val, arr, fn) {

            // reset flag
            var valid = false;

            // check string length
            if (val) {
                valid = util.trim(val).length > 0;
            }

            // reverse results, to meet
            // fn(err) convention
            return fn(!valid);

        }

    };

    return validations;

});


define('src/Handler.Form',[
    './Base',
    './date',
    './Flow',
    './util',
    './validations'
], function (Base, date, flow, util, validations) {

    return Base.extend({

        // PRIVATE

        /**
         * ctor, Form
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            this.$ = {
                action           : true,
                css              : {
                    field             : 'field',
                    fieldError        : 'field-error',
                    fieldErrorMessage : 'field-error-message',
                    fieldErrorFlag    : 'field-error-flag',
                    fieldSuccess      : 'field-success',
                    fieldSuccessFlag  : 'field-success-flag',
                    form              : 'form',
                    formBusy          : 'form-busy',
                    formCancel        : 'form-cancel',
                    formError         : 'form-error',
                    formErrorMessage  : 'form-error-message',
                    formNative        : 'form-native',
                    formSubmit        : 'form-submit'
                },
                data             : {},
                el               : null,
                endpoint         : '/',
                errors           : null,
                errors_all       : false,
                fields           : {},
                globals          : {
                    date : date,
                    util : util
                },
                listeners_fields : false,
                listeners_forms  : false,
                markup           : {
                    error_field : '',
                    error_form  : ''
                },
                method           : 'POST',
                namespace        : null,
                prefix           : 'frog-',
                rules            : {},
                selector         : 'form',
                state            : 'loaded', // idle, error, ok
                text             : {},
                valid            : true,
                validations      : validations,
                view             : null
            };

            if (options) {
                _.extend(this.$, options);
            }

            // prepare
            this._setPrefix();

            return this;

        },

        /**
         * @method _setFormBusy([state])
         * Sets form into busy mode, in busy form buttons and
         * form submission is blocked.
         * @params {optional}{bol} state
         */
        _busy : function (state) {

            // normalize
            state = state || null;

            // set namespace
            var ns = this.$.selector + ' ';

            // get classes
            var cl = this.$.css;

            // set busy state based on incoming boolean
            if (state) {

                // set busy state
                this.$.state = 'busy';

                // set busy flag
                $(ns).addClass(cl.formBusy);

            } else {

                // release busy state
                this.$.state = 'idle';

                // release busy flag
                $(ns).removeClass(cl.formBusy);

            }

            // make chainable
            return this;

        },

        /**
         * @method _getForm()
         * Fetches form's jquery object, saves it on this.$.el
         * key.
         * @return {*}
         */
        _getForm : function () {

            // add el
            this.$.el = $(this.$.selector);

            // add errors container to form
            this.$.el.prepend(this.$.markup.error_form);

            // return form
            return this.$.el;

        },

        /**
         * @method _getFields()
         * Fetches all fields and adds them (plus contextual
         * data) to this.$.fields object.
         * @return {*}
         */
        _getFields : function () {

            // preserve scope
            var self = this;

            // reset fields object
            this.$.fields = {};

            // set namespace
            var ns = this.$.selector + ' ';

            // get classes
            var cl = this.$.css;

            // loop through all elements that have a name
            // attribute
            $(ns + '.' + cl.field + ' [name]').each(function () {

                // extract element
                var el = $(this);

                // extract name
                var name = el.attr('name');

                // extract type
                var type = (el.attr('type')) ? el.attr('type') : null;

                // avoid empty elements
                if (name && name !== '') {

                    // add field object
                    self.$.fields[name] = {
                        el    : el,
                        name  : name,
                        valid : null,
                        tag   : el.prop('tagName').toLowerCase(),
                        type  : type,
                        value : null
                    };

                    // no error fields for checkboxes and radio buttons
                    if (type !== 'checkbox' && type !== 'radio') {

                        // inject error containers per field
                        el.closest(ns + '.' + cl.field).append(self.$.markup.error_field);

                    }

                }

            });

            // return fields
            return this.$.fields;

        },

        /**
         * @method _getResults()
         * Creates/returns results object.
         * @return {obj}
         */
        _getResults : function () {

            // build results object
            return {
                body   : this.$.data,
                fields : this.$.fields,
                errors : this.$.errors,
                valid  : this.$.valid
            };

        },

        /**
         * @method _setPrefix()
         * Sets CSS class prefix to be used with relevant
         * classes.
         * @return {*}
         */
        _setPrefix : function () {

            // loop through all form classes, set
            // perfixes
            for (var key in this.$.css) {
                this.$.css[key] = this.$.prefix + this.$.css[key];
            }

            // make chainable
            return this;

        },

        /**
         * @method _setErrorMessage(field)
         * Extracts error messages form's text object based on
         * error type and field name.
         * @params {required}{str} field
         * @return {str}
         */
        _setErrorMessage : function (field) {

            // extract rules
            var rules = this.$.rules[field] || [];

            // reset rule params
            var ruleParams;

            // reset error
            var error;

            // reset error text
            var errorText;

            // extract errors
            var errors = this.$.errors[field];

            // reset error messages
            var str = '';

            // reset collection of error messages
            // (in correct order)
            var arr = [];

            // loop through all errors, build error
            // message string, and collection of
            // error messages (as array)
            for (var i = 0; i < errors.length; i++) {

                // extract single error
                error = errors[i];

                // extract error message text
                errorText = this.$.text[error];

                // extract array of rules params
                ruleParams = (_.isArray(rules[1]))
                    ? rules[1]
                    : null;

                // if rule has params, then now those params can be
                // injected into the error message by their position
                // in the array, skip first key (0) as it holds the
                // rule name
                // ex: "Minimum of [1] characters." ends up being
                // ex: "Minimum of 6 characters."
                if (ruleParams) {
                    for (var i = 1; i < ruleParams.length; i++) {
                        errorText = errorText.replace('[' + i + ']', ruleParams[i]);
                    }
                }

                // create single string of error messages
                // add line break if not the first entry
                if (str !== '') {
                    str += '</br>';
                }
                str += errorText;

                // create collection of error messages in
                // correct order
                arr.push(errorText);

            }

            // check whether or not to show all, or only
            // the last error messages
            if (this.$.errors_all) {

                // all error messages
                return str;

            } else {

                // last error message
                return arr[arr.length -1];

            }

        },

        /**
         * @method _setFieldListeners()
         * Sets DOM event listeners for field elements (based on
         * tag and if input - based on input type).
         */
        _setFieldListeners : function () {

            // preserve scope
            var self = this;

            // get form
            var form = this._getForm();

            // get fields
            var fields = this._getFields();

            // set namespace
            var ns = this.$.selector + ' ';

            // set class
            var cl = this.$.css;

            // get text
            var text = this.$.text;

            /**
             * @method _validation(evt, fields, el)
             * Invokes validation and resulting change of states.
             * @params {required}{obj} evt
             * @params {required}{str} field
             */
            var _validation = function (field) {

                // validate form field
                self.validate(field);

            };

            /**
             * @method _listeners()
             * Sets change, blur events on form elements.
             * @params {required}{str} field
             * @params {required}{str} tag
             * @params {required}{str} field
             */
            var _listeners = function (field, tag, type) {

                // different listeners based on tags and
                // (if input) based on types
                switch (tag) {

                    case 'select' :
                        $(document).on('change', ns + '[name=' + field + ']', function (evt) {
                            _validation(field);
                        });
                        break;

                    default :

                        switch (type) {

                            case 'checkbox' || 'radio' :
                                $(document).on('click', ns + '[name=' + field + ']', function (evt) {
                                    _validation(field);
                                });
                                break;

                            case 'hidden' :
                                $(document).on('change', ns + '[name=' + field + ']', function (evt) {
                                    _validation(field);
                                });
                                break;

                            case 'range' :
                                $(document).on('input', ns + '[name=' + field + ']', function (evt) {
                                    _validation(field);
                                });
                                break;

                            default :
                                $(document).on('blur', ns + '[name=' + field + ']', function (evt) {
                                    evt.preventDefault();
                                    _validation(field);
                                });
                                break;

                        }

                        break;

                }

            };

            // set listeners
            for (var key in fields) {
                _listeners(key, fields[key].tag, fields[key].type);
            }

            // make chainable
            return this;

        },

        /**
         * @method _setFormListener()
         * Sets DOM event listeners for form element.
         */
        _setFormListener : function () {

            // preserve scope
            var self = this;

            // set namespace
            var ns = this.$.selector + ' ';

            // get classes
            var cl = this.$.css;

            // cancel submission, on click
            $(document).on('click', ns + '.' + cl.formCancel + ' a', function (evt) {

                // prevent native
                evt.preventDefault();

                // cancel form submission,
                // done busy state
                self.done();

            });

            // submit form, on click
            $(document).on('click', ns + '.' + cl.formSubmit + ' a', function (evt) {

                // prevent native
                evt.preventDefault();

                // submit form
                $(this).submit();

            });

            // validate, submit, on click
            $(document).on('submit', ns, function (evt) {

                // extract form
                var el = $(this);

                // if native class is set, native form
                // submission is going to be invoked,
                // class is set in _.submit()
                if (!el.hasClass(cl.formNative)) {

                    // prevent native
                    evt.preventDefault();

                    // submit form
                    self._submit();

                } else {

                    // remove class (resetsubmission type)
                    el.removeClass(cl.formNative);

                }

            });

        },

        /**
         * @method _setMarkup()
         * Sets markup for error messages on form and field level.
         * @returns {*}
         */
        _setMarkup : function () {

            // get css classes
            var cl = this.$.css;

            // get prefix
            var prefix = this.$.prefix;

            // add markup for errors in form and field
            _.extend(this.$.markup, {
                error_field : '<div class="' + cl.fieldErrorMessage + '"></div><div class="' + cl.fieldErrorFlag + '">' + this.$.text.defaultError + '</div><div class="' + cl.fieldSuccessFlag + '">' + this.$.text.defaultSuccess + '</div>',
                error_form  : '<div class="' + cl.formErrorMessage + '">' + this.$.text.formError + '</div>'
            });

            // make chainable
            return this;

        },

        /**
         * @method _setStateSelectors
         * Adds/Removes state class for all fields
         * and forms.
         */
        _setStateClasses : function (field, valid) {

            // get text
            var text = this.$.text;

            // set namespace
            var ns = this.$.selector + ' ';

            // get classes
            var cl = this.$.css;

            // extract element
            var el = $(ns + '[name=' + field + ']');

            // extract form fields parent div
            var parent = el.closest('.' + cl.field);

            // extract name
            var name = el.attr('name');

            // normalize errors
            // if key is available in error object and key
            // contains array
            var errors = false;
            if (this.$.errors && this.$.errors[field] &&
                _.isArray(this.$.errors[field]) &&
                this.$.errors[field].length > 0) {
                errors = true;
            }

            // set valid or invalid state on field
            if (errors) {

                // add error class
                parent.addClass(cl.fieldError);

                // remove success class
                parent.removeClass(cl.fieldSuccess);

                // prepare error message
                var str = this._setErrorMessage(name);

                // set error text
                $('.' + cl.fieldErrorMessage, parent).html(str);

            } else {

                // remove error class
                parent.removeClass(cl.fieldError);

                // add success class
                parent.addClass(cl.fieldSuccess);

                // reset error message
                $('.' + cl.fieldErrorMessage, parent).html('');

            }

            // set form error class based on
            // validation state
            if (!this.$.valid) {

                // inject text
                $('.' + cl.formErrorMessage, this.$.el).html(this.$.text.form);

                // show error message
                $(ns).addClass(cl.formError);

            } else {

                // reset text
                $('.' + cl.formErrorMessage, this.$.el).html('');

                // hide message
                $(ns).removeClass(cl.formError);

            }

        },

        /**
         * @method _submit([fn])
         * Fetches form data, triggers validation, if validation
         * greenlights data, it submits form, based on given $.method
         * and $.endpoint values.
         * @params {optional}{fun} fn
         */
        _submit : function () {

            // preserve scope
            var self = this;

            // get classes
            var cl = this.$.css;

            // skip
            // if already busy
            if (this.$.state !== 'idle') {
                return false;
            }

            // validate form field
            this.validate(function (err, results) {

                // set busy
                self._busy(true);

                // release busy, if validation errors
                if (!results.valid) {
                    return self._busy(false);
                }

                // default form submit, resulting in
                // page refresh, submit uses action,
                // method html attributes on form
                // tag
                if (self.$.action === true) {

                    // extract form element
                    var el = self.$.el;

                    // set native submission flag
                    el.addClass(cl.formNative);

                    // native form submit
                    return el.submit();

                }

                // if action is function, invoke function
                // in handler context with results object
                // as parameter
                if (self.$.action && _.isFunction(self.$.action)) {
                    return self.$.action.call(self, null, results);
                }

            });

        },

        // PUBLIC

        /**
         * @method .done([field])
         * Clears specific field or form from all states, error
         * and success, in case of form busy is also cleared.
         * Clearing states happens with brute force, other forms
         * of form logic are not touched.
         * @params {optional}{str} field
         * @return {*}
         */
        done : function (field) {

            // normalize
            field = field || null;

            // set namespace
            var ns = this.$.selector + ' ';

            // get classes
            var cl = this.$.css;

            if (field) {

                // extract field element
                var el = this.$.el.closest(cl.field);

                // remove state classes
                el.removeClass(cl.fieldError + ' ' + cl.fieldSuccess);

                // make chainable
                return this;

            }

            // remove classes form form tag
            this.$.el.removeClass(cl.formBusy + ' ' + cl.formError);

            // remove state classes from
            $('.' + cl.field, this.$.el).each(function () {
                $(this).removeClass(cl.fieldError + ' ' + cl.fieldSuccess);
            });

            // unset busy
            this._busy(false);

            // make chainable
            return this;

        },

        /**
         * @method data([obj])
         * Builds/extends form handlers $.globals object, used
         * as global in handler's view.
         * @params {optional}{obj} obj
         * @return {obj}
         */
        data : function (obj) {

            // normalize
            obj = obj || null;

            // skip
            // if getter
            if (!obj) {
                return this.$.globals;
            }

            // extend, save
            _.extend(this.$.globals, {
                form : this.$
            });

            // extend data
            _.extend(this.$.globals, obj);

            // make chainable
            return this;

        },

        /**
         * @method error([field])
         * Set error state for specific field or form, states
         * set here skip/ignore validation logic.
         * @params {optional}{str} field
         * @return {*}
         */
        error : function (field, rule) {

            // normalize
            field = field || null;

            // get field errors
            var errors = this.$.errors || {};

            // create key from field name if it
            // does not exist yet
            if (typeof errors[field] === 'undefined') {
                errors[field] = [];
            }

            // push error, if not set yet
            if (errors[field].indexOf(rule) === -1) {
                errors[field].push(rule);
            }

            // reset errors, if no more entries
            if (_.isEmpty(errors)) {
                errors = null;
            }

            // save
            this.$.errors = errors;

            // set form state
            this.$.valid = !(typeof this.$.errors !== 'undefined' && !_.isEmpty(this.$.errors));

            // create results object
            var results = this._getResults();

            // update state classes
            this._setStateClasses(field, results);

            // make chainable
            return this;

        },

        /**
         * @method fetch([field])
         * Fetch specific field data or whole form data, return
         * field/value object
         * @params {optional}{str} field
         * @return {obj}
         */
        fetch : function (field) {

            // normalize
            field = field || null;

            // reset data
            var data = {};

            // extract data form form
            var dataForm = this.$.el.serializeArray();

            // loop through array of name/value pairs
            // normalize them on object key/value
            for (var i = 0; i < dataForm.length; i++) {

                // if field is not set, loop through all
                // form elements, save name/value pairs
                data[dataForm[i].name] = dataForm[i].value;

            }

            // save data
            this.$.data = data;

            // if field is set, return if field name
            // matches (reset data first);
            /*
             if (field && field === dataForm[i].name) {
             data = {};
             data[dataForm[i].name] = dataForm[i].value;
             return data;
             }
             */

            // exit
            return data;

        },

        /**
         * @method idle()
         * Releases form from busy state.
         * @return {*}
         */
        idle : function () {

            this._busy(false);

            // make chainable
            return this;

        },

        /**
         * @method listen()
         * Initiates form, field listeners.
         * @return {*}
         */
        init : function () {

            // set namespace
            var ns = this.$.selector + ' ';

            // get classes
            var cl = this.$.css;

            // set error markup
            this._setMarkup();

            // set field listeners
            this._setFieldListeners();

            // set form listeners
            this._setFormListener();

            // now ready
            this.$.state = 'idle';

            // enable submit button
            $(ns + '.' + cl.formSubmit + ' button').removeAttr('disabled');

            // make chainable
            return this;

        },

        /**
         * @method redirect([url])
         * Redirects user to given url, tries this.$.redirect
         * first, can be overwritten by incoming url, doesn't
         * do anything at all, if no url.
         * @params {optional}{str} url
         * @return {*}
         */
        redirect : function (url) {

            // extract return url
            url = url || this.$.redirect || null;

            // skip
            // if no url
            if (!url) {
                return this;
            }

            // redirect
            return window.location.href = url;

        },

        /**
         * @method render(obj, fn)
         * Creates form instance, renders bound view using
         * incoming object (as global in view), callback
         * if set.
         * @params {optional}{obj} obj
         * @params {optional}{fun} fn
         */
        render : function (obj, fn) {

            // normalize
            switch (arguments.length) {
                case 0 :
                    obj = null;
                    fn = util.noop;
                    break;
                case 1 :
                    if (_.isFunction(obj)) {
                        fn = obj;
                        obj = null;
                    } else {
                        obj = obj || null;
                        fn = util.noop;
                    }
                    break;
                default :
                    fn = fn || util.noop;
                    obj = obj || null;
                    break;
            }

            // preserve scope
            var self = this;

            // extend globals with incoming object
            // retrieves globals
            if (obj) {
                this.data(obj);
            }

            // render form template
            this.$.view.render(this.$.globals, function () {

                // initiate listeners
                self.init();

                // exit
                fn();

            });

        },

        /**
         * @method reset([field])
         * Resets specific field or complete form, form reset is done
         * by re-rendering the form view.
         * @params field
         * @return {*}
         */
        reset : function (field) {

            // normalize
            field = field || null;

            // not busy
            this.done();

            // reset el
            var el;

            if (!field) {
                el = $(this.$.selector + ' [name]');
            } else {
                el = $(this.$.selector + ' [name=' + field + ']');
            }

            // done text, textarea
            el.val('');

            // done checkbox, radios
            el.prop('checked', false);

            // done select
            el.prop('selectedIndex', 0);

            // make chainable
            return this;

        },

        /**
         * @method send(fn)
         * Replaces native form submission if set.
         * @params {required}{fun} fn
         * @return {*}
         */
        send : function (fn) {

            // set callback
            this.$.action = fn;

            // make chainable
            return this;

        },

        /**
         * @method success([field])
         * Sets specific field's or whole form's to `ok`, overwrites
         * existing state, does not validate, sets state wih brute
         * force
         * @params {optional}{str} field
         * @return {*}
         */
        success : function (field) {

            // normalize
            field = field || null;


            // ...


            // make chainable
            return this;

        },

        /**
         * @method test(field[,value])
         * Adds validation rules, rules are used bei this.validate()
         * to validate form fields, validation rule callbakcs have
         * to return true (is valid) or false (is invalid).
         * @params {required}{str|obj|arr} field
         * @params {optional}{fun} fn
         * @return {*}
         */
        test : function (field, arr) {

            // skip
            // incoming array, loop, call recursively
            if (_.isArray(field)) {
                for (var i = 0; i < field.length; i++) {
                    this.test(field[i]);
                }
                // exit
                return this;
            }

            // skip
            // incoming object, loop, call recursively
            if (_.isObject(field)) {
                for (var key in field) {
                    this.test(key, field[key]);
                }
                // exit
                return this;
            }

            // normalize
            arr = arr || null;

            // skip
            // if no incoming callback;
            if (!arr) {
                return this;
            }

            // save rules on rules object, field
            // might hold multiple rule callbacks
            // therefore use array
            if (typeof this.$.rules[field] === 'undefined') {

                // create new object key
                // save first callback as
                // new array (because this
                // filed might have various
                // validation rules)
                this.$.rules[field] = arr;

            } else {

                // add validation rule to
                // existing set of rules
                for (var i = 0; i < arr.length; i++) {
                    this.$.rules[field].push(arr[i]);
                }

            }

            // make chainable
            return this;

        },

        /**
         * @method text([obj])
         * Getter/Setter on form's text object.
         * @params {optional}{obj} obj
         * @return {*|obj}
         */
        text : function (obj) {

            // normalize
            obj = obj || null;

            if (obj) {
                _.extend(this.$.text, obj);
                return this;
            }

            return this.$.text;

        },

        /**
         * @method validate([field])
         * Validates specific field or all fields in form against
         * set validation rules, if no rules defined for a specific
         * filed, validation will return true (as in valid), if
         * validating all fields in form, method will return array
         * of errors if validations fail.
         * @params {optional}{str} field
         * @params {optional}{fun} fn
         */
        validate : function (field, fn) {

            // normalize
            switch (arguments.length) {
                case 1 :
                    if (_.isFunction(field)) {
                        fn = field;
                        field = null;
                    } else {
                        field = field || null;
                        fn = util.noop;
                    }
                    break;
                default :
                    field = field || null;
                    fn = fn || util.noop;
                    break;
            }

            // preserve scope
            var self = this;

            // reset results
            var results;

            /**
             * @method cb([err])
             * Validation calback function to normalize synchronous and
             * asynchronous validations
             */
            var cb = function (err, fn) {

                // get field errors
                var errors = self.$.errors || {};

                // if test fails, means: returns false save result on
                // errors object, if not saved yet
                if (err) {

                    // create key from field name if it
                    // does not exist yet
                    if (typeof errors[field] === 'undefined') {
                        errors[field] = [];
                    }

                    // push error, if not set yet
                    if (errors[field].indexOf(ruleMethodName) === -1) {
                        errors[field].push(ruleMethodName);
                    }

                } else {

                    // remove error key if valid
                    // delete errors[field];
                    if (errors !== null && typeof errors[field] !== 'undefined') {

                        // find rule entry
                        var index = errors[field].indexOf(ruleMethodName);

                        // remove error
                        errors[field].splice(index, 1);

                        // remove field (if no errors anymore)
                        if (errors[field].length === 0) {
                            delete errors[field];
                        }

                    }

                }

                // reset errors, if no more entries
                if (_.isEmpty(errors)) {
                    errors = null;
                }

                // save
                self.$.errors = errors;

                // set form state
                self.$.valid = !(typeof self.$.errors !== 'undefined' && !_.isEmpty(self.$.errors));

                // invoke callback
                fn();

            };

            // release busy
            self._busy(false);

            // skip
            // if no specific field, get all form fields,
            // call recursively, count, invoke callback
            // when done
            if (!field) {

                // convert into array
                var arr = [];
                for (var key in this.$.fields) {
                    arr.push(this.$.fields[key]);
                }

                var c = 0;
                var m = arr.length;

                // validate all fields
                for (var i = 0; i < arr.length; i++) {

                    // invoke validation
                    this.validate(arr[i].name, function () {

                        // update counter
                        c += 1;

                        // exit, when done
                        if (c >= m) {

                            // create results object
                            results = self._getResults();

                            // invoke callback
                            return fn(null, results);

                        }

                    });

                }

                return this;

            }

            // get field data
            var fieldValue = this.fetch(field)[field];

            // get field rules
            var fieldRules = this.$.rules[field] || [];

            // reset counters
            var m = fieldRules.length;
            var c = 0;

            // loop through all rules, invoke
            // validations
            var rule;
            var ruleMethod;
            var ruleMethodName;
            var ruleResult;
            for (var i = 0; i < fieldRules.length; i++) {

                // extract rule
                rule = fieldRules[i];

                // rule might be array or string, string
                // represents no arguments validation
                // method, array comes with additional
                // parameters
                if (_.isArray(rule)) {

                    // extract rule method name
                    ruleMethodName = rule[0];

                    // incoming might be a function as well,
                    // otherwise check validations collection
                    // methods
                    if (_.isFunction(rule[1])) {

                        // first index is method
                        ruleMethod = rule[1];

                    } else {

                        // first index is method
                        ruleMethod = self.$.validations[ruleMethodName];

                    }

                } else {

                    // incoming might be a function as well,
                    // otherwise check validations collection
                    // methods
                    if (_.isFunction(rule)) {

                        // set method
                        ruleMethod = rule;

                    } else {

                        // extract rule mthod name
                        ruleMethodName = rule;

                        // build empty rule for consistency
                        // in validation rule methods params
                        rule = [];

                        // string is method
                        ruleMethod = self.$.validations[ruleMethodName];

                    }

                }

                // invoke validation method
                // force rule to come in as a array
                ruleMethod.call(self, fieldValue, rule, function (err) {

                    // update counter
                    c += 1;

                    // invoke general validation callback
                    cb(err, function () {

                        if (c >= m) {

                            // create results object
                            results = self._getResults();

                            // update state classes
                            self._setStateClasses(field, results);

                            // exit
                            fn(null, results);

                        }

                    });

                });


            }

        },

        /**
         * @method validations(obj)
         * Adds validation methods to instance. You can use key
         * .rules() method to test against those methods.
         * @params {required}{obj} obj
         * @return {*}
         */
        validations : function (obj) {

            // save validation
            _.extend(this.$.validations, obj);

            // make chainable
            return this;

        },

        // SHORTCUTS

        /**
         * @shortcut .exec([field][,fn])
         * Shortcut to validate() method.
         */
        exec : function(field, fn) {
            return this.validate.apply(this, arguments);
        }

    });

});


define('src/Handler.Object',[
    './Base',
    './date',
    './Flow',
    './util',
    './validations'
], function (Base, date, flow, util, validations) {

    return Base.extend({

        /**
         * @method _ctor([obj])
         * Constructor of Handler.Object class.
         *
         * @params {optional}{obj} options
         * @return {*}
         */
        _ctor : function (options) {

            // reset class object
            this.$ = {
                body        : null,
                errors      : null,
                errors_all  : false,
                rules       : {},
                valid       : true,
                validations : validations
            };

            // extend with incoming options
            if (options) {
                _.extend(this.$, options);
            }

            // make chainable
            return this;

        },

        // PRIVATE

        /**
         * @method _getResults()
         * Returns pre-formatted results object.
         *
         * @return {obj}
         */
        _getResults : function () {

            // build results object
            return {
                body   : this.$.body,
                errors : this.$.errors,
                valid  : this.$.valid
            };

        },

        // PUBLIC

        /**
         * @method data(obj)
         * Sets data to be validated.
         * @params {required}{obj} obj
         * @return {*}
         */
        data : function (obj) {

            // normalize
            obj = obj || {};

            // set incoming data object
            this.set('body', obj);

            // make chainable
            return this;

        },

        /**
         * @method test(field[,value])
         * Adds validation rules, rules are used bei this.validate()
         * to validate object keys, validation rule callbakcs have
         * to return true (is valid) or false (is invalid).
         *
         * @params {required}{str|obj|arr} field
         * @params {optional}{fun} fn
         * @return {*}
         *
         * @sample
         * // add test rules to handler object, use strings to assign
         * // validation methods, use array to assign validation method
         * // and additional values during validation.
         * handler.test({
         *      email   : ['isRequired', 'isEmail'],
         *      name    : ['isRequired', ['isMinLength', 2]]
         * });
         *
         */
        test : function (key, arr) {

            // skip
            // if incoming is array, loop, call recursively
            if (_.isArray(key)) {
                for (var i = 0; i < key.length; i++) {
                    this.test(key[i]);
                }
                // exit
                return this;
            }

            // skip
            // incoming is object, loop, call recursively
            if (_.isObject(key)) {
                for (var i in key) {
                    this.test(i, key[i]);
                }
                // exit
                return this;
            }

            // normalize
            arr = arr || null;

            // skip
            // if no incoming callback
            if (!arr) {
                return this;
            }

            // save rules on rules object, field
            // might hold multiple rule callbacks
            // therefore use array
            if (typeof this.$.rules[key] === 'undefined') {

                // create new object key
                // save first callback as
                // new array (because this
                // filed might have various
                // validation rules)
                this.$.rules[key] = arr;

            } else {

                // add validation rule to
                // existing set of rules
                for (var i = 0; i < arr.length; i++) {
                    this.$.rules[key].push(arr[i]);
                }

            }

            // make chainable
            return this;

        },

        /**
         * @method validate([key][,fn])
         * Validates specific key or all keys of object against
         * set validation rules, if no rules defined for a specific
         * key, validation will return true (as valid), if validating
         * all keys in object, method will return array of errors if
         * validations fail.
         *
         * @params {optional}{str} key
         * @params {optional}{fun} fn
         *
         * @sample
         * // validate all keys in object against ruleset
         * // specific to the body key
         * handler.validate(function(err, body, status, code) {
         *      // handle validation results
         * });
         *
         * // validate single key in object against ruleset
         * // specific to the body key
         * handler.validate(function(err, body, status, code) {
         *      // handle validation results
         * });
         *
         */
        validate : function (key, fn) {

            // normalize
            switch (arguments.length) {
                case 1 :
                    if (_.isFunction(key)) {
                        fn = key;
                        key = null;
                    } else {
                        key = key || null;
                        fn = util.noop;
                    }
                    break;
                default :
                    key = key || null;
                    fn = fn || util.noop;
                    break;
            }

            // preserve scope
            var self = this;

            // reset results
            var results;

            /**
             * @method cb([err])
             * Validation calback function to normalize
             * synchronous and asynchronous validations
             */
            var cb = function (err, fn) {

                // get field errors
                var errors = self.$.errors || {};

                // if test fails, means: returns false
                // save result on errors object, if not
                // saved yet
                if (err) {

                    // create key from field name if it
                    // does not exist yet
                    if (typeof errors[key] === 'undefined') {
                        errors[key] = [];
                    }

                    // check whether or not already saved
                    var index = -1;
                    for (var i = 0; i < errors[key].length; i++) {
                        if (errors[key][i].field === key) {
                            index = i;
                        }
                    }

                    // save, if not saved yet
                    if (index === -1) {
                        errors[key].push({
                            field : key,
                            name  : ruleMethodName,
                            rule  : rule,
                            value : self.$.body[key]
                        });
                    }

                } else {

                    // remove error key if valid
                    if (errors && typeof errors[key] !== 'undefined') {

                        // check whether or not we have a error
                        // message already, if so, we want to
                        // delete it
                        var index = -1;
                        for (var i = 0; i < errors[key].length; i++) {
                            if (errors[key][i].field === key) {
                                index = i;
                            }
                        }

                        // remove, if still here
                        if (index > -1) {
                            errors[key].splice(index, 1);
                        }

                        // remove key if no errors left
                        if (errors[key].length === 0) {
                            delete errors[key];
                        }

                    }

                }

                // reset errors, if no more entries
                if (_.isEmpty(errors)) {
                    errors = null;
                }

                // save
                self.$.errors = errors;

                // set form state
                self.$.valid = !(typeof self.$.errors !== 'undefined' && !_.isEmpty(self.$.errors));

                // invoke callback
                fn();

            };

            // skip
            // if no specific key, get all object keys,
            // call recursively, count, invoke callback
            // when done
            if (!key) {

                // convert into array
                var arr = [];
                for (var i in this.$.body) {
                    arr.push(i);
                }

                var c = 0;
                var m = arr.length;

                // validate all keys
                for (var i = 0; i < arr.length; i++) {

                    // invoke validation
                    this.validate(arr[i], function () {

                        // update counter
                        c += 1;

                        // exit, when done
                        if (c >= m) {

                            // create results object
                            results = self._getResults();

                            // [-] exit
                            if (!results.valid) {
                                return fn(true, results, 409, 'ERROR_VALIDATION');
                            }

                            // invoke callback
                            return fn(null, results, 200, 'OK');

                        }

                    });

                }

                return this;

            }

            // get field data
            var value = this.$.body[key];

            // get field rules
            var rules = this.$.rules[key] || ['isNoop'];

            // reset counters
            var m = rules.length;
            var c = 0;

            // loop through all rules, invoke
            // validations
            var rule;
            var ruleMethod;
            var ruleMethodName;
            var ruleResult;
            for (var i = 0; i < rules.length; i++) {

                // extract rule
                rule = rules[i];

                // rule might be array or string, string
                // represents no arguments validation
                // method, array comes with additional
                // parameters
                if (_.isArray(rule)) {

                    // extract rule method name
                    ruleMethodName = rule[0];

                    // incoming might be a function as well,
                    // otherwise check validations collection
                    // methods
                    if (_.isFunction(rule[1])) {

                        // first index is method
                        ruleMethod = rule[1];

                    } else {

                        // first index is method
                        ruleMethod = self.$.validations[ruleMethodName];

                    }

                } else {

                    // incoming might be a function as well,
                    // otherwise check validations collection
                    // methods
                    if (_.isFunction(rule)) {

                        // set method
                        ruleMethod = rule;

                    } else {

                        // extract rule mthod name
                        ruleMethodName = rule;

                        // build empty rule for consistency
                        // in validation rule methods params
                        rule = [];

                        // string is method
                        ruleMethod = self.$.validations[ruleMethodName];

                    }

                }

                // invoke validation method
                // force rule to come in as a array
                ruleMethod.call(self, value, rule, function (err) {

                    // update counter
                    c += 1;

                    // invoke general validation callback
                    cb(err, function () {

                        if (c >= m) {

                            // create results object
                            results = self._getResults();

                            // [-] exit
                            if (!results.valid) {
                                return fn(true, results, 409, 'ERROR_VALIDATION');
                            }

                            // [+] exit
                            fn(null, results, 200);

                        }

                    });

                });

            }

        },

        // SHORTCUTS

        /**
         * @shortcut .exec([key][,fn])
         * Shortcut to validate() method.
         */
        exec : function (key, fn) {
            return this.validate.apply(this, arguments);
        }

    });

});


define('src/I18n',[
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
                region   : null,
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


define('src/log',[],function () {

    // lightweight wrapper for console.log() to avoid all kinds
    // of FF problems if console.log() is somewhere left in prd
    // code
    window.log = function () {

        if (this.console) {
            console.log.apply(this.console, arguments);
        }

    };

    window.trc = window.logtrace = function () {

        if (this.console) {
            console.log.apply(this.console, arguments);
            console.log(Error().stack.replace('Error', '---').replace('at Error (native)', 'Stack'));
        }

    };

    return {
        log      : window.log,
        logtrace : window.logtrace
    };

});


define('src/Model',[
    './Base'
], function (Base) {

    return Base.extend({

        // --- @PRIVATE

        /**
         * ctor, Model
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            this.$ = {
                data : null
            };

            if (options) {
                _.extend(this.$, options);
            }

            return this;

        },

        data : function () {
            return this.get('data');
        }

    });

});


define('src/require',[
    './singleton'
],function (singleton) {

    // PRIVATE

    /**
     * @method _readymodules(modules, modulesOrder[,fn])
     * uses ordered array of key names to return a ordered
     * array of module object, invokes callback when done
     * @params {obj} modules
     * @params {arr} modulesOrder
     * @params {fun} fn
     */
    var _readymodules = function (modulesOrder, fn) {

        // reset array
        var arr = [];
        var obj = {};

        // loop through ordered names, replace names
        // with module objects, therefore you kept
        // order of modules
        for (var i = 0; i < modulesOrder.length; i++) {

            // save in order
            arr.push(modulesOrder[i].module);

            // save with key
            obj[modulesOrder[i].name] = modulesOrder[i].module;

        }

        // exit
        if (fn) {
            return fn(null, obj, arr);
        }

    };

    // PUBLIC

    /**
     * @method modules(paths[,fn])
     * abstracts require functionality, always async, even if
     * module is already loaded, invokes callback when done
     * @params {arr} paths
     * @params {fun} fn
     */
    var modules = function (paths, fn) {

        var arr;
        var str;

        var m = paths.length;
        var c = 0;

        // reset modules required
        var path;
        var modules = {};
        var modulesOrder = [];
        var modulesNames = [];

        // build module key name based onb file name
        // ex: js/views/view.header -> viewHeader
        for (var i = 0; i < paths.length; i++) {

            // closure
            (function (paths, i) {

                // save module path as name
                modulesNames[i] = paths[i];

                if (typeof server !== 'undefined') {

                    // extract server
                    var app = singleton.server;

                    // create path
                    path = app.get('dir') + app.get('server') + '/' + paths[i];

                    // everythings synchronous on the server-side,
                    // just push required modules
                    modulesOrder[i] = {
                        name   : modulesNames[i],
                        module : require(path)
                    };

                    // exit
                    c += 1;
                    if (c >= m) {
                        _readymodules(modulesOrder, fn);
                    }

                } else {

                    // require modules, try sync first, might be loaded
                    // somewhere else, if that fails, do the async way
                    // require path
                    require([paths[i]], function (module) {

                        // add module to modules object (with correct name)
                        // modules[str] = module;

                        // save modules order
                        modulesOrder[i] = {
                            name   : modulesNames[i],
                            module : module
                        };

                        // exit
                        c += 1;
                        if (c >= m) {
                            _readymodules(modulesOrder, fn);
                        }

                    });

                }

            })(paths, i);

        }

    };

    // EXPORTS

    return modules;

});


define('src/Route',[
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


define('src/Router',[
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
define('frog',[

    'src/Api',
    'src/Base',
    'src/Collection',
    'src/Component',
    'src/date',
    'src/Email',
    'src/Events',
    'src/Events.Singleton',
    'src/Facebook',
    'src/Flow',
    'src/Handler.Form',
    'src/Handler.Object',
    'src/I18n',
    'src/log',
    'src/Model',
    'src/require',
    'src/Router',
    'src/singleton',
    'src/util',
    'src/validations',
    'src/View',
    'src/xhr'

], function (Api, Base, Collection, Component, date, Email, Events, events, Facebook, Flow, HandlerForm, HandlerObject, I18n, log, Model, require, Router, singleton, util, validations, View, xhr) {

    var frog = {

        Api         : Api,
        Base        : Base,
        Collection  : Collection,
        Component   : Component,
        date        : date,
        Email       : Email,
        Events      : Events,
        events      : events,
        Facebook    : Facebook,
        Flow        : Flow,
        Handler     : {
            Form   : HandlerForm,
            Object : HandlerObject
        },
        I18n        : I18n,
        log         : log,
        Model       : Model,
        require     : require,
        Router      : Router,
        singleton   : singleton,
        util        : util,
        validations : validations,
        View        : View,
        xhr         : xhr

    };

    return window.frog = frog;

});
