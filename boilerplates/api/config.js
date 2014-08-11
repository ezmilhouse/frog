var define = require('amdefine')(module);

define({

    // entry point of your appliaction usually the
    // index.js in your frog.server folder
    application : '/server/js/index',

    // the root folder of your application, usually
    // where you put this file here, stick with
    // __dirname if you're nor sure
    dir         : __dirname,

    // server endpoint, API will run against
    endpoint    : '/api',

    // headers to be expected by client
    // requests
    headers     : {
        key     : 'frog-key',
        session : 'frog-session'
    },

    // database connection to be kept up
    mongo       : {
        db       : 'frog',
        url      : 'mongodb://localhost',
        user     : '',
        password : '',
        poolSize : 5
    },

    // port to run node server on
    port        : 2210,

    // server folder
    server      : '/server',

    // path to server controlling shell script
    shell       : '/frog.shell'

});