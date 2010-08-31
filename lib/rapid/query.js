
/*!
 * Rapid - Query
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Collection = require('./collection');

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
 * Iterate query results passing a `Collection` to the given callback `fn`.
 *
 * @param {Function} fn
 * @api public
 */

Query.prototype.all = function(fn){
    // TODO: optimize with set? faster operation + prevent substr
    // TODO: break into Query#each()
    var model = this.model;
    model.keys(function(err, keys){
        if (err) return fn(err);
        var pending = keys.length,
            records = new Collection;
        keys.forEach(function(key, i){
            key = key.toString();
            var id = key.substr(key.indexOf(':') + 1, key.length);
            model.get(id, function(err, record){
                if (err) return fn(err);
                records.push(record);
                --pending || fn(null, records);
            });
        });
    });
};
