
/*!
 * Rapid - Model
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var rapid = require('./index'),
    utils = require('./utils'),
    sys = require('sys');

var Model = exports = module.exports = function Model(props) {
    this.db = this.constructor.db;
    this.new = this.stale = true;
    // TODO: proper uid
    this.addProperty('id', Math.random());
    if (props) {
        this.addProperties(props);
    }
};

Model.prototype.addProperties = function(props){
    Object.keys(props).forEach(function(name){
        this.addProperty(name, props[name]);
    }, this);
};

Model.prototype.addProperty = function(name, val){
    this.assertHasProperty(name);
    this[name] = val;
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

Model.prototype.__defineGetter__('key', function(){
    return this.modelName + ':' + this.id;
});

Model.prototype.__defineGetter__('properties', function(){
    return this.constructor.properties;
});

Model.prototype.eachProperty = function(fn, scope){
    var props = this.properties,
        keys = Object.keys(props);
    for (var i = 0, len = keys.length; i < len; ++i) {
        fn.call(scope || this, props[keys[i]], keys[i]);
    }
};

Model.prototype.save = function(fn){
    var self = this;

    if (!this.stale) return fn();

    this.validate(function(err){
        if (err) return fn(err);
        self.saveProperties(function(err){
            if (err) return fn(err);
            self.new = self.stale = false;
            fn();
        });
    });
};

Model.prototype.validate = function(fn){
    fn();
};

Model.prototype.saveProperties = function(fn){
    var pending = 0;
    this.eachProperty(function(options, name){
        ++pending;
        this.saveProperty(name, function(err){
            if (err) {
                fn(err);
            } else {
                --pending || fn();
            }
        });
    });
};

Model.prototype.saveProperty = function(name, fn){
    var val = this[name];
    this.db.hset(this.key, name, val, fn);
};

Model.prototype.inspect = function(){
    return '[' + this.modelName 
        + (this.stale ? ' stale' : '')
        + (this.new ? ' new' : '')
        + this.inspectProperties()
        + ']';
};

Model.prototype.inspectProperties = function(){
    var str = '';
    this.eachProperty(function(options, name){
        str += '\n  ' + name + ': ' + sys.inspect(options.val);
    });
    return str + '\n';
};

exports.create = function(name, props){
    function subclass(){ Model.apply(this, arguments); }
    subclass.db = rapid.client;
    subclass.modelName = name;
    subclass.prototype.__proto__ = Model.prototype;
    subclass.properties = {};
    utils.merge(subclass, exports.classMethods);
    subclass.addProperty('id', { type: 'Number' });
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
        this.prototype.__defineGetter__(name, function(){
            return this.properties[name].val;
        });
        this.prototype.__defineSetter__(name, function(val){
            this.stale = true;
            this.properties[name].val = val;
        });
    },
    
    clear: function(fn){
        var db = this.db;
        db.keys(this.modelName + ':*', function(err, keys){
            if (err || !keys) return fn(err);
            var pending = keys.length;
            keys.forEach(function(key){
                db.del(key, function(err){
                    if (err) return fn(err);
                    --pending || fn();
                });
            });
        });
    }
};