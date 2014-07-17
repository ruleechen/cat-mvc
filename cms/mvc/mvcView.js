/*
* mvcView
* author: ronglin
* create date: 2014.6.26
*/

'use strict';

var fs = require('fs'),
    path = require('path'),
    utils = require('./utilities');

var mvcView = module.exports = function(viewName) {
    this.viewName = viewName;
};

mvcView.prototype = {
    
    viewName: null, engineExtname: null,

    constructor: mvcView, className: 'mvcView',

    render: function(viewContext, callback) {
        var areas = viewContext.app.areas;
        var engines = viewContext.app.engines;
        //
        var extname = this.engineExtname;
        if (!extname) { extname = engines.default(); }
        var ctrlName = viewContext.controller.name();
        //
        var ctrlViewsDir = path.join(viewContext.routeArea.viewsPath, ctrlName);
        var filePath = path.join(ctrlViewsDir, this.viewName + extname);
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            callback(new Error('Failed to lookup view "' + this.viewName + '" in views directory "' + ctrlViewsDir + '"'));
            return;
        }
        //
        var engine = engines.get(extname);
        if (!engine) {
            callback(new Error('Failed to load view engine "' + this.engineExtname + '"'));
            return;
        }
        //
        var findPaths = [];
        findPaths.push(ctrlViewsDir);
        findPaths.push(viewContext.routeArea.viewsSharedPath);
        findPaths.push(areas.rootArea().viewsSharedPath);
        var findView = function(name) {
            for(var i = 0; i < findPaths.length; i++) {
                var file = path.join(findPaths[i], name + extname);
                if (fs.existsSync(file) && fs.statSync(file).isFile()) {
                    return file;
                }
            }
            throw new Error('Failed to lookup view "' + name + '" in the following directories "' + findPaths.join('<br/>') + '"');
        };
        //
        try {
            var data = {
                model: viewContext.viewData,
                url: viewContext.controller.url,
                __RULEE_findView: findView
            };
            engine(filePath, data, function(err, str) {
                callback(err, str);
            });
        } catch (ex) {
            callback(ex);
        }
    }
};
