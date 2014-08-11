if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    'underscore',
    './Base',
    'mongoose',
    './util'
], function (_, Base, mongoose, util) {

    return Base.extend({

        // PRIVATE

        /**
         * ctor, Schema
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            this.$ = {
                collection : null,
                document   : {
                    _created  : { type : Date },
                    _modified : { type : Date }
                },
                mongo      : {
                    Model  : null,
                    schema : null
                },
                options    : {

                    // mongoose assigns each of your schemas an _id field by
                    // default if one is not passed into the Schema constructor.
                    // The type assiged is an ObjectId to coincide with MongoDBs
                    // default behavior. If you don't want an _id added to your
                    // schema at all, you may disable it using this option.
                    _id        : true,

                    // when your application starts up, Mongoose automatically
                    // calls ensureIndex for each defined index in your schema.
                    // While nice for development, it is recommended this
                    // behavior be disabled in production since index creation
                    // can cause a significant performance impact, disable the
                    // behavior by setting the autoIndex option of your schema
                    // to false
                    autoIndex  : false,

                    // by default collection names are produced by passing the
                    // model name,  this method pluralizes the name, set this
                    // option if you need a different name for your collection
                    collection : '',

                    // mongoose assigns each of your schemas an id virtual getter
                    // by default which returns the documents _id field cast to
                    // a string, or in the case of ObjectIds, its hexString. If
                    // you don't want an id getter added to your schema, you may
                    // disable it passing this option at schema construction time
                    id         : true,

                    // the strict option, (enabled by default), ensures that
                    // values passed to our model constructor that were not
                    // specified in our schema do not get saved to the db.
                    strict     : false,

                    // the return value of this method is used in calls to
                    // JSON.stringify(doc), checkout toObject options, it's
                    // exactly the same
                    toJSON     : {
                        depopulate : false,
                        getters    : true,
                        minimize   : false,
                        transform  : function (doc, ret, options) {

                            // ret.id = ret._id;
                            // delete ret._id;

                        },
                        virtuals   : true
                    },

                    // documents have a toObject method which converts the
                    // mongoose document into a plain javascript object. This
                    // method accepts a few options. Instead of applying these
                    // options on a per-document basis we may declare the
                    // options here and have it applied to all of this schemas
                    // documents by default
                    toObject   : {

                        // depopulate any populated paths, replacing them with
                        // their original refs
                        depopulate : false,

                        // apply all getters (path and virtual getters)
                        getters    : true,

                        // remove empty objects
                        minimize   : false,

                        // a transform function to apply to the resulting document
                        // before returning
                        transform  : function (doc, ret, options) {

                            // ret.id = ret._id;
                            // delete ret._id;

                        },

                        // apply virtual getters (can override getters
                        // option)
                        virtuals   : true
                    },

                    // The versionKey is a property set on each document when first
                    // created by Mongoose. This keys value contains the internal
                    // revision of the document. The name of this document property
                    // is configurable.
                    versionKey : '_version'

                }
            };

            if (options) {

                // special extend
                if (options.options) {
                    _.extend(this.$.options, options.options);
                    delete options.options;
                }

                _.extend(this.$, options);

            }

            // prepare
            this._setMongoCollection();
            this._setMongoSchema();
            this._setMongoModel();

            return this;

        },

        // PRIVATE

        /**
         * @method _setMongoCollection()
         * Injects collection name into mongo options
         * @return {*}
         */
        _setMongoCollection : function () {

            // add collection name
            _.extend(this.$.options, {
                collection : this.$.collection
            });

            // make chainable
            return this;

        },

        /**
         * @method _setMongoSchema()
         * Creates mongo schema basd on set document and
         * schema options.
         * @return {*}
         */
        _setMongoSchema : function () {

            // create mongo schema
            this.$.mongo.schema = new mongoose.Schema(this.$.document, this.$.options);

            // make chainable
            return this;

        },

        /**
         * @method _setMongoModel()
         * Creates mongo Model basd on set schema and
         * collection name.
         * @return {*}
         */
        _setMongoModel : function () {

            // create mongo Model
            this.$.mongo.Model = mongoose.model(this.$.collection, this.$.mongo.schema);

            // make chainable
            return this;

        }

    });

});