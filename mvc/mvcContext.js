/*
* mvcContext
* author: ruleechen
* contact: rulee@live.cn
* create date: 2014.7.9
*/

'use strict';

var path = require('path'),
    utils = require('zoo-utils');

var mvcContext = module.exports = function(set) {
    utils.extend(this, set);
};

var clone = function(ins, className) {
    return new mvcContext({
        id: ins.id,
        app: ins.app,
        zoo: ins.zoo,
        items: ins.items,
        request: ins.request,
        response: ins.response,
        route: ins.route,
        routeData: ins.routeData,
        routeArea: ins.routeArea,
        routeSet: ins.routeSet,
        className: (className || ins.className)
    });
};

mvcContext.prototype = {

    id: null, app: null, zoo: null, items: null, request: null, response: null,

    route: null, routeData: null, routeArea: null, routeSet: null,

    constructor: mvcContext, className: 'mvcContext',

    destroy: function() {
        var self = this;
        utils.each(this, function(key) {
            var t = utils.type(self[key]);
            if (t !== 'string' && t !== 'function') {
                self[key] = null;
            }
        });
    },

    viewTryDirs: function() {
        var areas = this.app.areas;
        var controllerName = this.controller.name();
        //
        var dirs = [];
        dirs.push(path.join(this.routeArea.viewsPath, controllerName));
        dirs.push(this.routeArea.viewsSharedPath);
        if (this.routeArea !== areas.rootArea()) {
            dirs.push(areas.rootArea().viewsSharedPath);
        }
        // ret
        return dirs;
    },

    toHttpContext: function() {
        return clone(this);
    },

    toControllerContext: function(controller) {
        return utils.nudeExtend(clone(this, 'mvcControllerContext'), { controller: controller });
    },

    toAuthorizationContext: function(merge) {
        if (this.controller) { merge.controller = this.controller; }
        return utils.nudeExtend(clone(this, 'mvcAuthorizationContext'), merge);
    },

    toExceptionContext: function(merge) {
        if (this.controller) { merge.controller = this.controller; }
        return utils.nudeExtend(clone(this, 'mvcExceptionContext'), merge);
    },

    toActionExecutingContext: function(merge) {
        if (this.controller) { merge.controller = this.controller; }
        return utils.nudeExtend(clone(this, 'mvcActionExecutingContext'), merge);
    },

    toActionExecutedContext: function(merge) {
        if (this.controller) { merge.controller = this.controller; }
        return utils.nudeExtend(clone(this, 'mvcActionExecutedContext'), merge);
    },

    toResultExecutingContext: function(merge) {
        if (this.controller) { merge.controller = this.controller; }
        return utils.nudeExtend(clone(this, 'mvcResultExecutingContext'), merge);
    },

    toResultExecutedContext: function(merge) {
        if (this.controller) { merge.controller = this.controller; }
        return utils.nudeExtend(clone(this, 'mvcResultExecutedContext'), merge);
    },

    toViewContext: function(merge) {
        if (this.controller) { merge.controller = this.controller; }
        return utils.nudeExtend(clone(this, 'mvcViewContext'), merge);
    }
};
