if (typeof define !== 'function') {
    var _ = require('underscore');
    var crypto = require('crypto');
    var define = require('amdefine')(module);
    var moment = require('moment');
    var numeral = require('numeral');
}

define([
    'moment',
    'numeral'
], function (moment, numeral) {

    var util = {

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
             * @method rand()
             * Create random 256bit string, mostly used for secrets.
             * @return {str}
             */
            rand : function () {
                return crypto.randomBytes(256).toString('hex');
            },

            /**
             * @method sha1(str)
             * Hashing incoming string using sha1.
             * @params {required}{str} str
             * @return {str}
             */
            sha1 : function (str) {
                return crypto.createHash('sha1').update(str).digest('hex');
            },

            /**
             * @method uid()
             * Create universally unique identifier.
             * @return {str}
             */
            uuid : function () {

                // calc random number
                var s4 = function () {
                    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
                };

                // concat random numbers
                var go = function () {
                    return (s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4());
                };

                return go();

            }

        },

        /**
         * @object moment
         * Proxy to moment library.
         */
        moment : moment,

        /**
         * @method redirect(url)
         * Invokes client-side redirection using window.replace.
         * It is better than using window.location.href =, because
         * replace() does not put the originating page in the
         * session history, meaning the user won't get stuck in a
         * never-ending back-button fiasco.
         * @params {required}{str} url
         */
        redirect : function(url) {
            return window.location.replace(url);
        },

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
            return val.replace(/^\s+|\s+$/gm, '');

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

        /**
         * @object localStorage
         * Wrapper to set/get js objects in local storage.
         * Local storage implementation natively supports
         * only key/value pairs with values being strings.
         */
        localStorage : {

            /**
             * @method setObject(key, value)
             * Sets item value to object, stringifies first.
             */
            setObject : function(key, value) {

                // key/value
                if (typeof value !== 'undefined') {
                    return localStorage.setItem(key, JSON.stringify(value));
                }

                // object
                for (var i in key) {
                    localStorage.setItem(i, JSON.stringify(key[i]));
                }

            },
            /**
             * @method getObject(key)
             * Gets item value, parses first.
             */
            getObject : function(key) {

                // key
                if (typeof key !== 'undefined') {
                    return localStorage.getItem(key) && JSON.parse(localStorage.getItem(key));
                }

                // all
                var obj = {};
                for (var i = 0; i < localStorage.length; i++){
                    obj[localStorage.key(i)] = localStorage.getItem(localStorage.key(i));
                }

                return obj;

            }
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
                if ((options = arguments[i]) != null) {

                    // extend the base object
                    for (name in options) {

                        src = target[name];
                        copy = options[name];

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
                            target[name] = util.deepextend(deep, clone, copy);


                        } else if (copy !== undefined) {

                            // don't bring in undefined values
                            target[name] = copy;

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
         * @method isObjectId(str)
         * Checks if incoming string matches mongo object id (formally).
         */
        isObjectId : function (str) {

            console.log('isObjectId', typeof str);

            // skip
            if (!str) {
                return false;
            }

            // check against object id regex
            return str.match(/^[0-9a-fA-F]{24}$/);

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
                process           : function (process, port, debug) {
                    var str = '';
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] Process (PID): ' + process.pid;
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] Node.js: ' + process.versions.node;
                    str += '\n';
                    if (debug) {
                        str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] Running on port ' + port + ', debug on port ' + process.debugPort;
                    } else {
                        str += moment().format('D MMM HH:mm:ss') + ' - ' + '[node] Running on port ' + port;
                    }
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
            redis : {
                down : function () {
                    var str = '';
                    str += '\n';
                    str += moment().format('D MMM HH:mm:ss') + ' - ' + '[redis] lost session, no connection, service down';
                    console.log(str);
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
         * TODO: DEPRECATED
         * TODO: SHOULD BE ON APPLICATION LEVEL
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