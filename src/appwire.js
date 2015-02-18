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
                return require(dir + '/' + path.split('/')[1] + '.js');
            }

            // server/js
            return require(dir + config.server  + '/js/' + path);

        };

    }

});