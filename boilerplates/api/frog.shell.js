// DEPENDENCIES

// check against shell options
// {required} -env  development
// {required} -port 2200
var argv = require('yargs')

    // stdout: help
    .usage('\n' +
        'Usage:\n' +
        '  $0 --environment <env> --port <port> --cluster <cluster>\n' +
        '  $0 -e <env> -p <port> -u <cluster>')

    // aliases
    .alias('e', 'environment')
    .alias('l', 'local')
    .alias('p', 'port')
    .alias('u', 'cluster')

    // descriptions
    .describe('l', 'enable config.local.js file to be loaded, defaults to true')
    .describe('e', 'set restify server environment variable, defaults to development')
    .describe('p', 'set restify server port to run on, defaults to 2300')
    .describe('u', 'enable restify server instance to run in clustered mode, defaults to true')

    // required
    .demand('environment')
    .demand('port')

    .argv;

// EXPORT

module.exports = argv;