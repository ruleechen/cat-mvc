/*
* mvc
* author: ronglin
* create date: 2014.6.24
*/

'use strict';

var caching = require('./caching'),
	mvcAreas = require('./mvcAreas'),
    mvcHandler = require('./mvcHandler'),
    mvcController = require('./mvcController'),
    mvcViewEngines = require('./mvcViewEngines'),
    mvcHandlerRouter = require('./mvcHandlerRouter');

var mError = require('./middles/error'),
    mHeader = require('./middles/header'),
    mRequest = require('./middles/request'),
    mResponse = require('./middles/response');

var handlerRouter = new mvcHandlerRouter();
var setts = caching.region('mvc-runtime-settings');
setts.set('env', process.env.NODE_ENV || 'development');

module.exports = {
    areas: mvcAreas,
    engines: mvcViewEngines,
    controller: mvcController.define,
    //
    get: function(key) {
        return setts.get(key);
    },
    set: function(key, val) {
        return setts.set(key, val);
    },
    use: function() {
        return handlerRouter.register.apply(handlerRouter, arguments);
    },
    disuse: function() {
        return handlerRouter.unregister.apply(handlerRouter, arguments);
    },
    handler: function () {
        // initialize
        mvcAreas.registerAll();
        handlerRouter.register('mHeader', '/', mHeader());
        handlerRouter.register('mRequest', '/', mRequest());
        handlerRouter.register('mResponse', '/', mResponse());
        handlerRouter.register(mvcHandler(setts));
        handlerRouter.register('mError', '/', mError());
        // entrance
        return function(req, res) {
            handlerRouter.execute(req, res);
        };
    }
};
