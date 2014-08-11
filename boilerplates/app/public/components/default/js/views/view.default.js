define([
    'frog',
    'frog/api',
    'frog/config',
    'frog/components/default'
], function (frog, api, config, component) {

    var view = new frog.View({
        api      : api,
        file     : 'frog/components/default/html/views/view.default',
        selector : '.frog-component-default .frog-view-default'
    });

    return view;

});