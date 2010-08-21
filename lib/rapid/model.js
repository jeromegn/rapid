
/*!
 * Rapid - Model
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./utils');

var Model = exports = module.exports = function Model(props) {
    if (props) {
        this.addProperties(props);
    }
};

Model.prototype.addProperties = function(props){
    Object.keys(props).forEach(function(name){
        this.addProperty(name, props[name]);
    }, this);
};

Model.prototype.addProperty = function(name, options){
    this.assertHasProperty(name);
};

Model.prototype.assertHasProperty = function(name){
    if (!this.hasProperty(name)) {
        throw new Error(this.modelName + ' has no property "' + name + '".');
    }
};

Model.prototype.hasProperty = function(name){
    return this.constructor.properties.hasOwnProperty(name);
};

Model.prototype.__defineGetter__('modelName', function(){
    return this.constructor.modelName;
});

exports.create = function(name, props){
    function subclass(){ Model.apply(this, arguments); }
    subclass.modelName = name;
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