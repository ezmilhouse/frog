define([

    'support/frog/src/Api',
    'support/frog/src/Base',
    'support/frog/src/singleton',
    'support/frog/src/Component',
    'support/frog/src/Events',
    'support/frog/src/Events.Singleton',
    'support/frog/src/Flow',
    'support/frog/src/Handler.Form',
    'support/frog/src/log',
    'support/frog/src/Model',
    'support/frog/src/Model.Collection',
    'support/frog/src/require',
    'support/frog/src/Router',
    'support/frog/src/util',
    'support/frog/src/validations',
    'support/frog/src/View',
    'support/frog/src/xhr'

], function (Api, Base, singleton, Component, Events, events, Flow, HandlerForm, log, Model, ModelCollection, require, Router, util, validations, View, xhr) {

    var frog = {

        Api         : Api,
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
        log         : log,
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