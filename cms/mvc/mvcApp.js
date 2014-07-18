/*
* mvcApp
* author: ronglin
* create date: 2014.6.24
*/

'use strict';

var path = require('path'),
    utils = require('./utilities'),
	mvcAreas = require('./mvcAreas'),
    mvcHandler = require('./mvcHandler'),
    mvcController = require('./mvcController'),
    mvcAttributes = require('./attributes/$index'),
    mvcViewEngines = require('./mvcViewEngines'),
    mvcHandlerRouter = require('./mvcHandlerRouter');

var caching = require('./caching'),
    cachingStore = require('./cachingStore');

var midError = require('./middles/error'),
    midHeader = require('./middles/header'),
    midRequest = require('./middles/request'),
    midResponse = require('./middles/response');

var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser');

var mvcApp = function(set) {
    utils.extend(this, set);
    if (!this.appPath) { throw new Error('Parameter "appPath" is required'); }
    //
    this._handlers = new mvcHandlerRouter();
    this._setts = caching.region('mvc-runtime-settings');
    this._setts.set('env', process.env.NODE_ENV || 'development');
    //
    this.areas = new mvcAreas(this.appPath);
    this.engines = new mvcViewEngines();
    this.attributes = new mvcAttributes();
};

mvcApp.prototype = {

    _setts: null, _handlers: null, _inited: null,

    appPath: null, areas: null, engines: null, attributes: null,

    constructor: mvcApp, className: 'mvcApp',

    /*
    * get app setting
    */
    get: function(key) {
        return this._setts.get(key);
    },

    /*
    * set app setting
    */
    set: function(key, val) {
        return this._setts.set(key, val);
    },

    /*
    * use(handler)
    * use(routeExp, handler)
    * use(routeExp, name, handler)
    */
    use: function() {
        return this._handlers.register.apply(this._handlers, arguments);
    },

    /*
    * disuse(name)
    */
    disuse: function() {
        return this._handlers.unregister.apply(this._handlers, arguments);
    },

    /*
    * mapPath('~/xx')
    *
    * TODO:
    * mapPath('/xx')
    * mapPath('./xx')
    * mapPath('../xx')
    */
    mapPath: function(relPath) {
        if (!relPath) { return this.appPath; }
        if (relPath.charAt(0) === '~') { relPath = relPath.substr(1); }
        return path.join(this.appPath, relPath);
    },

    /*
    * 1. initialize
    * 2. return the web server handler
    */
    handler: function () {
        //
        var handlers = this._handlers;
        if (this._inited !== true) {
            this._inited = true;
            //
            handlers.register(bodyParser.json());
            handlers.register(bodyParser.json({ type: 'application/hal+json' }));
            handlers.register(bodyParser.urlencoded({ extended: true }));
            handlers.register(cookieParser());
            //
            handlers.register('/', 'midHeader', midHeader());
            handlers.register('/', 'midRequest', midRequest());
            handlers.register('/', 'midResponse', midResponse());
            handlers.registerAtLast('/', 'midError', midError());
            //
            handlers.register(mvcHandler(this));
            //
            this.engines.register('.vash', require('./engines/vash'));
            this.attributes.registerAll();
            this.areas.registerAll(); // user code always focus on the controllers, so register at last
        }
        //
        return function(req, res) {
            handlers.execute(req, res);
        };
    }
};

// export
module.exports = {
    utils: utils,
    caching: caching,
    controller: mvcController.define,
    current: null,
    gainApp: function(set) {
        return this.current ? this.current : (this.current = new mvcApp(set));
    }
};
