var define = require('amdefine')(module);

define({

    api : {

        // authentication keys that allow API requests
        // to identify themselves, also handles cookie
        // lifespans for resources that require a logged
        // in user (ex: /me)
        auth     : {
            clientKey    : 'L99DyWApMsK2ahBg',
            cookie       : null,
            cookieExpire : 30,
            cookieName   : 'frog-session',
            session      : null
        },

        endpoint : '/api'

    },

    // entry point of your appliaction usually the
    // index.js in your frog.server folder
    application : '/server/js/index',

    // the root folder of your application, usually
    // where you put this file here, stick with
    // __dirname if you're nor sure
    dir         : __dirname,

    // path to favicon
    favicon     : '/public/favicon.ico',

    // port to run node server on
    port        : 2310,

    // folder to be treated as public folder, use
    // array of folders, if you have more than one
    public      : '/public',

    // sessions settings, handles express-session
    // module, options are 1:1
    sessions    : {
        cookie            : {
            path     : '/',
            httpOnly : true,
            secure   : true,
            maxAge   : 8640000
        },
        name              : 'frog',
        resave            : true,
        rolling           : false,
        saveUninitialized : true,
        secret            : 'frogfrogfrogfrogfrogfrogfrog',
        unset             : 'destroy'
    },

    // server folder
    server      : '/server',

    // path to server controlling shell script
    shell       : '/frog.shell',

    // folder where the server will find views, means
    // HTML templates
    views       : '/server/html'

});