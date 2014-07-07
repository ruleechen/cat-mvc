/*
* mvcAreas
* author: ronglin
* create date: 2014.6.26
*/

'use strict';

var fs = require('fs'),
    path = require('path'),
    events = require('events'),
    utils = require('./utilities'),
    caching = require('./caching'),
    mvcArea = require('./mvcArea');


var CONST_Areas = 'areas',
    CONST_Ctrls = 'ctrls',
    CONST_Events = 'areaEvents.js';


module.exports = {

    _areasPath: utils.absolutePath(CONST_Areas),

    _areas: caching.region('mvc-areas-cache'), _routeSet: null,

    events: new events.EventEmitter(),

    all: function() {
        return this._areas.all();
    },

    get: function(areaName) {
        return this._areas.get(areaName);
    },

    routeSet: function() {
        if (!this._routeSet) {
            var rs = this._routeSet = {};
            utils.each(this.all(), function() {
                utils.each(this.routes.all(), function(key, val) {
                    rs[key] = val;
                });
            });
        }
        return this._routeSet;
    },

    unload: function(areaName) {
        var area = this.get(areaName);
        if (area) {
            area.fireExtension('onUnload');
            this.events.emit('unload', area);
        }
        return this._areas.remove(areaName);
    },

    register: function(areaName, areaRoute, defaultRouteValues) {
        var areaDirectory = areaName;
        if (areaName === '*root') { areaDirectory = path.sep + '..'; }
        var area, areaPath = path.normalize(path.join(this._areasPath, areaDirectory));
        if (fs.existsSync(areaPath) && fs.statSync(areaPath).isDirectory()) {
            // area obj
            area = new mvcArea({
                name: areaName,
                path: areaPath
            });
            //
            var self = this;
            area.routes.events.on('changed', function() {
                self._routeSet = null;
            });
            // map route
            area.routes.set(areaName, areaRoute, defaultRouteValues);
            // load default extension
            area.loadExtension(path.join(area.path, CONST_Events));
            // read 'areas/account/ctrls'
            var ctrlsPath = path.join(area.path, CONST_Ctrls);
            if (fs.existsSync(ctrlsPath) && fs.statSync(ctrlsPath).isDirectory()) {
                // read 'areas/account/ctrls/logon.js'
                var ctrlFiles = fs.readdirSync(ctrlsPath);
                utils.each(ctrlFiles, function(i, ctrlFileName) {
                    area.controllers.load(path.join(ctrlsPath, ctrlFileName));
                });
            }
        }
        //
        if (area) {
            area.fireExtension('onRegister');
            this.events.emit('register', area);
            this._areas.set(area.name, area);
        }
        // ret
        return area;
    },
    
    registerAll: function() {
        this.register(
            ('*root'),
            ('/:controller?/:action?'),
            ({ controller: 'home', action: 'index' })
        );
        var self = this, areasDirs = fs.readdirSync(this._areasPath);
        utils.each(areasDirs, function(i, areaName) {
            self.register(
                (areaName),
                ('/' + areaName + '/:controller?/:action?'),
                ({ controller: 'home', action: 'index' })
            );
        });
        return this.all();
    }
};
