
/*!
 * Rapid - Validations
 * Copyright(c) 2010 TJ Holowaychukt <tj@vision-media.ca>
 * MIT Licensed
 */

exports.required = function(record, prop, fn){
    if (record[prop.name] == null) {
        fn(new Error(record.modelName + ' "' + prop.name + '" is required.'));
    } else {
        fn();
    }
};