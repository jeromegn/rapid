
/*!
 * Rapid - Types
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

exports.binary = {
    dump: function(val) {
        return val;
    },
    load: function(val){
        return val;
    }
}

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
        val = parseInt(val.toString(), 10);
        if (isNaN(val)) throw new Error;
        val = new Date(val);
        if (isNaN(val)) throw new Error;
        return new Date(val);
    }
};

exports.json = {
    dump: JSON.stringify,
    load: function(val){
        return JSON.parse(val.toString());
    }
};

exports.number = {
    dump: function(val){
        switch (typeof val) {
            case 'number':
                return val;
            case 'string':
                val = parseFloat(val);
                if (isNaN(val)) throw new Error;
                return val;
        }
    },
    load: function(val){
        val = parseFloat(val.toString());
        if (isNaN(val)) throw new Error;
        return val;
    }
}