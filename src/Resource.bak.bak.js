// from within resource:
// function call
// this.update(id, body, fn);

// from within resource:
// event emission
// this.emit('update', id, body, fn);
// slef.emit('update', id, body, fn);

// from outside resource, app available:
// event emission
// app.emit('resources:clients:update', id, body, fn)

// from outside resource, app not available
// frog.singleton.resources.clients.update(id, body, fn);

// default index querystring params
// limit
// offset
// page
// sort
// order

if (typeof define !== 'function') {
    var _ = require('underscore');
    var define = require('amdefine')(module);
}

define([
    './Base',
    './singleton',
    './util'
], function (Base, singleton, util) {

    return Base.extend({

        /**
         * @method _ctor([obj])
         * Constructor of Resource class.
         *
         * @params {optional}{obj} options
         * @return {*}
         */
        _ctor : function (options) {

            this.$ = {
                app        : null,
                collection : null,
                context    : '',
                id         : null,
                namespace  : null,
                route      : null,
                schema     : null,
                server     : null,
                services   : []
            };

            if (options) {
                _.extend(this.$, options);
            }

            // prepare
            this._setServices();

            // make chainable
            return this;

        },

        /**
         * @method _setService()
         * Sets default (CRUID + index) and custom services,
         * to be accessible under sthis resource.
         * @return {*}
         */
        _setServices : function () {

            var self = this;

            // get id key
            var id = this.$.id;

            // get namespace
            var namespace = this.$.namespace;

            // get route
            var route = this.$.context + this.$.route;

            // INDEX

            // index(query, fn)
            new frog.Service({
                fn        : 'index',
                method    : 'GET',
                namespace : 'resource:' + namespace + ':index',
                route     : route,
                schema    : this.$.schema
            });

            // CRUD

            // create(body, fn)
            new frog.Service({
                fn        : 'create',
                method    : 'POST',
                namespace : 'resource:' + namespace + ':create',
                route     : route,
                schema    : this.$.schema
            });

            // retrieve(id, fn)
            new frog.Service({
                fn        : 'retrieve',
                method    : 'GET',
                namespace : 'resource:' + namespace + ':retrieve',
                route     : route + '/:' + id,
                schema    : this.$.schema
            });

            // update(id, body, fn)
            new frog.Service({
                fn        : 'update',
                method    : 'PUT',
                namespace : 'resource:' + namespace + ':update',
                route     : route + '/:' + id,
                schema    : this.$.schema
            });

            // delete(id, fn)
            new frog.Service({
                fn        : 'delete',
                method    : 'DELETE',
                namespace : 'resource:' + namespace + ':delete',
                route     : route + '/:' + id,
                schema    : this.$.schema
            });

            // SERVICES

            // extract services
            var services = this.$.services;

            // loop through all incoming services, create
            // service instances accordingly
            for (var i = 0; i < services.length; i++) {

                (function (services, i) {

                    // get service
                    var service = services[i];

                    // add service
                    new frog.Service({
                        fn        : service.fn,
                        method    : service.method,
                        namespace : 'resource:' + namespace + ':' + service.namespace,
                        route     : route + '/:' + id,
                        schema    : self.$.schema
                    });

                })(services, i);

            }

            // make chainable
            return this;

        },

        // PUBLIC

        emit : function (service) {

            // convert
            var params = Array.prototype.slice.call(arguments);

            // remove first key
            params.shift();

            // call service
            this.services[service].apply(params);

            // make chainable
            return this;

        }


    });

});