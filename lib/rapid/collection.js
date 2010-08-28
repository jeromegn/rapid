
/*!
 * Rapid - Collection
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

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

Collection.prototype.save = iterate('save');

/**
 * Destroy the collection and callback `fn`.
 *
 * @param {Function} fn
 * @api public
 */

Collection.prototype.destroy = iterate('destroy');

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