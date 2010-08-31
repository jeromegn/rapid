
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
 * Initialize a new `Query`.
 *
 * @api public
 */

var Query = exports = module.exports = function Query(){

};

/**
 * Inherit from Collection;
 */

Query.prototype.__proto__ = Collection.prototype;