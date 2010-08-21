
/*!
 * Rapid - Model
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./utils');

var Model = exports = module.exports = function Model() {
    
};

exports.create = function(name, props){
    function subclass(){}
    subclass.prototype.__proto__ = Model.prototype;
    subclass.properties = {};
    utils.merge(subclass, exports.classMethods);
    subclass.addProperties(props);
    return subclass;
};

exports.classMethods = {
    addProperties: function(props){
        Object.keys(props).forEach(function(name){
            this.addProperty(name, props[name]);
        }, this);
    },
    
    addProperty: function(name, options){
        this.properties[name] = options;
    }
};