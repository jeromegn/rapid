
/*!
 * Rapid - Query
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Initialize a new `Query`.
 *
 * @api public
 */

var Query = exports = module.exports = function Query(){

};

/**
 * Inherit from Array;
 */

Query.prototype.__proto__ = Array.prototype;

/**
 * Save the collection and callback `fn`.
 *
 * @param {Function} fn
 * @api public
 */

Query.prototype.save = iterate('save');

/**
 * Destroy the collection and callback `fn`.
 *
 * @param {Function} fn
 * @api public
 */

Query.prototype.destroy = iterate('destroy');

/**
 * Iteration helper.
 */

function iterate(method) {
    return function(fn){
        var pending = len = this.length;
        for (var i = 0; i < len; ++i) {
            var record = this[i];
            record[method](function(err){
                if (err) return fn(err);
                --pending || fn();
            });
        }
    };
};