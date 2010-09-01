
/*!
 * Rapid - Query
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Collection = require('./collection'),
    utils = require('./utils');

/**
 * Initialize a new `Query` with the given `model` and `options`.
 *
 * @param {Function} model
 * @param {Object} options
 * @api public
 */

var Query = exports = module.exports = function Query(model, options){
    options = options || {};
    this.model = model;
    this.props = options.props;
};

/**
 * Iteration helper.
 */

Query.prototype.__proto__ = Collection.prototype;

/**
 * Iterate records with the given callback `fn`
 * and `done` callback which is called when an exception
 * occurs or when all records have been fetched.
 *
 * @param {Function} fn
 * @param {Function} done
 * @api public
 */

Query.prototype.each = function(fn, done){
    var self = this,
        model = this.model;
    model.keys(function(err, keys){
        if (err) return done(err);
        var pending = keys.length,
            failed;
        keys.forEach(function(key, i){
            var key = key.toString(),
                id = key.substr(key.indexOf(':') + 1, key.length);
            model.get(id, function(err, record){
                if (err) {
                    if (!failed) failed = true, done(err);
                    return;
                }
                if (self.filter(record)) fn(record);
                --pending || done();
            });
        });
    });
};

/**
 * Iterate query results passing a `Collection` to the given callback `fn`.
 *
 * @param {Function} fn
 * @api public
 */

Query.prototype.all = function(fn){
    // TODO: optimize with set? faster operation + prevent substr
    // TODO: break into Query#each()
    var self = this,
        model = this.model;
    model.keys(function(err, keys){
        if (err) return fn(err);
        var pending = keys.length,
            records = new Collection,
            failed;
        keys.forEach(function(key, i){
            key = key.toString();
            var id = key.substr(key.indexOf(':') + 1, key.length);
            model.get(id, function(err, record){
                if (err) {
                    if (!failed) failed = true, fn(err);
                    return;
                }
                if (self.filter(record)) records.push(record);
                --pending || fn(null, records);
            });
        });
    });
};

/**
 * Find records via the given `props`.
 *
 * @param {Object} props
 * @return {Query}
 * @api public
 */

Query.prototype.find = function(props){
    utils.merge(this.props, props, true);
    return this;
};

Query.prototype.filter = function(record){
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
