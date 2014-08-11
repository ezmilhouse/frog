if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    './Base',
    './Flow',
    './util',
    './validations'
], function (Base, flow, util, validations) {

    return Base.extend({

        // PRIVATE

        /**
         * ctor, Form
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            this.$ = {
                action      : true,
                css         : {
                    field             : 'frog-field',
                    fieldError        : 'frog-field-error',
                    fieldErrorMessage : 'frog-field-error-message',
                    fieldSuccess      : 'frog-field-success',
                    form              : 'frog-form',
                    formBusy          : 'frog-form-busy',
                    formCancel        : 'frog-form-cancel',
                    formError         : 'frog-form-error',
                    formErrorMessage  : 'frog-form-error-message',
                    formNative        : 'frog-form-native',
                    formSubmit        : 'frog-form-submit'
                },
                data        : {},
                el          : null,
                endpoint    : '/',
                errors      : null,
                fields      : {},
                globals     : {},
                method      : 'POST',
                namespace   : null,
                rules       : {},
                selector    : 'form',
                state       : 'idle', // error, ok
                text        : {},
                valid       : true,
                validations : validations,
                view        : null
            };

            if (options) {
                _.extend(this.$, options);
            }

            // get form
            this._getForm();

            // get fields
            this._getFields();

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

            // loop through all elements that have a name
            // attribute
            $('[name]').each(function () {

                // extract element
                var el = $(this);

                // extract name
                var name = el.attr('name');

                // add field object
                self.$.fields[name] = {
                    el    : el,
                    name  : name,
                    valid : null,
                    tag   : el.prop('tagName').toLowerCase(),
                    type  : (el.attr('type')) ? el.attr('type') : null,
                    value : null
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
            var results = {
                body   : this.$.data,
                fields : this.$.fields,
                errors : this.$.errors,
                valid  : this.$.valid
            };

            return results;

        },

        /**
         * @method _setErrorMessage(field)
         * Extracts error messages form's text object based on
         * error type and field name.
         * @params {required}{str} field
         * @return {str}
         */
        _setErrorMessage : function (field) {

            // extract errors
            var errors = this.$.errors[field];

            // extract specific last error
            var error = errors[errors.length - 1];

            // extract rules
            var rules = this.$.rules[field];

            // extract specific rule based on
            // extracted error
            var rule;
            for (var i = 0; i < rules.length; i++) {
                if (_.isArray(rules[i])) {
                    if (rules[i][0] === error) {
                        rule = rules[i];
                    }
                } else {
                    if (rules[i] === error) {
                        rule = rules[i];
                    }
                }
            }

            // extract error messages, replace placeholder
            // in message string if rule was array
            var str;
            if (_.isArray(rule)) {
                str = this.$.text.errors[rule[0]];
                for (var i = 1; i < rule.length; i++) {
                    str = str.replace('[' + i + ']', rule[i]);
                }
            } else {
                str = this.$.text.errors[rule];
            }

            return str;

        },

        /**
         * @method _setFieldListeners()
         * Sets DOM event listeners for field elements (based on
         * tag and if input - based on input type).
         */
        _setFieldListeners : function (field, tag, type) {

            // preserve scope
            var self = this;

            // set namespace
            var ns = this.$.selector + ' ';

            /**
             * @method _validation(evt, fields, el)
             * Invokes validation and resulting change of states.
             * @params {required}{obj} evt
             * @params {required}{str} field
             */
            var _validation = function (evt, field) {

                // prevent native
                evt.preventDefault();

                // validate form field
                self.validate(field);

            };

            // different listeners based on tags and
            // (if input) based on types
            switch (tag) {
                case 'select' :
                    $(document).on('change', ns + '[name=' + field + ']', function (evt) {
                        _validation(evt, field);
                    });
                    break;
                default :
                    switch (type) {
                        case 'checkbox' || 'radio' :
                            $(document).on('mousedown', ns + '[name=' + field + ']', function (evt) {
                                _validation(evt, field);
                            });
                            break;
                        default :
                            $(document).on('blur', ns + '[name=' + field + ']', function (evt) {
                                _validation(evt, field);
                            });
                            break;
                    }
                    break;
            }

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
            var parent = el.parent('.' + cl.field);

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
                $('.' + cl.formErrorMessage, this.$.el).html(this.$.text.errors.form);

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
            if (this.$.state === 'busy') {
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

                // no callback set, action option is false
                return;

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
            obj = obj || {};

            // extend, save
            _.extend(this.$.globals, {
                form : this.$,
                text : this.$.text
            });

            // check if data key already exists
            if (typeof this.$.globals.data === 'undefined') {
                // create key
                this.$.globals.data = obj;
            } else {
                // extend data
                _.extend(this.$.globals.data, obj);
            }

            // exit
            return this.$.globals;

        },

        /**
         * @method error([field])
         * Set error state for specific field or form, states
         * set here skip/ignore validation logic.
         * @params {optional}{str} field
         * @return {*}
         */
        error : function (field) {

            // normalize
            field = field || null;


            // ...


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
                    obj = {};
                    fn = util.noop;
                    break;
                case 1 :
                    if (_._isFunction(obj)) {
                        fn = obj;
                        obj = {};
                    }
                    break;
                default :
                    fn = fn || util.noop;
                    obj = obj || {};
                    break;
            }

            // preserve scope
            var self = this;

            // extend globals with incoming object
            // retrieves globals
            var globals = this.data(obj);

            // render form template
            this.$.view.render(globals, function () {

                // get form
                var form = self._getForm();

                // get fields
                var fields = self._getFields();

                // set listeners
                for (var key in fields) {
                    self._setFieldListeners(key, fields[key].tag, fields[key].type);
                }

                // set form listeners
                self._setFormListener();

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

            // force re-rendering form template
            // to reset it, necessary to avoid
            // checkbox, radio button or select
            // hassle
            if (!field) {
                return this.$.view.render(this.data());
            }

            // extract element
            var el = $(this.$.selector + ' [name=' + field + ']');

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

            // get field errors
            var errors = this.$.errors || {};

            // get field data
            var fieldValue = this.fetch(field)[field];

            // get field rules
            var fieldRules = this.$.rules[field];

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

                    // extract rule mthod name
                    ruleMethodName = rule[0];

                    // first index is method
                    ruleMethod = self.$.validations[ruleMethodName];

                    // add field to rule array
                    if (rule[rule.length - 1] !== field) {
                        rule.push('field');
                    }

                    // invoke validation method
                    ruleResult = ruleMethod.call(self, fieldValue, rule);

                } else {

                    // extract rule mthod name
                    ruleMethodName = rule;

                    // string is method
                    ruleMethod = self.$.validations[ruleMethodName];

                    // invoke validation method
                    ruleResult = ruleMethod.call(self, fieldValue, [field]);

                }

                // if test fails, means: returns false save result on
                // errors object, if not saved yet
                if (!ruleResult) {

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
                this.$.errors = errors;

            }

            // set form state
            this.$.valid = !(typeof this.$.errors !== 'undefined' && !_.isEmpty(this.$.errors));

            // create results object
            results = this._getResults();

            // update state classes
            this._setStateClasses(field, results);

            // exit
            fn(null, results);

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

        }

    });

});