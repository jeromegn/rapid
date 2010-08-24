
/*!
 * Rapid - Validations
 * Copyright(c) 2010 TJ Holowaychukt <tj@vision-media.ca>
 * MIT Licensed
 */

exports.required = function(record, prop, fn){
    if (record[prop.name] == null) {
        fn(new Error(record.modelName + ' ' + prop.name + ' is required'));
    } else {
        fn();
    }
};

exports.min = function(record, prop, fn){
    var val = record[prop.name];
    if (val !== undefined && val < prop.min) {
        fn(new Error(record.modelName + ' ' + prop.name
            + ' ' + val + ' is below the minimum of ' + prop.min));
    } else {
        fn();
    }
};

exports.max = function(record, prop, fn){
    var val = record[prop.name];
    if (val !== undefined && val > prop.max) {
        fn(new Error(record.modelName + ' ' + prop.name
            + ' ' + val + ' is above the maximum of ' + prop.max));
    } else {
        fn();
    }
};