
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
    Collection = require('./collection'),
    Query = require('./query'),
    utils = require('./utils'),
    types = require('./types'),
    sys = require('sys');

/**
 * Initialize a new `Model` with the given `props`.
 *
 * @param {Object} props
 * @api public
 */

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

/**
 * Expose model registry.
 * 
 * @type Object
 */

var models = exports.models = {};

/**
 * Add the given `props`.
 *
 * @param {Object} props
 * @api public
 */

Model.prototype.addProperties = function(props){
    Object.keys(props).forEach(function(name){
        this.addProperty(name, props[name]);
    }, this);
};

/**
 * Add the given property `name` and `val`.
 *
 * @param {String} name
 * @param {Mixed} val
 * @api public
 */

Model.prototype.addProperty = function(name, val){
    var prop = this.properties.get(name);
    if (prop) {
        var type = types[prop.type];
        this[name] = type.load(val);
    } else {
        this[name] = val;
    }
};

/**
 * Return the model constructor name.
 *
 * @return {String}
 * @api public
 */

Model.prototype.__defineGetter__('modelName', function(){
    return this.constructor.modelName;
});

/**
 * Return the record's key. Generated by combining the 
 * modelname, and the record id, for example User:123123123123.
 *
 * @return {String}
 * @api public
 */

Model.prototype.__defineGetter__('key', function(){
    return this.modelName + ':' + this.id;
});

/**
 * Return model properties.
 *
 * @return {PropertySet}
 * @api public
 */

Model.prototype.__defineGetter__('properties', function(){
    return this.constructor.properties;
});

/**
 * Save the record and callback `fn`.
 *
 * @param {Function} fn
 * @api public
 */

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

/**
 * Update the given `props`, then save the record with the callback `fn`.
 *
 * @param {Object} props
 * @param {Function} fn
 * @api public
 */

Model.prototype.update = function(props, fn){
    var keys = Object.keys(props);
    for (var i = 0, len = keys.length; i < len; ++i) {
        var key = keys[i],
            val = props[key];
        this[key] = val;
    }
    this.save(fn);
};

/**
 * Destroy the record and callback `fn`.
 *
 * @param {Function} fn
 * @api public
 */

Model.prototype.destroy = function(fn){
    if (this.new || this.destroyed) {
        fn();
    } else {
        var self = this;
        this.db.del(this.key, function(err){
            if (err) return fn(err);
            self.destroyed = true;
            fn();
        });
    }
};

/**
 * Validate the model and callback `fn`.
 *
 * @param {Function} fn
 * @api public
 */

Model.prototype.validate = function(fn){
    var self = this,
        pending = 0,
        failed;
    this.properties.each(function(prop){
        Object.keys(prop).forEach(function(key){
            if (~validations.indexOf(key)) {
                ++pending;
                process.nextTick(function(){
                    validate[key](self, prop, function(err){
                        if (err) {
                            if (!failed) {
                                failed = true;
                                self.error = err;
                                err.record = self;
                                err.property = prop;
                                fn(err);
                            }
                            return;
                        }
                        --pending || fn();
                    });
                });
            }
        });
    });
};

/**
 * Attempt to save all properties, and callback `fn`.
 *
 * @param {Function} fn
 * @api private
 */

Model.prototype.saveProperties = function(fn){
    var pending = 0,
        failed;
    this.properties.each(function(prop){
        ++pending;
        var self = this;
        process.nextTick(function(){
            self.saveProperty(prop.name, function(err){
                if (err) {
                    if (!failed) failed = true, fn(err);
                    return;
                }
                --pending || fn();
            });
        });
    }, this);
};

/**
 * Attempt to save property `name` and callback `fn`.
 *
 * @param {String} name
 * @param {Function} fn
 * @api private
 */

Model.prototype.saveProperty = function(name, fn){
    var val = this[name],
        prop = this.properties.get(name),
        type = types[prop.type];

    // Default support
    if (val === undefined && prop.default !== undefined) {
        this.values[name] = val = prop.default; 
    }

    // Update the property value
    if (type) {
        if (val !== undefined) {
            this.values[name] = val = type.coerce(val);
        }
    } else {
        fn(new Error(prop.type + ' is an invalid property type'));
    }

    // Save the property
    if (val === undefined) {
        fn();
    } else {
        this.db.hset(this.key, name, type.dump(val), fn);
    }
};

/**
 * Inspect the record.
 *
 * @return {String}
 * @api public
 */

Model.prototype.inspect = function(){
    return '[' + this.modelName
        + (this.destroyed ? ' destroyed' : '')
        + (this.stale ? ' stale' : '')
        + (this.new ? ' new' : '')
        + this.inspectProperties()
        + ']';
};

/**
 * Inspect properties, used by `#inspect()`.
 *
 * @return {String}
 * @api private
 */

Model.prototype.inspectProperties = function(){
    var str = '';
    this.properties.each(function(prop){
        str += '\n  ' + prop.name + ': ' + sys.inspect(this[prop.name]);
    }, this);
    return str + '\n';
};

