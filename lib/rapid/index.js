
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
 * Expose model methods.
 */

exports.Model = Model;
exports.createModel = Model.create;

/**
 * Expose validations.
 */

exports.validations = require('./validations');

/**
 * Expose type definitions.
 */

exports.types = require('./types');

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