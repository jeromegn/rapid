
/*!
 * Rapid - Validations
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var sys = require('sys');

var formats = exports.formats = {
    'postal-code': /^[a-zA-Z]\d[a-zA-Z]\d[a-zA-Z]\d$/
};

exports.required = function(record, prop, fn){
    var err;
    if (record[prop.name] == null) {
        err = new Error(record.modelName + ' ' + prop.name + ' is required');
    }
    fn(err);
};

exports.min = function(record, prop, fn){
    var err, val = record[prop.name];
    if (val !== undefined) {
        switch (typeof val) {
            case 'number':
                if (val < prop.min) {
                    err = new Error(record.modelName + ' ' + prop.name
                        + ' ' + val 
                        + ' is below the minimum of ' + prop.min);
                }
                break;
            case 'string':
                if (val.length < prop.min) {
                    err = new Error(record.modelName + ' ' + prop.name
                        + ' ' + sys.inspect(val) 
                        + ' is below the minimum length of ' + prop.min);
                }
                break;
        }
    }
    fn(err);
};

exports.max = function(record, prop, fn){
    var err, val = record[prop.name];
    if (val !== undefined) {
        switch (typeof val) {
            case 'number':
                if (val > prop.max) {
                    err = new Error(record.modelName + ' ' + prop.name
                        + ' ' + val 
                        + ' is above the maximum of ' + prop.max);
                }
                break;
            case 'string':
                if (val.length > prop.max) {
                    err = new Error(record.modelName + ' ' + prop.name
                        + ' ' + sys.inspect(val) 
                        + ' is above the maximum length of ' + prop.max);
                }
                break;
        }
    }
    fn(err);
};

exports.format = function(record, prop, fn){
    var err, normalize,
        val = record[prop.name],
        format = formats[prop.format] || prop.format;

    if (!(format instanceof RegExp)) {
        throw new Error('"' + prop.format + '" is an invalid format');
    }

    if (val !== undefined) {
        if (!format.test(val)) {
            err = new Error(record.modelName + ' ' + prop.name
                + ' format is invalid');
        }
    }
    fn(err);
};