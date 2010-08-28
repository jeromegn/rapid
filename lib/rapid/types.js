
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
            case 'string': 
                return new Buffer(val);
            case 'number': 
                return new Buffer(val.toString());
            default:
                if (Buffer.isBuffer(val)) {
                    return val;
                } else {
                    throw new Error;
                }
        }
    }
};

exports.date = {
    dump: function(val){
        if (val instanceof Date) {
            return new Buffer(Number(val).toString());
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
    dump: function(val){
        return new Buffer(JSON.stringify(val));
    },
    load: function(val){
        return JSON.parse(val.toString());
    }
};

exports.number = {
    dump: function(val){
        if (typeof val === 'string') {
            val = parseFloat(val);
            if (isNaN(val)) throw new Error;
        }
        return new Buffer(val.toString());
    },
    load: function(val){
        val = parseFloat(val.toString());
        if (isNaN(val)) throw new Error;
        return val;
    }
}