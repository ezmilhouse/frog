define([
    'frog',
    'frog/api',
    'frog/config'
], function (frog, api, config) {

    // reset id
    var id;

    // loop through components, create instances,
    // also handles dependencies, therefore async
    $('[data-component]').each(function () {

        // set id
        id = $(this).data('component');

        // skip
        // if instance already there
        if (typeof frog.singleton.components[id] !== 'undefined') {
            return;
        }

        // create component instance, bootstrap
        // component
        new frog.Component({
            id : id
        }).bootstrap(frog.singleton.config);

    });

});