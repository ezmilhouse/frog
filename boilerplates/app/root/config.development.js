var define = require('amdefine')(module);

define({
    api  : {
        endpoint : '/api',
        headers  : {
            'Accept'       : 'application/json',
            'Content-Type' : 'application/json'
        },
        host     : 'localhost',
        port     : 2500,
        protocol : 'http'
    },
    i18n : {
        country  : 'DE',
        language : 'de',
        locale   : 'de_DE',
        region   : 'de'
    },
    port : 2500
});