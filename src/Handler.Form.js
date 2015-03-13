if (typeof define !== 'function') {
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

        // PRIVATE

        /**
         * ctor, Form
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            this.$ = {
                action              : true,
                css                 : {
                    field              : 'field',
                    fieldError         : 'field-error',
                    fieldErrorMessage  : 'field-error-message',
                    fieldErrorFlag     : 'field-error-flag',
                    fieldSuccess       : 'field-success',
                    fieldSuccessFlag   : 'field-success-flag',
                    form               : 'form',
                    formBusy           : 'busy',
                    formCancel         : 'cancel',
                    formError          : 'error',
                    formErrorMessage   : 'error-message',
                    formSuccess        : 'success',
                    formSuccessMessage : 'success-message',
                    formNative         : 'native',
                    formSubmit         : 'submit'
                },
                data                : {},
                el                  : null,
                endpoint            : '/',
                errors              : null,
                errors_all          : false,
                fields              : {},
                globals             : {
                    date : date,
                    util : util
                },
                listeners_fields    : false,
                listeners_forms     : false,
                markup              : {
                    error_field : '',
                    error_form  : ''
                },
                method              : 'POST',
                namespace           : null, // ??? deprecated
                prefix              : '',
                rules               : {},
                selector            : 'form',
                state               : 'loaded', // idle, error, ok
                text                : {
                    form            : '',
                    form_error      : '',
                    default_error   : '',
                    default_success : ''
                },
                text_prefix_error   : '',
                text_prefix_success : '',
                valid               : true,
                validations         : validations,
                view                : null
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

            // add success container to form
            this.$.el.prepend(this.$.markup.success_form);

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
                errorText = this.$.text[this.$.text_prefix_error + error];

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

                // first error message
                return arr[0];

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

            // submit form, on enter
            $(document).on('keypress', function (evt) {

                // check if incoming key is enter (= keycode 13)
                if (evt.charCode == 13) {

                    // extract active element
                    var el = $($(document.activeElement)[0]);

                    // check if active element is part of form
                    // if so, force submission on enter click
                    if (el.parent(self.$.selector)) {

                        // avoid conflicting events
                        evt.preventDefault();

                        // submit form
                        self._submit();

                    }

                }
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

            // normalize
            this.$.text.form_error = typeof this.$.text.form_error === 'undefined' ? '' : this.$.text.form_error;
            this.$.text.default_error = typeof this.$.text.default_error === 'undefined' ? '' : this.$.text.default_error;

            // add markup for errors in form and field
            _.extend(this.$.markup, {
                error_field  : '<div class="' + cl.fieldErrorMessage + '"></div><div class="' + cl.fieldErrorFlag + '">' + this.$.text.default_error + '</div><div class="' + cl.fieldSuccessFlag + '">' + this.$.text.default_success + '</div>',
                error_form   : '<div class="' + cl.formErrorMessage + '"></div>',
                success_form : '<div class="' + cl.formSuccessMessage + '"></div>'
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
         * @method cb(err[,fn])
         * Validation callback that collects error messages,
         * normalizes synchr., asynchr. validation methods.
         * @params {required}{bol} err
         * @params {optional}{fun} fn
         */
        _collect : function (err, field, ruleMethodName, key, fn) {

            // normalize
            fn = fn || util.noop;

            // preserve scope
            var self = this;

            // get field errors
            var errors = self.$.errors || {};

            // create key from field name if it
            // does not exist yet
            if (typeof errors[field] === 'undefined') {
                errors[field] = [];
            }

            // if test fails, means: returns false save result on
            // errors object, if not saved yet
            if (err) {

                // push error, if not set yet
                if (errors[field].indexOf(ruleMethodName) === -1) {

                    // deprecated
                    // pushing leads to changes in result
                    // order, not always but sometimes
                    // errors[field].push(ruleMethodName);

                    // use ruleset key to force correct
                    // order
                    errors[field][key] = ruleMethodName;

                }

            } else {

                // remove error key if valid
                // delete errors[field];
                if (typeof errors[field] !== 'undefined') {

                    // find rule entry
                    var index = errors[field].indexOf(ruleMethodName);

                    // remove error (if found earlier)
                    if (index > -1) {

                        // deprecated
                        // removing leads to changes in result
                        // order, not always but sometimes
                        // errors[field].splice(index, 1);

                        // reset ruleset key
                        errors[field][index] = null;

                    }

                }

            }

            // clean up field errors
            var arr = [];
            for (var i = 0; i < errors[field].length; i++) {

                // not null, not undefined
                if (errors[field][i]) {
                    arr.push(errors[field][i]);
                }

            }

            // save clean error array
            errors[field] = arr;

            // remove field (if no errors anymore)
            if (errors[field].length === 0) {
                delete errors[field];
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
         * @method rules(field[,value])
         * Adds validation rules, rules are used bei this.validate()
         * to validate form fields, validation rule callbakcs have
         * to return true (is valid) or false (is invalid).
         * @params {required}{str|obj|arr} field
         * @params {optional}{fun} fn
         * @return {*}
         */
        rules : function (field, arr) {

            // skip
            // incoming array, loop, call recursively
            if (_.isArray(field)) {
                for (var i = 0; i < field.length; i++) {
                    this.rules(field[i]);
                }
                // exit
                return this;
            }

            // skip
            // incoming object, loop, call recursively
            if (_.isObject(field)) {
                for (var key in field) {
                    this.rules(key, field[key]);
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
         * @method
         * Sets form into error, success or neutral state.
         * @params {optional}{str} state
         * @return {*}
         */
        state : function (state, message) {

            // extract form
            var el = $(this.$.selector);

            switch (state) {

                // set error state
                case 'error' :

                    // set classes
                    el.removeClass(this.$.css.formSuccess);
                    el.addClass(this.$.css.formError);

                    // reset message
                    $('.' + this.$.css.formSuccessMessage, el).html('');

                    // set message
                    if (message) {
                        $('.' + this.$.css.formErrorMessage, el).html(message);
                    }

                    break;

                // set success state
                case 'success' :

                    // set classes
                    el.removeClass(this.$.css.formError);
                    el.addClass(this.$.css.formSuccess);

                    console.log(this.$.css);

                    // reset message
                    $('.' + this.$.css.formErrorMessage, el).html('');

                    // set message
                    if (message) {
                        $('.' + this.$.css.formSuccessMessage, el).html(message);
                    }

                    break;

                // remove all states
                default :

                    // set classes
                    el.removeClass(this.$.css.formError);
                    el.removeClass(this.$.css.formSuccess);

                    // reset message
                    $('.' + this.$.css.formErrorMessage, el).html('');
                    $('.' + this.$.css.formSuccessMessage, el).html('');

                    break;

            }

            //make chainable
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

            // release errors
            self.$.errors = {};

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
                    self._collect(err, field, ruleMethodName, i, function () {

                        if (c >= m) {

                            // add data
                            _.extend(self.$.fields[field], {
                                value : fieldValue
                            });

                            // create results object
                            results = self._getResults(err, field, fieldValue);

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
        exec : function (field, fn) {
            return this.validate.apply(this, arguments);
        }

    });

});