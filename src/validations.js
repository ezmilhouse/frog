if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
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