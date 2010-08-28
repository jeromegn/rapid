
/*!
 * Rapid - Collection
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var Collection = exports = module.exports = function Collection(){};

Collection.prototype.__proto__ = Array.prototype;

Collection.prototype.save = iterate('save');

Collection.prototype.destroy = iterate('destroy');

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