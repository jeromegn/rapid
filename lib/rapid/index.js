
/*!
 * Rapid
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var Model = require('./model'),
    Query = require('./query'),
    Collection = require('./collection'),
    redis = require('redis');

/**
 * Library version.
 * 
 * @type String
 */

exports.version = '0.0.2';

/**
 * Expose the redis library.
 */

exports.redis = redis;

/**
 * Expose collection.
 */

exports.Collection = Collection;

/**
 * Expose query.
 */

exports.Query = Query;

/**
 * Expose model.
 */

exports.Model = Model;
exports.model = Model.create;

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

/**
 * Assign a custom redis client.
 * 
 * @api public
 */

exports.__defineSetter__('client', function(val){
    client = val;
});

/**
 * Return a graph string that can processed with `dot` to generate
 * a visualization of your models.
 *
 * @return {String}
 * @api public
 */

exports.graph = function(){
    var buf = 'digraph structs {\n',
        models = Model.models;
    for (var key in models) {
        var model = models[key];
        buf += '  ' + model.modelName + ' [shape=record,label="' + model.graphLabel() + '"];\n';
    }
    return buf + '\n}';
};
