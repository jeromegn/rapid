
/*!
 * Rapid - Collection
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var utils = require('./utils');

/**
 * Initialize a new `Collection` with optional `arr` of records.
 *
 * @param {Array} arr
 * @api public
 */

var Collection = exports = module.exports = function Collection(arr){
    if (Array.isArray(arr)) {
        this.push.apply(this, arr);
    }
};

/**
 * Inherit from Array;
 */

Collection.prototype.__proto__ = Array.prototype;

/**
 * Save the collection and callback `fn`.
 *
 * @param {Function} fn
 * @api public
 */

Collection.prototype.save = function(fn){
    var pending = len = this.length,
        failed;
    for (var i = 0; i < len; ++i) {
        var record = this[i];
        record.save(function(err){
            if (err) {
                if (!failed) failed = true, fn(err);
                return;
            }
            --pending || fn();
        });
    }
};

/**
 * Destroy the collection and callback `fn`.
 *
 * @param {Function} fn
 * @api public
 */

Collection.prototype.destroy = function(fn){
    var pending = len = this.length,
        failed;
    for (var i = 0; i < len; ++i) {
        var record = this[i];
        record.destroy(function(err){
            if (err) {
                if (!failed) failed = true, fn(err);
                return;
            }
            --pending || fn();
        });
    }
};

/**
 * Find records via the given `props`.
 *
 * @param {Object} props
 * @return {Collection}
 * @api public
 */

Collection.prototype.find = function(props){
    this.props = this.props || {};
    utils.merge(this.props, props, true);
    return this;
};

/**
 * Filter the given `record` based in `this` Collection's configuration.
 *
 * @param {Model} record
 * @return {Boolean}
 * @api public
 */

Collection.prototype.filter = function(record){
    // Filter by properties
    if (this.props) {
        var keys = Object.keys(this.props);
        for (var i = 0, len = keys.length; i < len; ++i) {
            var key = keys[i],
                prop = this.props[key],
                val = record[key];
            if (isOperator(prop)) {
                if ('gt' in prop && val <= prop.gt)  return false;
                if ('gte' in prop && val < prop.gte) return false;
                if ('lt' in prop && val >= prop.lt)  return false;
                if ('lte' in prop && val > prop.lte) return false;
            } else if (prop instanceof RegExp) {
                if (!prop.test(val)) {
                    return false;
                }
            } else if (val !== prop){
                return false;
            }
        }
    }
    
    return true;
};

/**
 * Check if the given `obj` contains operators. 
 *
 *  - gt  | >
 *  - gte | >=
 *  - lt  | <
 *  - lte | <=
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isOperator(obj) {
    if (typeof obj !== 'object') return;
    if ('<' in obj) obj.lt = obj['<'];
    if ('<=' in obj) obj.lte = obj['<='];
    if ('>' in obj) obj.gt = obj['>'];
    if ('>=' in obj) obj.gte = obj['>='];
    return 'gt' in obj
        || 'gte' in obj
        || 'lt' in obj
        || 'lte' in obj;
};

