
/*!
 * Rapid - Collection
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var Collection = exports = module.exports = function Collection(){};

Collection.prototype.__proto__ = Array.prototype;

Collection.prototype.save = function(fn){
    call(this, 'save', fn);
};

Collection.prototype.destroy = function(fn){
    call(this, 'destroy', fn);
};

function call(collection, method, fn) {
    var pending = len = collection.length;
    for (var i = 0; i < len; ++i) {
        var record = collection[i];
        record[method](function(err){
            if (err) return fn(err);
            --pending || fn();
        });
    }
};