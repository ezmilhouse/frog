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
         * @method ifRange(mixed, arr)
         * Is optional, if set validates against isRange().
         * Otherwise returns true.
         * @params {required}{str} mixed
         * @params {required}{arr} arr
         * @return {bol}
         * @sample
         *
         *      // use as string
         *      form.rules([['ifRange', 0, 10]]);
         *
         */
        ifRange : function(mixed, arr) {
            if (mixed && mixed !== '') {
                return validations.isRange(mixed, arr);
            }
            return true;
        },

        /**
         * @method isCreditCard(mixed)
         * Validates against credit card format.
         * @params {required}{str} mixed
         * @return {bol}
         * @sample
         *
         *      // use as string
         *      form.rules(['isCreditCard']);
         *
         */
        isCreditCard : function (mixed, arr) {

            // accept only spaces, digits and dashes
            if (/[^0-9 \-]+/.test(mixed)) {
                return false;
            }
            var nCheck = 0,
                nDigit = 0,
                bEven = false,
                n, cDigit;

            mixed = mixed.replace(/\D/g, "");

            // basing min and max length on
            // http://developer.ean.com/general_info/Valid_Credit_Card_Types
            if (mixed.length < 13 || mixed.length > 19) {
                return false;
            }

            for (n = mixed.length - 1; n >= 0; n--) {
                cDigit = mixed.charAt(n);
                nDigit = parseInt(cDigit, 10);
                if (bEven) {
                    if (( nDigit *= 2 ) > 9) {
                        nDigit -= 9;
                    }
                }
                nCheck += nDigit;
                bEven = !bEven;
            }

            return ( nCheck % 10 ) === 0;

        },

        /**
         * @method isEmail(mixed)
         * Validates against email format.
         * @params {required}{str} mixed
         * @return {bol}
         * @sample
         *
         *      // use as string
         *      form.rules(['isEmail']);
         *
         */
        isEmail : function (mixed) {

            // set regex
            // http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
            var rex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

            // get results
            return rex.test(mixed);

        },

        /**
         * @method isEnum(mixed, arr)
         * Validates against list enumerated values.
         * @params {required}{str} mixed
         * @return {bol}
         * @sample
         *
         *      // use as array (in array of rules)
         *      // first element is rule name, with
         *      // [1] starts the enumerated list
         *      form.rules([['isEnum', 'male', 'female']]);
         *
         */
        isEnum : function (mixed, arr) {

            // [+] valid
            // in array
            if (arr.indexOf(mixed) > -1) {
                return true;
            }

            // [-] invalid
            return false;

        },

        /**
         * @method isEqualTo(mixed, match)
         * Checks if incoming is matches given.
         * @params {required}{str|int} mixed
         * @params {required}{str|int} match
         * @return {bol}
         * @sample
         *
         *      // use as array
         *      form.rules([['isEqualTo', 'match me']]);
         *
         */
        isEqualTo : function (mixed, arr) {
            return mixed === arr[1];
        },

        /**
         * @method isInList(mixed, el)
         * Checks if incoming value is also in list
         * of select options.
         * @params {required}{str} mixed
         * @params {required}{obj} el
         * @return {bol}
         */
        isInList : function (mixed, arr) {

            // fetch element
            var el = $('[name=' + arr[arr.length - 1] + ']', this.$.el);

            // reset valid
            var valid = false;

            // loop through select options,
            // checks if incoming value is
            // in select option list, return
            // true if matched
            var value;
            $('option', el).each(function () {
                value = $(this).val();
                if (value !== '' && value === mixed) {
                    valid = true;
                }
            });

            return valid;

        },

        /**
         * @method isMax(mixed, max)
         * Checks if number is <= max.
         * @params {required}{str} mixed
         * @params {required}{int} max
         * @return {bol}
         * @sample
         *
         *      // use as array
         *      form.rules([['isMax', 10]]);
         *
         */
        isMax : function (mixed, arr) {
            mixed = parseInt(mixed);
            return mixed <= arr[1];
        },

        /**
         * @method isMax(mixed, max)
         * Checks if string length is <= max.
         * @params {required}{str} mixed
         * @params {required}{int} max
         * @return {bol}
         * @sample
         *
         *      // use as array
         *      form.rules([['isMaxLength', 10]]);
         *
         */
        isMaxLength : function (mixed, arr) {
            return mixed.length <= arr[1];
        },

        /**
         * @method isMin(mixed, max)
         * Checks if number >= min.
         * @params {required}{str} mixed
         * @params {required}{int} min
         * @return {bol}
         * @sample
         *
         *      // use as array
         *      form.rules([['isMin', 5]]);
         *
         */
        isMin : function (mixed, arr) {
            mixed = parseInt(mixed);
            return mixed >= arr[1];
        },

        /**
         * @method isMin(mixed, max)
         * Checks if string length is >= min.
         * @params {required}{str} mixed
         * @params {required}{int} min
         * @return {bol}
         * @sample
         *
         *      // use as array
         *      form.rules([['isMinLength', 5]]);
         *
         */
        isMinLength : function (mixed, arr) {
            return mixed.length >= arr[1];
        },

        /**
         * @method isRange(mixed, min, max)
         * Checks if number is between min and max.
         * @params {required}{in} mixed
         * @params {required}{int} min
         * @params {required}{int} max
         * @return {bol}
         * @sample
         *
         *      // use as array
         *      form.rules([['isRange', 1, 10]]);
         *
         */
        isRange : function (mixed, arr) {

            console.log(mixed, arr);

            mixed = parseInt(mixed);
            return mixed >= parseInt(arr[1]) && mixed <= parseInt(arr[2]);
        },

        /**
         * @method isRangeLength(mixed, min, max)
         * Checks if string length is between min and max.
         * @params {required}{str} mixed
         * @params {required}{int} min
         * @params {required}{int} max
         * @return {bol}
         * @sample
         *
         *      // use as array
         *      form.rules([['isRangeLength', 1, 10]]);
         *
         */
        isRangeLength : function (mixed, arr) {
            return mixed.length >= arr[1] && mixed.length <= arr[2];
        },

        /**
         * @method isNumbersOnly(mixed)
         * Checks if incoming is numbers only.
         * @params {required}{str} mixed
         * @return {bol}
         * @sample
         *
         *      // use as string
         *      form.rules(['isNumbersOnly']);
         *
         */
        isNumbersOnly : function (mixed, arr) {
            return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(mixed);
        },

        /**
         * @method isOptional(mixed)
         * Validates against emptyness, only if not empty :-).
         * Basically here for consistency reasons.
         * @params {required}{str} mixed
         * @return {bol}
         * @sample
         *
         *      // use as string
         *      form.rules(['isOptional']);
         *
         */
        isOptional : function (mixed) {

            // skip if no input
            if (mixed === '') {
                return true;
            }

            return $.trim(mixed).length >= 1;

        },

        /**
         * @method isRequired(mixed)
         * Validates against emptyness.
         * @params {required}{str} mixed
         * @return {bol}
         * @sample
         *
         *      // use as string
         *      form.rules(['isRequired']);
         *
         */
        isRequired : function (mixed) {
            return $.trim(mixed).length > 0;
        }

    };

    return validations;

});