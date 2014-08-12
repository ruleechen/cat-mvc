/*
* mvcModelBinder
* author: ruleechen
* contact: rulee@live.cn
* create date: 2014.8.1
*/

'use strict';

var utils = require('zoo-utils');

var mvcModelBinder = module.exports = function(model) {
    this.model = model;
    if (!this.model) {
        throw new Error('The "model" of mvcModelBinder is required');
    }
};

mvcModelBinder.prototype = {

    model: null,

    constructor: mvcModelBinder,

    bindModel: function(controllerContext, bindingContext) {
        var raw = this.model.inner();
        var rootNs = bindingContext.paramName;
        var paramsDict = bindingContext.paramsDict;
        var modelState = bindingContext.modelState;
        var modelling = controllerContext.app.modelling;
        var datas = controllerContext.requestDatas('lowerAll');
        //
        var metas = modelling.resolve(raw);
        if (metas.has()) {
            var value = utils.readObj(datas, rootNs);
            return metas.exe(value, function(err) {
                modelState.addModelError(rootNs, err);
            });
        } else {
            var clone = utils.extend(true, {}, raw);
            var walk = function(obj, parentNs) {
                var t = utils.type(obj);
                var isArr = (t === 'array')
                var isObj = (t === 'object');
                if (!isArr && !isObj) { return; }
                //
                utils.each(obj, function(key, item) {
                    var partNs = isArr ? ('[' + key + ']') : ('.' + key.toLowerCase());
                    var currNs = parentNs + partNs;
                    var fullNs = rootNs + currNs;
                    //
                    var metas = modelling.resolve(item);
                    if (metas.has()) {
                        var value = null;
                        if (parentNs || paramsDict[String(key).toLowerCase()]) {
                            value = utils.readObj(datas, fullNs);
                        } else {
                            value = utils.readObj(datas, fullNs) || utils.readObj(datas, currNs);
                        }
                        obj[key] = metas.exe(value, function(err) {
                            modelState.addModelError(fullNs, err);
                        });
                    } else {
                        walk(item, currNs);
                    }
                });
            };
            walk(clone, '');
            return clone;
        }
    }
};

mvcModelBinder.resolveParams = function(controllerContext, paramNames, binderAttrs) {
    var findAttribute = function() { }, routeAreaName, rootAreaName;
    if (binderAttrs && binderAttrs.length) {
        routeAreaName = controllerContext.routeArea.name;
        rootAreaName = controllerContext.app.areas.rootArea().name;
        findAttribute = function(paramName, areaName) {
            var attr;
            utils.each(binderAttrs, function(i, item) {
                if (item.paramName.toLowerCase() === paramName &&
                    item.getBinder().model.ownerAreaName === areaName) {
                    attr = item;
                    return false;
                }
            });
            if (attr) {
                return attr;
            } else if (areaName !== rootAreaName) {
                return findAttribute(paramName, rootAreaName);
            } else {
                return null;
            }
        };
    }
    //
    var namesDict = {};
    utils.each(paramNames, function(i, name) {
        namesDict[name.toLowerCase()] = true;
    });
    //
    var values = [];
    utils.each(paramNames, function(i, name) {
        var lowerName = name.toLowerCase();
        if (lowerName.charAt(0) === '$') {
            lowerName = lowerName.substr(1);
        }
        var attr = findAttribute(lowerName, routeAreaName), val;
        if (attr) {
            val = attr.getBinder().bindModel(controllerContext, {
                modelState: controllerContext.controller.viewData.modelState,
                paramName: lowerName, paramsDict: namesDict
            });
        } else {
            val = controllerContext.requestDatas('lowerRoot')[lowerName];
        }
        values.push(val || null);
    });
    return values;
};
