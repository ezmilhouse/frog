define([
    'frog',
    'frog/api',
    'frog/text',
    'frog/config'
], function (frog, api, text, config) {

    var facebook = new frog.Facebook({
        appId  : config.facebook.app,
        status : true,
        xfbml  : true
    });

    // initiate
    facebook.init();

    return facebook;

});