define([
    'config',
    'config.local'
], function (config, configLocal) {

    // CONFIG

    // extend config with local config setting development
    // configs, config local is not going to be committed
    config = $.extend(config, configLocal);

    // APPLICATION

    // set config
    require.config(config.require);

    // set application
    require([
        'frog'
    ], function (frog) {

        // save config for every other
        // part of the application to
        // be used
        frog.singleton.config = config;
        define('frog/config', frog.singleton.config);

        // save api instance for every
        // other part of the application
        // to be used
        frog.singleton.api = new frog.Api(config.api).init();
        define('frog/api', frog.singleton.api);

        // require applications entry
        // point, app now running
        require([
            config.application
        ]);

    });

});