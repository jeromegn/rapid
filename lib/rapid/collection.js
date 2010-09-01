
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
