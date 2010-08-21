
/*!
 * Rapid - Model
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var rapid = require('./index'),
    Property = require('./property'),
    utils = require('./utils'),
    sys = require('sys');

var Model = exports = module.exports = function Model(props) {
    this.db = this.constructor.db;
    this.values = {};
    if (props) this.addProperties(props);
    if (this.id) {
        this.new = this.stale = false;
    } else {
        // TODO: real uid
        this.addProperty('id', Math.floor(Math.random() * 0xFFFFFF));
        this.new = this.stale = true;
    }
};

Model.prototype.addProperties = function(props){
    Object.keys(props).forEach(function(name){
        this.addProperty(name, props[name]);
    }, this);
};

Model.prototype.addProperty = function(name, val){
    this.assertHasProperty(name);
    var options = this.properties[name];
    // TODO: abstract
    switch (options.type) {
        case 'String':
            val = val.toString();
            break;
        case 'Number':
            val = typeof val === 'number'
                ? val
                : parseInt(val.toString(), 10);
            break;
    }
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
        var key = keys[i];
        fn.call(scope || this, this.values[key], key, props[key]);
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
    this.eachProperty(function(val, name, options){
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
    if (val === undefined) {
        fn();
    } else {
        this.db.hset(this.key, name, val, fn);
    }
};

Model.prototype.inspect = function(){
    return '<' + this.modelName + ':' + this.id 
        + (this.stale ? ' stale' : '')
        + (this.new ? ' new' : '')
        + this.inspectProperties()
        + '>';
};

Model.prototype.inspectProperties = function(){
    var str = '';
    this.eachProperty(function(val, name, options){
        if (name === 'id') return;
        str += '\n  ' + name + ': ' + sys.inspect(val);
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
        this.properties[name] = new Property(name, options);
        this.prototype.__defineGetter__(name, function(){
            return this.values[name];
        });
        this.prototype.__defineSetter__(name, function(val){
            this.stale = true;
            this.values[name] = val;
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
    },
    
    get: function(id, fn){
        var self = this,
            key = this.modelName + ':' + id;
        this.db.hgetall(key, function(err, props){
            if (err) return fn(err);
            fn(null, new self(props));
        });
    }
};