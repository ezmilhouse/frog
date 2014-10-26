define([
    'frog',
    'frog/api',
    'frog/text',
    'frog/config'
], function (frog, api, text, config) {

    var i18n = new frog.I18n({
        country  : config.i18n.country,
        language : config.i18n.language,
        locale   : config.i18n.locale,
        region   : config.i18n.region,
        text     : text
    });

    return i18n;

});