
/**
 * Module dependencies.
 */

var rapid = require('rapid'),
    types = rapid.types;

module.exports = {
    'test "id"': function(assert){
        var id = 'tttttttttttttttttttttttttttttttt';
        assert.eql(id, types.id.coerce(id));
        assert.throws(function(){ types.id.coerce('test'); });
        assert.throws(function(){ types.id.coerce(123); });
        
        assert.equal(id, types.id.load(new Buffer(id)));
        assert.eql(new Buffer(id), types.id.dump(id));
    },

    'test "string"': function(assert){
        assert.eql('test', types.string.coerce('test'), 'test "string" string support');
        assert.eql('test', types.string.coerce(new Buffer('test')), 'test "string" Buffer support');
        assert.eql('15', types.string.coerce(15), 'test "string" Number support');
        assert.eql(new Buffer('test'), types.string.dump('test'));
        assert.throws(function(){ types.string.coerce(new Date); });
        assert.throws(function(){ types.string.coerce(); });
    },

    'test "date"': function(assert){
        var date = new Date('may 25 1987'),
            timestamp = Number(date).toString();
        assert.eql(date, types.date.coerce(date), 'test "date" Date support');
        assert.throws(function(){ types.date.coerce('fail'); });
        assert.throws(function(){ types.date.coerce(123123); });
        assert.throws(function(){ types.date.coerce(); });

        assert.eql(new Buffer(timestamp), types.date.dump(date));

        assert.equal(date.toString(), types.date.load(timestamp));
        assert.throws(function(){ types.date.load('fail'); });
        assert.throws(function(){ types.date.load('123123123123123123123'); });
    },
    
    'test "json"': function(assert){
        assert.eql({ foo: 'bar' }, types.json.coerce({ foo: 'bar' }));
        
        assert.eql(new Buffer('{"foo":"bar"}'), types.json.dump({ foo: 'bar' }));
        assert.eql(new Buffer('123'), types.json.dump(123));
        assert.eql(new Buffer('"test"'), types.json.dump("test"));
        assert.eql(new Buffer('""'), types.json.dump(""));
        
        assert.eql({ foo: 'bar' }, types.json.load('{"foo":"bar"}'));
        assert.strictEqual(123, types.json.load('123'));
        assert.equal('test', types.json.load('"test"'));
    },
    
    'test "number"': function(assert){
        assert.eql(123, types.number.coerce(123));
        assert.eql(123, types.number.coerce('123'));
        assert.eql(15.99, types.number.coerce(15.99));
        assert.eql(15.99, types.number.coerce('15.99'));
        assert.throws(function(){ types.number.coerce('fail'); });
        
        assert.eql(new Buffer('123'), types.number.dump(123));
        
        assert.strictEqual(123, types.number.load(new Buffer('123')));
        assert.strictEqual(123, types.number.load('123'));
        assert.strictEqual(15.99, types.number.load('15.99'));
        assert.throws(function(){ types.number.load('fail'); });
    },
    
    'test "binary"': function(assert){
        assert.eql(new Buffer('test'), types.binary.coerce(new Buffer('test')));
        assert.eql(new Buffer('test'), types.binary.load(new Buffer('test')));
        assert.eql(new Buffer('test'), types.binary.dump(new Buffer('test')));
    },
    
    'test "boolean"': function(assert){
        assert.equal(types.bool, types.boolean);
        assert.eql(true, types.boolean.coerce(new Date));
        assert.eql(true, types.boolean.coerce('1'));
        assert.eql(true, types.boolean.coerce('t'));
        assert.eql(true, types.boolean.coerce('true'));
        assert.eql(true, types.boolean.coerce(true));
        assert.eql(false, types.boolean.coerce('0'));
        assert.eql(false, types.boolean.coerce('f'));
        assert.eql(false, types.boolean.coerce('false'));
        assert.eql(false, types.boolean.coerce(false));
        assert.eql(true, types.boolean.coerce(2));
        assert.eql(true, types.boolean.coerce(1));
        assert.eql(false, types.boolean.coerce(0));
        assert.eql(true, types.boolean.coerce(-1));
        assert.eql(true, types.boolean.coerce(-2));
        
        assert.eql(new Buffer('1'), types.boolean.dump(true));
        assert.eql(new Buffer('0'), types.boolean.dump(false));
        
        assert.strictEqual(true, types.boolean.load(new Buffer('1')));
        assert.strictEqual(false, types.boolean.load(new Buffer('0')));
    }
};