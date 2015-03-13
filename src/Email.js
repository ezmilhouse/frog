if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var templates = require('email-templates');
    var nodemailer = require('nodemailer');
}

define([
    'underscore',
    './Base',
    './Flow',
    './util'
], function (_, Base, Flow, util) {

    return Base.extend({

        /**
         * @method _ctor([obj])
         * Constructor of Emails class.
         *
         * @params {optional}{obj} options
         * @return {*}
         */
        _ctor : function (options, local) {

            this.$ = {
                dir       : null,
                protocol  : 'SMTP',
                sender    : {
                    email    : null,
                    name     : null,
                    service  : 'Gmail',
                    password : null,
                    user     : null
                },
                template  : null,
                templates : null
            };

            if (options) {
                _.extend(this.$, options);
            }

            // prepare
            this._setDir();
            this._setTransport();

            // make chainable
            return this;

        },

        // PRIVATE

        /**
         * @method _.getData(data)
         * Extends incoming data, extends data with default
         * data (ex: with text).
         *
         * @params {required}{obj} data
         * @return {obj}
         */
        _setData : function (data) {
            return _.extend(data, {
                i18n : this.$.i18n
            });
        },

        /**
         * @method _setDir([fn])
         * Fetches, pre-compile email templates, sets
         * ready state.
         *
         * @params {optional}{fun} fn
         */
        _setDir : function (fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            // read templates folder, fetch markup,
            // pre-compile

            templates(this.$.dir, function (err, tpl) {

                // [-] exit
                if (err) {
                    return fn(true, null, 400, 'ERROR_EMAIL_TEMPLATES_COULD_NOT_BE_LOADED');
                }

                // save
                self.$.templates = tpl;

                // [+] exit
                fn(null, null, 200);

            });

        },

        /**
         * @method _setTransport()
         * Sets up the transport layer.
         *
         * @return {*}
         */
        _setTransport : function () {

            // initiatiate transport credentials
            this.$.transport = nodemailer.createTransport({
                auth    : {
                    user : this.$.sender.user,
                    pass : this.$.sender.password
                },
                service : this.$.sender.service
            });

            // make chainable
            return this;

        },

        // PUBLIC

        /**
         * @method send([fn])
         * Invokes sending emails.
         *
         * @params {required}{obj} options
         *    @key {required}{obj} data
         *    @key {required}{str} email
         *    @key {required}{str} subject
         *    @key {required}{str} template
         * @params {optional}{fun} fn
         */
        send : function (options, fn) {

            // normalize
            fn = fn || util.noop;

            var self = this;

            Flow
                .seq(function (cb) {

                    var seq = this;

                    // skip
                    // if already ready
                    if (self.$.state === 'ok') {
                        return cb();
                    }

                    // prepare templates folder
                    self._setDir(cb)

                })
                .seq(function (cb) {

                    var seq = this;

                    // compile email with data object
                    self.$.templates(self.$.template, options.data, function (err, html, text) {

                        // [-] exit
                        if (err) {
                            return fn(true, null, 400, 'ERROR_EMAIL_NOT_RENDERED');
                        }

                        // save html/text
                        seq.set('html', html);
                        seq.set('text', text);

                        // next
                        cb();

                    });

                })
                .seq(function (cb) {

                    var seq = this;

                    // prepare message
                    var message = {
                        from    : self.$.sender.name + ' <' + self.$.sender.email + '>',
                        to      : '<' + options.email + '>',
                        subject : options.subject,
                        html    : seq.get('html')
                    };

                    // send email
                    self.$.transport.sendMail(message, function (err, body) {

                        // [-] exit
                        if (err) {
                            return fn(true, null, 400, 'ERROR_EMAIL_NOT_SENT');
                        }

                        // close pool
                        self.$.transport.close();

                        // [+] exit
                        fn(null, body, 200);

                    });

                })
                .end();

        }

    });

});