
/**
 * Module dependencies.
 */

var rapid = require('rapid'),
    types = rapid.types;

module.exports = {
    'test "string"': function(assert){
        assert.equal('test', types.string.dump('test'), 'test "string" string support');
        assert.equal('test', types.string.dump(new Buffer('test')), 'test "string" Buffer support');
        assert.equal('15', types.string.dump(15), 'test "string" Number support');
        assert.throws(function(){ types.string.dump(new Date); });
        assert.throws(function(){ types.string.dump(); });
    },

    'test "date"': function(assert){
        var date = new Date('may 25 1987'),
            timestamp = Number(date).toString();
        assert.equal(timestamp, types.date.dump(date), 'test "date" Date support');
        assert.throws(function(){ types.date.dump('fail'); });
        assert.throws(function(){ types.date.dump(123123); });
        assert.throws(function(){ types.date.dump(); });

        assert.equal(date.toString(), types.date.load(timestamp));
        assert.throws(function(){ types.date.load('fail'); });
        assert.throws(function(){ types.date.load('123123123123123123123'); });
    }
};