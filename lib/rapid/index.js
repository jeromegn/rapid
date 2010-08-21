
/*!
 * Rapid
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Model = require('./model'),
    redis = require('./redis/lib/redis-client');

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

/**
 * Redis client singleton.
 */

var client;

/**
 * Return / assign redis client singleton when not present.
 *
 * @api public
 */

exports.__defineGetter__('client', function(){
    return client = client || redis.createClient();
});