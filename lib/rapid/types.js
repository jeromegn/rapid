
/*!
 * Rapid - Types
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

exports.string = {
    dump: function(val){
        switch (typeof val) {
            case 'string': return val;
            case 'number': return val.toString();
            default:
                if (Buffer.isBuffer(val)) {
                    return val.toString();
                } else {
                    throw new Error;
                }
        }
    }
};

exports.date = {
    dump: function(val){
        if (val instanceof Date) {
            return Number(val).toString();
        } else {
            throw new Error;
        }
    },
    
    load: function(val){
        val = parseInt(val, 10);
        if (isNaN(val)) throw new Error;
        val = new Date(val);
        if (isNaN(val)) throw new Error;
        return new Date(val);
    }
};