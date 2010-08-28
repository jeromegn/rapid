
/*!
 * Rapid - Types
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

exports.id = {
    coerce: function(val){
        if (typeof val !== 'string' || val.length !== 32) {
            throw new Error;
        }
        return val;
    },
    load: function(val){
        return val;
    }
};

exports.binary = {
    coerce: function(val) {
        if (!Buffer.isBuffer(val)) {
            throw new Error;
        }
        return val;
    },
    load: function(val){
        return val;
    }
};

exports.string = {
    coerce: function(val){
        switch (typeof val) {
            case 'string': 
                return val;
            case 'number': 
                return val.toString();
            default:
                if (Buffer.isBuffer(val)) {
                    return val.toString();
                } else {
                    throw new Error;
                }
        }
    },
    load: function(val){
        return val.toString();
    }
};

exports.date = {
    coerce: function(val){
        if (val instanceof Date) {
            return val;
        } else {
            throw new Error;
        }
    },
    dump: function(val){
        return Number(val).toString();
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
    coerce: function(val){
        return val;
    },
    dump: function(val){
        return JSON.stringify(val);
    },
    load: function(val){
        return JSON.parse(val.toString());
    }
};

exports.number = {
    coerce: function(val){
        switch (typeof val) {
            case 'string':
                val = parseFloat(val);
                if (isNaN(val)) throw new Error;
            case 'number':
                return val;
            default:
                throw new Error;
        }
    },
    dump: function(val){
        return val.toString();
    },
    load: function(val){
        val = parseFloat(val.toString());
        if (isNaN(val)) throw new Error;
        return val;
    }
};

exports.bool = exports.boolean = {
    coerce: function(val){
        switch (val) {
            case 'true':
            case 't':
            case '1':
                return true;
            case 'false':
            case 'f':
            case '0':
                return false;
            default:
                return !!val;
        }
        return new Buffer(val ? '1' : '0');
    },
    dump: function(val){
        return new Buffer(val ? '1' : '0');
    },
    load: function(val){
        return val[0] === 49;
    }
};