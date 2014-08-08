/*
* sampleViewEngine
* author: ruleechen
* contact: rulee@live.cn
* create date: 2014.7.24
*/

'use strict';

var utils = require('zoo-utils'),
    sampleView = require('./sample-view');

var sampleViewEngine = module.exports = function(set) {
    utils.extend(this, set);
};

sampleViewEngine.prototype = {

    constructor: sampleViewEngine,

    findView: function(controllerContext, viewName, callback) {
        var error = null;
        callback(error, {
            view: new sampleView({}),
            searchedLocations: []
        });
    },

    releaseView: function(controllerContext, view) {
        if (view.release) {
            view.release();
        }
    }
};
