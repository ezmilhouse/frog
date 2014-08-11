if (typeof define !== 'function') {
    var server = true;
    var define = require('amdefine')(module);
}

define([
    './singleton'
],function (singleton) {

    // --- @PRIVATE

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

            // save module path as name
            modulesNames.push(paths[i]);

            // closure
            (function (paths, i) {

                if (server) {

                    // extract server
                    var app = singleton.server;

                    // create path
                    path = app.get('dir') + app.get('server') + '/' + paths[i];

                    // everythings synchronous on the server-side,
                    // just push required modules
                    modulesOrder.push({
                        name   : modulesNames[i],
                        module : require(path)
                    });

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
                        modulesOrder.push({
                            name   : modulesNames[i],
                            module : module
                        });

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