define([
    'config',
    'config.local'
], function (config, local) {

    // CONFIG

    // extend config with local config setting development
    // configs, config local is not going to be committed
    for (var key in local) {
        config[key] = local[key];
    }

    // APPLICATION

    // set config
    require.config(config.require);

    // set application
    require([
        'frog',
        config.text
    ], function (frog, text) {

        // save text
        frog.singleton.text = text;
        define('frog/text', frog.singleton.text);

        // save config for every other
        // part of the application to
        // be used
        frog.singleton.config = config;
        define('frog/config', frog.singleton.config);

        // save api instance for every
        // other part of the application
        // to be used
        frog.singleton.api = new frog.Api(config.api);
        define('frog/api', frog.singleton.api);

        // require applications entry
        // point, app now running
        require([
            config.application
        ]);

    });

});