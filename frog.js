define([

    'src/Api',
    'src/Base',
    'src/Collection',
    'src/Component',
    'src/date',
    'src/Email',
    'src/Events',
    'src/Events.Singleton',
    'src/Facebook',
    'src/Flow',
    'src/Handler.Form',
    'src/Handler.Object',
    'src/I18n',
    'src/log',
    'src/Model',
    'src/require',
    'src/Router',
    'src/singleton',
    'src/util',
    'src/validations',
    'src/View',
    'src/xhr'

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