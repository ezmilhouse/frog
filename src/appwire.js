if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define(function () {

    return function (dir, config) {

        /**
         * @method appwire(path)
         * Allows requiring modules on application level, with
         * normalized paths.
         * @params {required}{str} path
         * @return {*}
         */
        return function (path) {

            // ./
            if (path.substr(0, 2) === './') {

                var arr = path.split('/');
                var str = '';

                for (var i = 1; i < arr.length; i++) {
                    if (i === 1) {
                        str += dir;
                    }
                    str += '/' + arr[i];
                }

                str += '.js';

                return require(str);
            }

            // server/js
            return require(dir + config.server + '/js/' + path);

        };

    }

});