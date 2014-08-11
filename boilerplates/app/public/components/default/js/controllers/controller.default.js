define([
    'frog',
    'frog/api',
    'frog/config',
    'frog/components/default'
], function (frog, api, config, component) {

    frog.Flow
        .seq(function() {

            component.require([
                'js/views/view.default'
            ], function(err, modules, ordered) {
                ordered[0].render();
            });

        })
        .end();

});