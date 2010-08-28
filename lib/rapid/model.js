
/*!
 * Rapid - Model
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var rapid = require('./index'),
    PropertySet = require('./propertyset'),
    validate = require('./validations'),
    validations = Object.keys(validate),
    utils = require('./utils'),
    types = require('./types'),
    sys = require('sys');

var Model = exports = module.exports = function Model(props) {
    this.db = this.constructor.db;
    this.values = {};
    if (props) this.addProperties(props);
    if (this.id) {
        this.new = this.stale = false;
    } else {
        this.addProperty('id', utils.uid());
        this.new = this.stale = true;
    }
};

var models = exports.models = {};

Model.prototype.addProperties = function(props){
    Object.keys(props).forEach(function(name){
        this.addProperty(name, props[name]);
    }, this);
};

Model.prototype.addProperty = function(name, val){
    this.assertHasProperty(name);
    var prop = this.properties.get(name),
        type = types[prop.type];
    this[name] = type.load(val);
};

Model.prototype.assertHasProperty = function(name){
    if (!this.properties.has(name)) {
        throw new Error(this.modelName + ' has no property "' + name + '".');
    }
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

Model.prototype.destroy = function(fn){
    fn();
};


Model.prototype.validate = function(fn){
    var self = this,
        pending = 0;
    this.properties.each(function(prop){
        Object.keys(prop).forEach(function(key){
            if (~validations.indexOf(key)) {
                ++pending;
                process.nextTick(function(){
                    validate[key](self, prop, function(err){
                        if (err) {
                            self.error = err;
                            err.record = self;
                            err.property = prop;
                            fn(err);
                        } else {
                            --pending || fn();
                        }
                    });
                });
            }
        });
    });
};

Model.prototype.saveProperties = function(fn){
    var pending = 0;
    this.properties.each(function(prop){
        ++pending;
        this.saveProperty(prop.name, function(err){
            if (err) {
                fn(err);
            } else {
                --pending || fn();
            }
        });
    }, this);
};

Model.prototype.saveProperty = function(name, fn){
    var val = this[name],
        prop = this.properties.get(name);

    // Default support
    if (val === undefined && prop.default !== undefined) {
        this.values[name] = val = prop.default; 
    }

    // Property coercion
    var type = types[prop.type];
    if (type) {
        if (val !== undefined) {
            this.values[name] = val = type.coerce(val);
        }
    } else {
        fn(new Error(type + ' is an invalid property type'));
    }

    // Save the property
    if (val === undefined) {
        fn();
    } else {
        this.db.hset(this.key, name, type.dump(val), fn);
    }
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
    this.properties.each(function(prop){
        str += '\n  ' + prop.name + ': ' + sys.inspect(this[prop.name]);
    }, this);
    return str + '\n';
};

exports.create = function(name, props){
    if (!props) return models[name];
    function subclass(){ Model.apply(this, arguments); }
    subclass.db = rapid.client;
    subclass.modelName = name;
    subclass.prototype.__proto__ = Model.prototype;
    subclass.properties = new PropertySet;
    utils.merge(subclass, exports.classMethods);
    subclass.addProperty('id', { type: 'id' });
    subclass.addProperties(props);
    models[name] = subclass;
    return subclass;
};

exports.classMethods = {
    addProperties: function(props){
        Object.keys(props).forEach(function(name){
            this.addProperty(name, props[name]);
        }, this);
    },
    
    addProperty: function(name, options){
        options.name = name;
        this.properties.set(name, options);
        this.addPropertyGetter(name);
        this.addPropertySetter(name);
    },
    
    addPropertyGetter: function(name){
        this.prototype.__defineGetter__(name, function(){
            return this.values[name];
        });
    },
    
    addPropertySetter: function(name){
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
    },
    
    keys: function(fn){
        this.db.keys(this.modelName + ':*', function(err, keys){
            if (err) return fn(err);
            fn(undefined, keys);
        });
    },
    
    count: function(fn){
        this.keys(function(err, keys){
            if (err) return fn(err);
            fn(undefined, keys.length);
        });
    }
};