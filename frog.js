define([

    'support/frog/src/Api',
    'support/frog/src/Base',
    'support/frog/src/Collection',
    'support/frog/src/Component',
    'support/frog/src/date',
    'support/frog/src/Email',
    'support/frog/src/Events',
    'support/frog/src/Events.Singleton',
    'support/frog/src/Facebook',
    'support/frog/src/Flow',
    'support/frog/src/Handler.Form',
    'support/frog/src/Handler.Object',
    'support/frog/src/I18n',
    'support/frog/src/log',
    'support/frog/src/Model',
    'support/frog/src/require',
    'support/frog/src/Router',
    'support/frog/src/singleton',
    'support/frog/src/util',
    'support/frog/src/validations',
    'support/frog/src/View',
    'support/frog/src/xhr'

], function (Api, Base, Collection, Component, date, Email, Events, events, Facebook, Flow, HandlerForm, HandlerObject, I18n, log, Model, require, Router, singleton, util, validations, View, xhr) {

    var frog = {

        Api         : Api,
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
        log         : log,
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