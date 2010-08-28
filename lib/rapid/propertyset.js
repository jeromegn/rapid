
/*!
 * Rapid - PropertySet
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Initialize a new `PropertySet`.
 *
 * @api public
 */

var PropertySet = exports = module.exports = function PropertySet(){
    this.props = {};
    this.vals = {};
};

/**
 * Set prop `name`.
 *
 * @param {String} name
 * @param {Object} prop
 * @return {Object}
 * @api public
 */

PropertySet.prototype.set = function(name, prop){
    return this.props[name] = prop;
};

/**
 * Get prop `name`.
 *
 * @param {String} name
 * @return {Object}
 * @api public
 */

PropertySet.prototype.get = function(name){
    return this.props[name];
};

/**
 * Check if the prop `name` exists.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

PropertySet.prototype.has = function(name){
    return this.get(name) !== undefined;
};

/**
 * Iterate properties with the given callback `fn` and optional `scope`.
 *
 * @param {Function} fn
 * @param {Mixed} scope
 * @api public
 */

PropertySet.prototype.each = function(fn, scope){
    var keys = Object.keys(this.props);
    for (var i = 0, len = keys.length; i < len; ++i) {
        var key = keys[i];
        fn.call(scope, this.props[key]);
    }
};