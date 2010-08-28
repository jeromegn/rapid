
/**
 * Module dependencies.
 */

var rapid = require('rapid'),
    types = rapid.types;

module.exports = {
    'test "string"': function(assert){
        assert.eql(new Buffer('test'), types.string.dump('test'), 'test "string" string support');
        assert.eql(new Buffer('test'), types.string.dump(new Buffer('test')), 'test "string" Buffer support');
        assert.eql(new Buffer('15'), types.string.dump(15), 'test "string" Number support');
        assert.throws(function(){ types.string.dump(new Date); });
        assert.throws(function(){ types.string.dump(); });
    },

    'test "date"': function(assert){
        var date = new Date('may 25 1987'),
            timestamp = Number(date).toString();
        assert.eql(new Buffer(timestamp), types.date.dump(date), 'test "date" Date support');
        assert.throws(function(){ types.date.dump('fail'); });
        assert.throws(function(){ types.date.dump(123123); });
        assert.throws(function(){ types.date.dump(); });

        assert.equal(date.toString(), types.date.load(timestamp));
        assert.throws(function(){ types.date.load('fail'); });
        assert.throws(function(){ types.date.load('123123123123123123123'); });
    },
    
    'test "json"': function(assert){
        assert.eql(new Buffer('{"foo":"bar"}'), types.json.dump({ foo: 'bar' }));
        assert.eql(new Buffer('123'), types.json.dump(123));
        assert.eql(new Buffer('"test"'), types.json.dump("test"));
        assert.eql(new Buffer('""'), types.json.dump(""));
        
        assert.eql({ foo: 'bar' }, types.json.load('{"foo":"bar"}'));
        assert.strictEqual(123, types.json.load('123'));
        assert.equal('test', types.json.load('"test"'));
    },
    
    'test "number"': function(assert){
        assert.eql(new Buffer('123'), types.number.dump(123));
        assert.eql(new Buffer('123'), types.number.dump('123'));
        assert.eql(new Buffer('15.99'), types.number.dump(15.99));
        assert.eql(new Buffer('15.99'), types.number.dump('15.99'));
        assert.throws(function(){ types.number.dump('fail'); });
        
        assert.strictEqual(123, types.number.load(new Buffer('123')));
        assert.strictEqual(123, types.number.load('123'));
        assert.strictEqual(15.99, types.number.load('15.99'));
        assert.throws(function(){ types.number.load('fail'); });
    },
    
    'test "binary"': function(assert){
        assert.eql(new Buffer('test'), types.binary.dump(new Buffer('test')));
        assert.eql(new Buffer('test'), types.binary.load(new Buffer('test')));
    }
};