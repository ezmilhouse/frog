if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([
    './Events'
], function (Events) {
	return new Events();
});