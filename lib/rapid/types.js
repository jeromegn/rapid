
/*!
 * Rapid - Types
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

exports.string = {
    save: function(val){
        switch (typeof val) {
            case 'string': return val;
            case 'number': return val.toString();
            default:
                if (Buffer.isBuffer(val)) {
                    return val.toString();
                } else {
                    throw new ArgumentError;
                }
        }
    }
};

exports.date = {
    save: function(val){
        if (val instanceof Date) {
            return Number(val).toString();
        } else {
            throw new ArgumentError;
        }
    },
    
    load: function(val){
        return new Date(parseInt(val, 10));
    }
};