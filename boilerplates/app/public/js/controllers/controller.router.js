define([
    'frog',
    'frog/api',
    'frog/config'
], function (frog, api, config) {

    var router = new frog.Router({
        name : 'default'
    });

    router
        .add('/:region/:language/*', function (req, next) {
            log('o_O - frog.js');
        })
        .end();

    return router;

});