/**
 * Define a model by `name` with the given `props`, when
 * `props` is not present, return the model definition or `undefined`.
 *
 * @param {String} name
 * @param {Object} props
 * @return {Function}
 * @api public
 */

exports.create = function(name, props){
    if (!props) return models[name];

    // Subclass
    function subclass(){ Model.apply(this, arguments); }

    // Model collection
    (subclass.Collection = function(){
        Collection.apply(this, arguments);
    }).prototype.__proto__ = Collection.prototype;

    // Model Query
    (subclass.Query = function(){
        Query.apply(this, arguments);
    }).prototype.__proto__ = Query.prototype;

    // Assign subclass static methods etc
    subclass.db = rapid.client;
    subclass.modelName = name;
    subclass.prototype.__proto__ = Model.prototype;
    subclass.properties = new PropertySet;
    utils.merge(subclass, exports.methods);
    subclass.addProperty('id', { type: 'id' });
    subclass.addProperties(props);
    models[name] = subclass;

    return subclass;
};

/**
 * Static methods.
 * 
 * @type Object
 */

exports.methods = {
    
    /**
     * Add the given `props`.
     *
     * @param {Object} props
     * @api private
     */
    
    addProperties: function(props){
        Object.keys(props).forEach(function(name){
            var desc = Object.getOwnPropertyDescriptor(props, name);
            if (desc.get || desc.set) {
                Object.defineProperty(this.prototype, name, desc);
            } else if (typeof desc.value === 'function') {
                this.prototype[name] = desc.value;
            } else {
                this.addProperty(name, props[name]);
            }
        }, this);
    },
    
    /**
     * Add property `name` with `prop`.
     *
     * @param {String} name
     * @param {Object} prop
     * @api private
     */
    
    addProperty: function(name, prop){
        this.properties.set(name, prop);
        this.addPropertyGetter(name);
        this.addPropertySetter(name);
    },
    
    /**
     * Add property getter for `name`,
     * returning the internal value.
     *
     * @param {String} name
     * @api private
     */
    
    addPropertyGetter: function(name){
        this.prototype.__defineGetter__(name, function(){
            return this.values[name];
        });
    },
    
    /**
     * Add property setter for `name`,
     * setting the record as stale, and 
     * assigning the new property value.
     *
     * @param {String} name
     * @api private
     */
    
    addPropertySetter: function(name){
        this.prototype.__defineSetter__(name, function(val){
            this.stale = true;
            this.values[name] = val;
        });
    },
    
    /**
     * Clear all model records and callback `fn`.
     *
     * @param {Function} fn
     * @api public
     */
    
    clear: function(fn){
        var db = this.db,
            failed;
        db.keys(this.modelName + ':*', function(err, keys){
            if (err || !keys) return fn(err);
            var pending = keys.length;
            keys.forEach(function(key){
                db.del(key, function(err){
                    if (err) {
                        if (!failed) failed = true, fn(err);
                        return;
                    }
                    --pending || fn();
                });
            });
        });
    },
    
    /**
     * Get record by `id` and callback `fn`.
     *
     * @param {String} id
     * @param {Function} fn
     * @api public
     */
    
    get: function(id, fn){
        var self = this,
            key = this.modelName + ':' + id;
        this.db.hgetall(key, function(err, props){
            if (err || !props) return fn(err);
            fn(null, new self(props));
        });
    },
    
    /**
     * Fetch keys and callback `fn`.
     *
     * @param {Function} fn
     * @api public
     */
    
    keys: function(fn){
        this.db.keys(this.modelName + ':*', function(err, keys){
            if (err) return fn(err);
            fn(undefined, keys);
        });
    },
    
    /**
     * Fetch record count and callback `fn`.
     *
     * @param {Function} fn
     * @api public
     */
    
    count: function(fn){
        this.keys(function(err, keys){
            if (err) return fn(err);
            fn(undefined, keys ? keys.length : 0);
        });
    },
    
    /**
     * Find records via the given `props`.
     *
     * @param {Object} props
     * @return {Query}
     * @api public
     */
    
    find: function(props){
        return new this.Query(this, {
            props: props
        });
    },
    
    /**
     * Iterate records with the given callback `fn`
     * and `done` callback which is called when an exception
     * occurs or when all records have been fetched.
     *
     * @param {Function} fn
     * @param {Function} done
     * @api public
     */
    
    each: function(fn, done){
        return new this.Query(this).each(fn, done);
    },
    
    /**
     * Fetch a `Collection` of all records and callback `fn`.
     *
     * @param {Function} fn
     * @api public
     */
    
    all: function(fn){
        return new this.Query(this).all(fn);
    },
    
    /**
     * Return a graph label for this model.
     *
     * @return {String}
     * @api public
     */
    
    graphLabel: function(){
        var label = this.modelName;
        this.properties.each(function(prop){
            label += ' | { ' + prop.name + ' | ' + prop.type + ' }';
        });
        return '{<f0>' + label + '}';
    }
};