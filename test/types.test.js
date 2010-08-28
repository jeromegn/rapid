
/**
 * Module dependencies.
 */

var rapid = require('rapid'),
    types = rapid.types;

module.exports = {
    'test "string"': function(assert){
        assert.equal('test', types.string.save('test'), 'test "string" string support');
        assert.equal('test', types.string.save(new Buffer('test')), 'test "string" Buffer support');
        assert.equal('15', types.string.save(15), 'test "string" Number support');
        assert.throws(function(){ types.string.save(new Date); });
        assert.throws(function(){ types.string.save(); });
    },

    'test "date"': function(assert){
        var date = new Date('may 25 1987'),
            timestamp = Number(date).toString();
        assert.equal(timestamp, types.date.save(date), 'test "date" Date support');
        assert.throws(function(){ types.date.save('fail'); });
        assert.throws(function(){ types.date.save(123123); });
        assert.throws(function(){ types.date.save(); });
        
        assert.equal(date.toString(), types.date.load(timestamp));
    }
};