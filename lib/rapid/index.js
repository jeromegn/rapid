
/*!
 * Rapid
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Model = require('./model');

/**
 * Library version.
 * 
 * @type String
 */

exports.version = '0.0.1';

/**
 * Expose `model.create()` as `rapid.createModel()`.
 */

exports.Model = Model;
exports.createModel = Model.create;