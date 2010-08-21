
/*!
 * Rapid - Utils
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Merge object `b` with object `a`.
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object} a
 * @api private
 */

exports.merge = function(a, b){
    var keys = Object.keys(b);
    for (var i = 0, len = keys.length; i < len; ++i) {
        a[keys[i]] = b[keys[i]];
    }
    return a;
};