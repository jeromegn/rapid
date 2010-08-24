
/**
 * Module dependencies.
 */

var rapid = require('rapid'),
    assert = require('assert'),
    validation = rapid.validations;

var User = rapid.createModel('User', {
    name: { type: 'String', required: true },
    age: { type: 'Number', min: 1, max: 120 }
});

function test(validationName, record, prop, errMsg, okVal, fn) {
    var user = new User,
        prop = user.properties.get(prop);
    validation[validationName](record, prop, function(err){
        assert.equal(errMsg, err.message);
        record[prop.name] = okVal;
        validation[validationName](record, prop, function(err){
            assert.isUndefined(err);
            fn();
        });
    });
}

module.exports = {
    'test required': function(assert, done){
        test('required', 
            new User, 
            'name', 
            'User "name" is required', 
            'tyler', 
            done);
    },
    
    'test min': function(assert, done){
        test('min', 
            new User({ name: 'tyler', age: 0 }),
            'age',
            'User "age" of 0 is below the minimum of 1',
            23,
            done);
    }
};