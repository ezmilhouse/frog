var _ = require('underscore');
var define = require('amdefine')(module);
define('frog/api', require('frog').singleton.api);
define('frog/text', require('frog').singleton.text);
define('frog/config', require('frog').singleton.config);

define([
    'frog',
    'frog/api',
    'frog/config',
    'frog/text'
], function (frog, api, config, text) {

    var i18n = new frog.I18n({
        country  : config.i18n.country,
        language : config.i18n.language,
        locale   : config.i18n.locale,
        region   : config.i18n.region,
        text     : text
    });

    return i18n;

});