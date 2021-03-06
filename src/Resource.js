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
                id         : 'id',
                context    : null,
                errors     : {},
                defaults   : {
                    limit  : 100,
                    offset : 0,
                    page   : 1,
                    sort   : {
                        created : -1 // DESC (1 = ASC)
                    }
                },
                methods    : [
                    'index',
                    'create',
                    'retrieve',
                    'update',
                    'delete'
                ],
                middleware : [],
                namespace  : null,
                payload    : [],
                route      : null,
                safe       : true, // if set to false {} queries on _del, _set are possible
                schema     : null
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
                context    : this.$.context,
                defaults   : this.$.defaults,
                errors     : this.$.errors,
                fn         : 'index',
                method     : 'GET',
                middleware : this.$.middleware,
                namespace  : this.$.namespace,
                payload    : this.$.payload,
                route      : this.$.route,
                safe       : this.$.safe,
                schema     : this.$.schema
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
                context    : this.$.context,
                defaults   : this.$.defaults,
                errors     : this.$.errors,
                fn         : 'create',
                method     : 'POST',
                middleware : this.$.middleware,
                namespace  : this.$.namespace,
                payload    : this.$.payload,
                route      : this.$.route,
                safe       : this.$.safe,
                schema     : this.$.schema
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
                context    : this.$.context,
                defaults   : this.$.defaults,
                errors     : this.$.errors,
                fn         : 'retrieve',
                id         : this.$.id,
                method     : 'GET',
                middleware : this.$.middleware,
                namespace  : this.$.namespace,
                payload    : this.$.payload,
                route      : this.$.route + '/:' + this.$.id,
                safe       : this.$.safe,
                schema     : this.$.schema
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
                context    : this.$.context,
                defaults   : this.$.defaults,
                errors     : this.$.errors,
                fn         : 'update',
                id         : this.$.id,
                method     : 'PUT',
                middleware : this.$.middleware,
                namespace  : this.$.namespace,
                payload    : this.$.payload,
                route      : this.$.route + '/:' + this.$.id,
                safe       : this.$.safe,
                schema     : this.$.schema
            });

            // skip
            // if in safe mode, avoids updates
            // of multiple documents
            if (this.$.safe) {
                return this;
            }

            // update (multiple documents affected)
            new Service({
                context    : this.$.context,
                defaults   : this.$.defaults,
                errors     : this.$.errors,
                fn         : 'update',
                id         : this.$.id,
                method     : 'PUT',
                middleware : this.$.middleware,
                namespace  : this.$.namespace,
                payload    : this.$.payload,
                route      : this.$.route,
                safe       : this.$.safe,
                schema     : this.$.schema
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
                context    : this.$.context,
                defaults   : this.$.defaults,
                errors     : this.$.errors,
                fn         : 'delete',
                id         : this.$.id,
                method     : 'DELETE',
                middleware : this.$.middleware,
                namespace  : this.$.namespace,
                payload    : this.$.payload,
                route      : this.$.route + '/:' + this.$.id,
                safe       : this.$.safe,
                schema     : this.$.schema
            });

            // skip
            // if in safe mode, avoids deletes
            // of multiple documents
            if (this.$.safe) {
                return this;
            }

            // delete (multiple documents affected)
            new Service({
                context    : this.$.context,
                defaults   : this.$.defaults,
                errors     : this.$.errors,
                fn         : 'delete',
                id         : this.$.id,
                method     : 'DELETE',
                namespace  : this.$.namespace,
                middleware : this.$.middleware,
                payload    : this.$.payload,
                route      : this.$.route,
                safe       : this.$.safe,
                schema     : this.$.schema
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
