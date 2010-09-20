
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
    var self = this,
        records = new this.model.Collection;
    this.each(function(record){
        records.push(record);
    }, function(err){
        fn(err, records);
    });
};
