
/**
 * Module dependencies.
 */

var rapid = require('rapid'),
    types = rapid.types;

module.exports = {
    'test "string"': function(assert){
        assert.equal('test', types.string.save('test'), 'test "string" string support ;)');
        assert.equal('test', types.string.save(new Buffer('test')), 'test "string" Buffer support');
        assert.equal('15', types.string.save(15), 'test "string" Number support');
        assert.throws(function(){ types.string.save(new Date); });
    }
};