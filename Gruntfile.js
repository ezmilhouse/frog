// DEPENDENCIES

var fs = require('fs');

// BUILDER

module.exports = function (grunt) {

    grunt.file.defaultEncoding = 'utf8';

    // get package contents
    var pkg = require('./package.json');

    // extract current version
    var version = pkg.version.split('.');

    // calc new revision
    version[2] = parseInt(version[version.length - 1]) + 1;

    // update version
    version = version.join('.');

    // update pkg
    pkg.version = version;

    // force beautiful json
    pkg = JSON.stringify(pkg, null, 4);

    // save new package.json
    fs.writeFileSync('./package.json', pkg);

    // say hello
    console.log(' \n\r>> frog-' + version + ' ...');
    console.log('>> frog-' + version + '.min ... \n\r');

    // define requirejs paths
    var paths = {
        ejs        : 'empty:',
        frog       : 'frog',
        hashchange : 'empty:',
        request    : 'empty:',
        numeral    : 'empty:',
        underscore : 'empty:'
    };

    // local path (to match live path /support/frog)
    // /support/frog/src/Api.js'
    var baseUrl = '.';

    // conf plugins
    grunt.initConfig({
        requirejs : {
            compile             : {
                options : {
                    baseUrl  : baseUrl,
                    name     : 'frog',
                    optimize : 'none',
                    out      : 'builds/' + version + '/frog-' + version + '.js',
                    paths    : paths
                }
            },
            compileLatest       : {
                options : {
                    baseUrl  : baseUrl,
                    name     : 'frog',
                    optimize : 'none',
                    out      : 'builds/latest/frog-latest.js',
                    paths    : paths
                }
            },
            compileMinify       : {
                options : {
                    baseUrl  : baseUrl,
                    name     : 'frog',
                    optimize : 'uglify',
                    out      : 'builds/' + version + '/frog-' + version + '.min.js',
                    paths    : paths
                }
            },
            compileMinifyLatest : {
                options : {
                    baseUrl  : baseUrl,
                    name     : 'frog',
                    optimize : 'uglify',
                    out      : 'builds/latest/frog-latest.min.js',
                    paths    : paths,
                    done     : function () {

                        // say good-bye
                        console.log('\n\r>> frog-latest ... ok!');
                        console.log('>> frog-latest.min ... ok!');
                        console.log('>> frog-' + version + ' ... ok!');
                        console.log('>> frog-' + version + '.min ... ok! \n\r');

                    }
                }
            }
        }
    });

    // load plugins
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    //( register tasks
    grunt.registerTask('default', [
        'requirejs'
    ]);

};