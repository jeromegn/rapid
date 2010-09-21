
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
 * @param {Boolean} deep
 * @return {Object} a
 * @api private
 */

exports.merge = function(a, b, deep){
    var keys = Object.keys(b);
    for (var i = 0, len = keys.length; i < len; ++i) {
        var key = keys[i];
        if (deep
            && Object.prototype.toString.call(a[key]) === '[object Object]'
            && Object.prototype.toString.call(b[key]) === '[object Object]') {
            exports.merge(a[key], b[key]);
        } else {
            a[key] = b[key];
        }
    }
    return a;
};

/**
 * Return a 32bit UID.
 *
 * @return {String}
 * @api public
 */

exports.uid = function(){
    return s() + s() + s() + s() + s() + s() + s() + s();
};

/**
 * UID segment helper.
 *
 * @return {String}
 * @api private
 */

function s() {
   return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}