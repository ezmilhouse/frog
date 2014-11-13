if (typeof define !== 'function') {
    var _ = require('underscore');
    var define = require('amdefine')(module);
}

define([
    './Base',
    './Service',
    './util'
], function (Base, Service, util) {


    return Base.extend({

        /**
         * @method _ctor([obj])
         * Constructor of Service class.
         *
         * @params {optional}{obj} options
         * @return {*}
         */
        _ctor : function (options) {

            this.$ = {
                id        : null,
                methods   : [
                    'index',
                    'create',
                    'retrieve',
                    'update',
                    'delete'
                ],
                namespace : null,
                payload   : [],
                route     : null,
                schema    : null
            };

            if (options) {
                _.extend(this.$, options);
            }

            // prepare
            this._setServices();

            return this;

        },

        // PRIVATE

        /**
         * @method _setMethodIndex()
         * Adds CRUD index method to resource.
         * @return {*}
         */
        _setMethodIndex : function () {

            // index
            new Service({
                fn        : 'index',
                method    : 'GET',
                namespace : this.$.namespace,
                payload   : this.$.payload,
                route     : this.$.route,
                schema    : this.$.schema
            });

            // make chainable
            return this;

        },

        /**
         * @method _setMethodCreate()
         * Adds CRUD create method to resource.
         * @return {*}
         */
        _setMethodCreate : function () {

            // create
            new Service({
                fn        : 'create',
                method    : 'POST',
                namespace : this.$.namespace,
                payload   : this.$.payload,
                route     : this.$.route,
                schema    : this.$.schema
            });

            // make chainable
            return this;

        },

        /**
         * @method _setMethodRetrieve()
         * Adds CRUD retrieve method to resource.
         * @return {*}
         */
        _setMethodRetrieve : function () {

            // retrieve
            new Service({
                fn        : 'retrieve',
                id        : this.$.id,
                method    : 'GET',
                namespace : this.$.namespace,
                payload   : this.$.payload,
                route     : this.$.route + '/:' + this.$.id,
                schema    : this.$.schema
            });

            // make chainable
            return this;

        },

        /**
         * @method _setMethodUpdate()
         * Adds CRUD update method to resource.
         * @return {*}
         */
        _setMethodUpdate : function () {

            // update
            new Service({
                fn        : 'update',
                id        : this.$.id,
                method    : 'PUT',
                namespace : this.$.namespace,
                payload   : this.$.payload,
                route     : this.$.route + '/:' + this.$.id,
                schema    : this.$.schema
            });

            // make chainable
            return this;

        },

        /**
         * @method _setMethodDelete()
         * Adds CRUD delete method to resource.
         * @return {*}
         */
        _setMethodDelete : function () {

            // delete
            new Service({
                fn        : 'delete',
                id        : this.$.id,
                method    : 'DELETE',
                namespace : this.$.namespace,
                payload   : this.$.payload,
                route     : this.$.route + '/:' + this.$.id,
                schema    : this.$.schema
            });

            // make chainable
            return this;

        },

        /**
         * @method _setService()
         * Create CRUD srevices.
         * @return {*}
         */
        _setServices : function () {

            // get allowed methods
            var methods = this.$.methods;

            // index
            if (methods.indexOf('index') > -1) {
                this._setMethodIndex();
            }

            // create
            if (methods.indexOf('create') > -1) {
                this._setMethodCreate();
            }

            // retrieve
            if (methods.indexOf('retrieve') > -1) {
                this._setMethodRetrieve();
            }

            // update
            if (methods.indexOf('update') > -1) {
                this._setMethodUpdate();
            }

            // index
            if (methods.indexOf('delete') > -1) {
                this._setMethodDelete();
            }

            // make chainable
            return this;

        }

    });

});
