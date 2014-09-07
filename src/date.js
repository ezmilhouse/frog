if (typeof define !== 'function') {
    var _ = require('underscore');
    var define = require('amdefine')(module);
    var moment = require('moment');
}

define([
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