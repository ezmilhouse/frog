/**
 * @object argv
 * Shell script to controll application form the outside.
 * @option {required} -e --environment
 *         Sets the node applications environemnt variable,
 *         by convention `development` or `production`, if
 *         environment is set to `production`, config.local.js
 *         is ignored. Defaults to `development`.
 * @option {optional} -l --local
 *         If set forces loading of config.local.js, even if
 *         environment is set to `production`. Defaults to
 *         `true`.
 * @option {required} -p --port
 *         Sets the port the node application is running on,
 *         if set overwrites port settings in config.js or
 *         config.local.js
 * @option {required} -u --cluster
 *         If set application is running using node cluster,
 *         if not single process is starte. Defaults to `true`.
 *
 */
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
    .describe('e', 'Sets node server\'s environment variable. Defaults to `development`')
    .describe('l', 'Force config.local.js file to be loaded. Defaults to `true`.')
    .describe('p', 'Sets node server to run port other then set in config.js or config.local.js.')
    .describe('u', 'Sets node server instance to run in clustered mode. Defaults to `true`.')

    // required
    .demand('environment')
    .demand('port')

    .argv;

// EXPORT

module.exports = argv;