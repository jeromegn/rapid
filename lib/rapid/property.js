
/*!
 * Rapid - Property
 * Copyright(c) 2010 TJ Holowaychuk <tj@vision-media.ca>
 * MIT Licensed
 */

var Property = exports = module.exports = function Property(name, options) {
    this.name = name;
    this.type = options.type;
};

Property.prototype.inspect = function(){
    return '[Property:' + this.name 
        + ' type:' + this.type
        + ']';
};
