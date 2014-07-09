/*
* mvcContext
* author: ronglin
* create date: 2014.7.9
*/

'use strict';

var utils = require('./utilities');

var mvcContext = function(set) {
    utils.extend(this, set);
};

mvcContext.prototype = {

    request: null, response: null, rulee: null,

    route: null, routeData: null, routeSet: null,

    constructor: mvcContext, className: 'mvcContext',

    clone: function(className) {
        return new mvcContext({
            className: (className || this.className),
            request: this.request,
            response: this.response,
            route: this.route,
            routeData: this.routeData,
            routeSet: this.routeSet,
            rulee: this.rulee
        });
    },

    toHttpContext: function() {
        return this.clone();
    },

    toControllerContext: function(controller) {
        return utils.extend(this.clone('controllerContext'), { controller: controller });
    },

    toActionContext: function(merge) {
        return utils.extend(this.clone('actionContext'), merge);
    },

    toViewContext: function(merge) {
    	return utils.extend(this.clone('viewContext'), merge);
    }
};

module.exports = mvcContext;
