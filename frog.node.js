switch (typeof define !== 'function') {

    case true :

        module.exports = {

            Api         : require('./src/Api'),
            app         : require('./src/app'),
            appwire     : require('./src/appwire'),
            Base        : require('./src/Base'),
            Collection  : require('./src/Collection'),
            Component   : require('./src/Component'),
            date        : require('./src/date'),
            Email       : require('./src/Email'),
            Events      : require('./src/Events'),
            Facebook    : require('./src/Facebook'),
            Flow        : require('./src/Flow'),
            Handler     : {
                Form   : require('./src/Handler.Form'),
                Object : require('./src/Handler.Object')
            },
            I18n        : require('./src/I18n'),
            Middleware  : require('./src/Middleware'),
            Model       : require('./src/Model'),
            require     : require('./src/require'),
            Resource    : require('./src/Resource'),
            Router      : require('./src/Router'),
            Schema      : require('./src/Schema'),
            singleton   : require('./src/singleton'),
            Server      : {
                HTTP : require('./src/Server.HTTP'),
                REST : require('./src/Server.REST')
            },
            Service     : require('./src/Service'),
            util        : require('./src/util'),
            validations : require('./src/validations'),
            View        : require('./src/View'),
            xhr         : require('./src/xhr')

        };

        break;

    default :

        var path = 'support/frog/';

        define([

                path + 'src/Api',
                path + 'src/Base',
                path + 'src/Collection',
                path + 'src/Component',
                path + 'src/date',
                path + 'src/Email',
                path + 'src/Events',
                path + 'src/Events.Singleton',
                path + 'src/Facebook',
                path + 'src/Flow',
                path + 'src/Handler.Form',
                path + 'src/Handler.Object',
                path + 'src/I18n',
                path + 'src/log',
                path + 'src/Model',
                path + 'src/require',
                path + 'src/Router',
                path + 'src/singleton',
                path + 'src/util',
                path + 'src/validations',
                path + 'src/View',
                path + 'src/xhr'

        ], function (Api, Base, Collection, Component, date, Email, Events, events, Facebook, Flow, HandlerForm, HandlerObject, I18n, log, Model, require, Router, singleton, util, validations, View, xhr) {

            var frog = {

                // --- COMMON

                API         : Api,
                Base        : Base,
                Collection  : Collection,
                Component   : Component,
                date        : date,
                Email       : Email,
                Events      : Events,
                events      : events,
                Facebook    : Facebook,
                Flow        : Flow,
                Handler     : {
                    Form   : HandlerForm,
                    Object : HandlerObject
                },
                I18n        : I18n,
                Model       : Model,
                require     : require,
                Router      : Router,
                singleton   : singleton,
                util        : util,
                validations : validations,
                View        : View,
                xhr         : xhr

            };

            return window.frog = frog;

        });

        break;

}