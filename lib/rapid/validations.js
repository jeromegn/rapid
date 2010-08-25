
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
    'email': /^([\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*[\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+@((((([a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(\d{1,3}\.){3}\d{1,3}(\:\d{1,5})?)$/i,
    'postal-code': {
        match: /^ *[a-zA-Z]\d[a-zA-Z] *\d[a-zA-Z]\d *$/,
        normalize: function(val){
            return val.replace(' ', '').toLowerCase();
        }
    }
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
        format = formats[prop.format] || prop.format,
        normalize = format.normalize;

    if (format.match) format = format.match; 

    if (!(format instanceof RegExp)) {
        throw new Error('"' + prop.format + '" is an invalid format');
    }

    if (val !== undefined) {
        if (format.test(val)) {
            if (normalize) {
                record[prop.name] = normalize(val);
            }
        } else {
            err = new Error(record.modelName + ' ' + prop.name
                + ' format is invalid');
        }
    }
    fn(err);
};