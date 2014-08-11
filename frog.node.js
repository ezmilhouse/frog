switch (typeof define !== 'function') {

    case true :

        module.exports = {

            Api         : require('./src/Api'),
            app         : require('./src/app'),
            Base        : require('./src/Base'),
            singleton   : require('./src/singleton'),
            Collection  : require('./src/Model.Collection'),
            Component   : require('./src/Component'),
            Events      : require('./src/Events'),
            events      : require('./src/events'),
            Flow        : require('./src/Flow'),
            Handler     : {
                Form : require('./src/Handler.Form')
            },
            Model       : require('./src/Model'),
            require     : require('./src/require'),
            Resource    : require('./src/Resource'),
            Router      : require('./src/Router'),
            Schema      : require('./src/Schema'),
            Server      : {
                HTTP  : require('./src/Server.HTTP'),
                REST  : require('./src/Server.REST')
            },
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
                path + 'src/singleton',
                path + 'src/Component',
                path + 'src/Events',
                path + 'src/Events.Singleton',
                path + 'src/Flow',
                path + 'src/Handler.Form',
                path + 'src/log',
                path + 'src/Model',
                path + 'src/Model.Collection',
                path + 'src/require',
                path + 'src/Router',
                path + 'src/util',
                path + 'src/validations',
                path + 'src/View',
                path + 'src/xhr'

        ], function (Api, Base, singleton, Component, Events, events, Flow, HandlerForm, log, Model, ModelCollection, require, Router, util, validations, View, xhr) {

            var frog = {

                // --- COMMON

                API         : Api,
                Base        : Base,
                singleton   : singleton,
                Collection  : ModelCollection,
                Component   : Component,
                Events      : Events,
                events      : events,
                Flow        : Flow,
                Handler     : {
                    Form : HandlerForm
                },
                Model       : Model,
                require     : require,
                Router      : Router,
                util        : util,
                validations : validations,
                View        : View,
                xhr         : xhr

            };

            return window.frog = frog;

        });

        break;

}