if (typeof define !== 'function') {
    var _ = require('underscore');
    var define = require('amdefine')(module);
}

define([
    './Base',
    './Flow',
    './util',
    './xhr'
], function (Base, Flow, util, xhr) {

    return Base.extend({

        // PRIVATE

        /**
         * ctor, Api
         * @params {obj} options
         * @return {obj}
         */
        _ctor : function (options) {

            this.$ = {
                appId                : null,
                cookie               : false,
                endpoint             : null,
                frictionlessRequests : false,
                friends              : [],
                friendsInvitable     : [],
                hideFlashCallback    : null,
                locale               : 'de_DE',
                login                : null,
                permissions          : [],
                permissionsSet       : [],
                sdk                  : '//connect.facebook.net/[1]/sdk.js',
                status               : false,
                user                 : null,
                version              : 'v2.0',
                xfbml                : false
            };

            if (options) {
                _.extend(this.$, options);
            }

            // prepare
            this._setEndpoint();

            return this;

        },

        /**
         * @method _setEndpoint()
         * Creates SDK endpoint based on url and locale.
         * @returns {*}
         */
        _setEndpoint : function () {

            // cretae endpoint
            this.$.endpoint = this.$.sdk.replace('[1]', this.$.locale);

            // make chainable
            return this;

        },

        /**
         * @method _getFriends([fn])
         * Fetches all friends of a user.
         * @params {optional}{fun} fn
         */
        _getFriends : function (fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

        },

        /**
         * @method _getFriendsInvitable([fn])
         * Fetches all friends of a user that can be
         * invited to your application.
         * @params {optional}{fun} fn
         */
        _getFriendsInvitable : function (fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            Flow
                .seq(function (cb) {

                    self._getStatus(function (err, body, status, code) {

                        // exit
                        // not connected
                        if (err) {
                            return fn(err, body, status, code);
                        }

                        // next
                        cb();

                    });

                })
                .seq(function (cb) {

                    // fetch list of invitable friends
                    FB.api('/me/invitable_friends', function (res) {

                        // error
                        // facebook api error
                        if (res && !res.error) {
                            return fn(true, res.error, 400, 'facebook_api_error');
                        }

                        // save
                        self.$.friendsInvitable = res.data;

                        // exit
                        fn(null, self.$.friendsInvitable, 200);

                    });

                })
                .end();

        },

        /**
         * @method : _getFriendsKnown([fn])
         * Gets list of friends who are also connected to
         * this app, AND have also granted the `user_friends`
         * permission.
         * @params {optional}{fun} fn
         */
        _getFriendsKnown : function(fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            // getch list
            FB.api('/me/friends', function (res) {

                // error
                // facebook api error
                if (res && !res.error) {
                    return fn(true, res.error, 400, 'facebook_api_error');
                }

                // save
                self.$.friends = res.data || [];

                // exit
                fn(null, self.$.friends, 200);

            });


        },

        /**
         * @method _getPermissions([fn])
         * Fetches all user permissions granted for
         * your application.
         * @params {optional}{fun} fn
         */
        _getPermissions : function (fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            Flow
                .seq(function (cb) {

                    self._getLoginStatus(function (err, body, status, code) {

                        // exit
                        // not connected
                        if (err) {
                            return fn(err, body, status, code);
                        }

                        // next
                        cb();

                    });

                })
                .seq(function (cb) {

                    FB.api('/me/permissions', function (res) {

                        // error
                        // facebook api error
                        if (res && !res.error) {
                            return fn(true, res.error, 400, 'facebook_api_error');
                        }

                        // save permissions
                        self.$.permissionsSet = res.data;

                        // exit
                        fn(null, self.$.permissionsSet, 200);

                    });

                })
                .end();

        },

        /**
         * @method _getSdk([fn])
         * Injects SDK into DOM
         */
        _getSdk : function (fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            // callback, invoked once the SDK is loaded
            // after being injected
            window.fbAsyncInit = function () {

                FB.init({
                    appId                : self.$.appId,
                    cookie               : self.$.cookie,
                    frictionlessRequests : self.$.frictionlessRequests,
                    hideFlashCallback    : self.$.hideFlashCallback,
                    status               : self.$.status,
                    version              : self.$.version,
                    xfbml                : self.$.xfbml
                });

                // invoke callback
                fn();

            };

            // inject script tag into DOM, please keep in mind that the
            // SDK's locale only affects the text of XFBML elements, like
            // login or share buttons, the dialogues' language is set by
            // the user's own settings and cannot be controlled by this
            // locale setting.
            (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s);
                js.id = id;
                js.src = '//connect.facebook.net/' + self.$.locale + '/sdk.js';
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));

        },

        /**
         * @method _getStatus([fn])
         * Gets user's login status.
         * @params {optional}{fun} fn
         */
        _getStatus : function (fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            Flow
                .seq(function (cb) {

                    // get login status, save user
                    FB.getLoginStatus(function (res) {
                        self.set('login', res);
                        cb();
                    })

                })
                .seq(function (cb) {

                    // check different states
                    switch (self.$.login.status) {

                        // the user is logged in in Facebook AND has
                        // authenticated our app, authResponse object
                        // is available
                        case 'connected' :

                            // reset user
                            self.$.user = {};

                            return fn(null, 200, self.$.login);

                            break;

                        // user is logged in in Facebook BUT HAS NOT
                        // authenticated our app yet, high chance of
                        // conversion in this state
                        case 'not_authorized' :

                            // error
                            return fn(true, 401, self.$.login);

                            break;

                        // user is not logged in in Facebook, therefore
                        // we don't know if he is or is not connected
                        // to our app, user is unknown
                        default :

                            // error
                            return fn(true, 401, self.$.login);

                            break;

                    }

                })
                .end();

        },

        /**
         * @method _getUser([fn])
         * Fetches user data.
         * @params {optional}{fun} fn
         */
        _getUser : function (fn) {

            var self = this;

            // fetch user information
            FB.api('/me', function (res) {

                // error
                if (res && res.error) {
                    return fn(true, res, 400, 'BAD_REQUEST');
                }

                // save user data
                self.$.user = _.extend(self.$.user, res);

                // exit
                fn(null, self.$.user, 200);

            });

        },

        /**
         * @method _getUserImages(fn)
         * Fetches user images.
         * @params {optional}{fun} fn
         */
        _getUserImage : function (fn) {

            var self = this;

            // fetch user information
            FB.api('/me/picture', {
                height   : '200',
                redirect : 'false',
                type     : 'normal',
                width    : '200'
            }, function (res) {

                // error
                if (res && res.error) {
                    return fn(true, res, 400, 'BAD_REQUEST');
                }

                // save user data
                self.$.user = _.extend(self.$.user, {
                    picture : res.data
                });

                // exit
                fn(null, self.$.user, 200);

            });

        },

        // PUBLIC

        /**
         * @method friends([subset][,fn])
         * Fetches all or subset of user's friennds.
         * @params {optional}{str} subset
         * @params {optional}{fun} fn
         */
        friends : function (subset, fn) {

            var self = this;

            // normalize
            switch (arguments.length) {
                case 1 :
                    if (_.isFunction(subset)) {
                        fn = subset;
                        subset = null;
                    } else {
                        subset = subset || null;
                        fn = util.noop;
                    }
                    break;
                default :
                    subset = subset || null
                    fn = fn || util.noop;
                    break;
            }

            // fetch subset of friends or all
            // by default
            switch (subset) {

                case 'invitable' :
                    self._getFriendsInvitable(fn);
                    break;

                case 'known' :
                    self._getFriendsKnown(fn);
                    break;

                default : // all
                    self._getFriends(fn);
                    break;

            }

        },

        /**
         * @method init()
         * Initiates SDK, invokes injection, loading.
         * @params {optional}{fun} fn
         * @return {*}
         */
        init : function (fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            Flow
                .seq(function (cb) {

                    // get SDK, load SDK
                    self._getSdk(cb);

                })
                .seq(function (cb) {

                    // get user's login status
                    self._getStatus(cb);

                })
                .par(function (cb) {

                    // fetch user info
                    self._getUser(cb);

                })
                .par(function (cb) {

                    // fetch user image
                    self._getUserImage(cb);

                })
                .end(function () {

                    // set ready state
                    self.$.ready = true;

                    // exit
                    fn(null, self.$.user, 200);

                });

        },

        /**
         * @method invite(message[, fn])
         * Allows facebook user to invite his friends.
         * @params {required}{str} message
         * @params {optional}{fun} fn
         */
        invite : function (message, fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            Flow
                .seq(function (cb) {

                    // check if permission to invite friends
                    // is granted
                    self._getPermissions(function (err, body, status, code) {

                        // error
                        // could not get permissions
                        if (err) {
                            return fn(err, body, status, code);
                        }

                        var perm = _.find(body, function (obj) {
                            obj.permission === 'user_friends';
                        });

                        // error
                        // missing permission
                        if (!perm) {
                            return fn(true, null, 401, 'missing_permissin');
                        }

                        // next
                        cb();

                    });

                })
                .seq(function (cb) {

                    // fetch list of invitable friends
                    self._getFriendsInvite(function (err, body, status, code) {

                        // error
                        if (err) {
                            return fn(err, body, status, code);
                        }

                        // next
                        cb();

                    });

                })
                .seq(function (cb) {

                    var seq = this;

                    // resets list of friend ids
                    var ids = [];

                    // loop through all invitable friends,
                    // extract invitable id
                    for (var i = 0; i < self.$.friendsInvitable.length; i++) {
                        ids.push(self.$.friendsInvitable[i].id);
                    }

                    // re-format into string of comma separated
                    // id strings
                    ids = ids.join(',');

                    // invoke friend invites
                    FB.ui({
                        method  : 'apprequests',
                        message : message,
                        to      : ids

                    }, function (res) {

                        // exit
                        // facebook api error
                        if (res && !res.error) {
                            return fn(true, res.error, 400, 'facebook_api_error');
                        }

                        trc(res.data);

                        // save
                        seq.set('invites', res.data);

                        // next
                        cb()

                    });

                })
                .seq(function (cb) {

                    // save invite ids on user
                    // to later track invite
                    // results

                    // exit
                    fn(null, null, 200);

                })
                .end();

        },

        /**
         * @method login([fn])
         * Logs in user, if successful, gets basic user information,
         * saves information on $.user
         * @params {optional}{fun} fn
         */
        login : function (fn) {

            var self = this;

            // normalize
            fn = fn || util.noop;

            frog.Flow
                .seq(function (cb) {

                    // normalize permissions
                    var perms = self.$.permissions || [];

                    // invoke login dialogue
                    FB.login(function (res) {

                        // everything went well, user is now
                        // connected to out app, therefore
                        // save user
                        if (res.status === 'connected') {
                            self.$.user = res.authResponse;
                            return cb();
                        }

                        // otherwise save attempt
                        self.$.login = res;

                        // error
                        return fn(true);

                    }, {

                        // set permissions scope
                        scope : perms.join(',')

                    });

                })
                .par(function (cb) {

                    // fetch user info
                    self._getUser(cb);

                })
                .par(function (cb) {

                    // fetch user image
                    self._getUserImage(cb);

                })
                .end(function () {
                    fn(null, self.$.user, 200);
                });

        },

        /**
         * @method .ready()
         * Checks whether or not SDK is loaded and initiated.
         * @return {bol}
         */
        ready : function () {
            return this.$.ready || false;
        }

    });

});