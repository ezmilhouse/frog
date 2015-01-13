if (typeof define !== 'function') {
    var _ = require('underscore');
    var define = require('amdefine')(module);
}

define([
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
                data        : null,
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
                validated : this.$.data,
                errors    : this.$.errors,
                valid     : this.$.valid
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
            this.set('data', obj);

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
         * // specific to the data key
         * handler.validate(function(err, data, status, code) {
         *      // handle validation results
         * });
         *
         * // validate single key in object against ruleset
         * // specific to the data key
         * handler.validate(function(err, data, status, code) {
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
                            rule  : ruleMethodName,
                            value : self.$.data[key] || null
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
                for (var i in this.$.rules) {
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
                                return fn(true, results, 409, 'CONFLICT');
                            }

                            // invoke callback
                            return fn(null, results, 200, 'OK');

                        }

                    });

                }

                return this;

            }

            // get field data
            var value = this.$.data[key];

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
                                return fn(true, results, 409, 'CONFLICT');
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