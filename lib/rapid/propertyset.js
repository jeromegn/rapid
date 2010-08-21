
/*!
 * Rapid - PropertySet
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var sys = require('sys');

var PropertySet = exports = module.exports = function PropertySet(){
    this.props = {};
    this.vals = {};
};

PropertySet.prototype.set = function(name, prop){
    this.props[name] = prop;
};

PropertySet.prototype.get = function(name){
    return this.props[name];
};

PropertySet.prototype.has = function(name){
    return this.get(name) !== undefined;
};

PropertySet.prototype.each = function(fn, scope){
    var keys = Object.keys(this.props);
    for (var i = 0, len = keys.length; i < len; ++i) {
        var key = keys[i];
        fn.call(scope, this.vals[key], key, this.props[key]);
    }
};

PropertySet.prototype.inspect = function(){
    return '<PropertySet ' + this.inspectProperties() + '>';
};

PropertySet.prototype.inspectProperties = function(){
    var str = '';
    this.each(function(val, name, options){
        if (name === 'id') return;
        str += '\n  ' + name + ': ' + sys.inspect(val);
    });
    return str + '\n';
};