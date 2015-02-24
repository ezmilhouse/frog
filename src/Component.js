if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    './Api',
    './Base',
    './singleton',
    './Flow',
    './util',
    './View'
], function (Api, Base, singleton, Flow, util, View) {

    var Component = Base.extend({

        // PRIVATE

        /**
         * ctor, Component
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            this.$ = {
                data     : {
                    debug        : false,
                    dependencies : [],
                    version      : null
                },
                config   : null,
                el       : null,
                id       : null,
                file     : null,
                selector : null,
                layout   : null,
                view     : null
            };

            if (options) {
                _.extend(this.$, options);
            }

            // get component element
            this._getComponent();

            // get component element's data attributes
            this._getData();

            // get component's layout file
            this._getFile();

            // set component in cache
            this._cache();

            return this;

        },

        /**
         * @method _getComponnet()
         * Extracts component's jequery object.
         * @return {*}
         */
        _getComponent : function () {

            // set selector
            this.$.selector = '[data-component=' + this.$.id + ']';

            // get component element
            this.$.el = $(this.$.selector);

            // make chainable
            return this;

        },

        /**
         * @method _getData()
         * Extracts values from component's data attributes.
         * @return {*}
         */
        _getData : function () {

            // get, save component's data attributes
            this.$.data = this.$.el.data();

            // make chainable
            return this;

        },

        /**
         * @method _getFile()
         * Sets path to layout template file.
         * @return {*}
         */
        _getFile : function () {

            // create file url
            var file = '';
            file += 'frog';
            file += '/components/';
            file += this.$.id;
            file += '/html';
            file += '/' + this.$.layout;

            // save
            this.$.file = file;

            // make chainable
            return this;

        },

        /**
         * @method _getModules(modules, modulesOrder[,fn])
         * Uses ordered array of key names to return a ordered
         * array of module object, invokes callback when done
         * @params {required}{arr} modules
         * @params {optional}{fun} fn
         */
        _getModules : function(modules, fn) {

            // normalize
            fn = fn || util.noop;

            // reset array
            var arr = [];
            var obj = {};

            // loop through ordered names, replace names
            // with module objects, therefore you kept
            // order of modules
            for (var i = 0; i < modules.length; i++) {

                // save in order
                arr[i] = modules[i].module;

                // save with key
                obj[modules[i].name] = modules[i].module;

            }

            // exit
            return fn(null, obj, arr);

        },

        /**
         * @method _cache()
         * Caches component instance.
         * @return {*}
         */
        _cache : function() {

            // save components
            singleton.components[this.$.id] = this;

            // make chainable
            return this;

        },

        /**
         * @method _render([fn])
         * Renders component layout into target element.
         * @params fn
         */
        _render : function (fn) {

            // normalize
            fn = fn || util.noop;

            // preserve scope
            var self = this;

            // create view instance
            var view = new View({
                file     : this.$.file,
                globals  : {
                    component : this
                },
                selector : this.$.selector
            });

            // save
            this.$.view = view;

            // render layout into selector
            view.render(function () {
                fn.apply(self, arguments);
            });

        },

        /**
         * @method _trigger()
         * Trigger initialization of component, basically
         * require component's index.js
         */
        _trigger : function() {

            // preserve scope
            var self = this;

            // get config
            var config = this.$.config;

            // build base url
            var base = '';
            base += config.components.paths.base + '/' + this.$.id;
            base += '/' + config.components.paths.root;

            // set config, component
            define('frog/components/' + this.$.id, singleton.components[this.$.id]);

            // require the component index
            // and callback
            try {
                require(base);
            } catch (e) {
                require([base]);
            }

        },

        // PUBLIC

        /**
         * @method bootstrap([config][,render][,fn])
         * Bootstrap component, invoke rendering layout.
         * @params {optional}{obj} config
         * @params {optional}{bol} render
         * @params {optional}{fun} fn
         */
        bootstrap : function (config, render, fn) {

            // normalize
            switch(arguments.length) {
                case 1 :
                    if (_.isObject(config)) {
                        config = config || {};
                        render = false;
                        fn = util.noop;
                    }
                    if (_.isBoolean(config)) {
                        render = config || false;
                        config = {};
                        fn = util.noop;
                    }
                    if (_.isFunction(config)) {
                        fn = config || util.noop;
                        config = {};
                        render = false;
                    }
                    break;
                case 2 :
                    config = config || {};
                    if (_.isBoolean(render)) {
                        render = render || false;
                        fn = util.noop;
                    }
                    if (_.isFunction(render)) {
                        fn = render || util.noop;
                        render = false;
                    }
                    break;
                default :
                    config = config || {};
                    render = render || false;
                    fn = fn || util.noop;
                    break;
            }

            // preserve scope
            var self = this;

            // set config, cache
            singleton.config = this.$.config = config;

            // get data
            var data = this.$.data;

            Flow
                .seq(function (cb) {

                    // skip
                    // if no dependencies
                    if (typeof data === 'undefined' || typeof data.dependencies === 'undefined' || !_.isString(data.dependencies)) {
                        return cb();
                    }

                    // convert into arr of dependencies
                    var arr = data.dependencies.split(',');

                    // reset counters
                    var m = arr.length;
                    var c = 0;

                    // loop through all dependencies, call
                    // bootstrap recursively
                    for (var i = 0; i < arr.length; i++) {

                        // create new instance, bootstrap
                        new Component({
                            id : arr[i]
                        }).bootstrap(config, function (err, component) {

                                // update counter
                                c += 1;

                                // exit
                                if (c >= m) {
                                    return cb();
                                }

                            });

                    }

                })
                .seq(function (cb) {

                    // skip
                    // if initial render is other than true
                    if (!render) {

                        // trigger requiring componnets index.js
                        self._trigger();

                        // exit
                        return fn.call(self, null, self);

                    }

                    // render component into target selector
                    // invoke callback
                    self._render(function() {

                        // trigger requiring componnets index.js
                        self._trigger();

                        // invoke callback in component context
                        fn.call(self, null, self);

                    });

                })
                .end();

        },

        /**
         * @method .id([str])
         * Getter/Setter for component's id attribute.
         * @return {str|*}
         */
        id : function (str) {

            // normalize
            str = str || null;

            // set
            if (str) {
                this.$.id = id;
                return this;
            }

            // get
            return this.$.id;

        },

        /**
         * @method require(paths[,fn])
         * Abstracts require functionality, always async, even if
         * module is already loaded, invokes callback when done
         * @params {required}{arr} paths
         * @params {optional}{fun} fn
         */
        require : function(paths, fn) {

            // normalize
            fn = fn || util.noop;

            // preserve scope
            var self = this;

            // reset
            var arr;
            var str;

            // reset counters
            var m = paths.length;
            var c = 0;

            // reset modules required
            var modules = {};
            var ordered = [];
            var bypaths = [];

            // build module key name based onb file name
            // ex: js/views/view.header -> viewHeader
            for (var i = 0; i < paths.length; i++) {

                // save module path as name
                bypaths[i] = paths[i];

                // closure
                (function (paths, i) {

                    // create path
                    var path = '';
                    path += 'frog/components';
                    path += '/' + self.$.id;
                    path += '/' + paths[i];

                    // require modules, try sync first, might be loaded
                    // somewhere else, if that fails, do the async way
                    // require path
                    require([path], function (module) {

                        // extract file name
                        var parts = bypaths[i].split('/');

                        // save modules order
                        ordered[i] = {
                            name   : parts[parts.length - 1],
                            module : module
                        };

                        // exit
                        c += 1;
                        if (c >= m) {
                            self._getModules(ordered, fn);
                        }

                    });

                })(paths, i);

            }

        }

    });

    return Component;

});