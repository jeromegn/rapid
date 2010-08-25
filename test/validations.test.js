
/**
 * Module dependencies.
 */

var rapid = require('rapid'),
    assert = require('assert'),
    validation = rapid.validations;

var User = rapid.createModel('User', {
    name: { type: 'String', required: true, min: 3, max: 32, format: /^[\w ]+$/ },
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
            'User name is required', 
            'tyler', 
            done);
    },
    
    'test min': function(assert, done){
        test('min', 
            new User({ name: 'tyler', age: 0 }),
            'age',
            'User age 0 is below the minimum of 1',
            23,
            done);
        
        test('min',
            new User({ name: 'tj' }),
            'name',
            "User name 'tj' is below the minimum length of 3",
            'tyler',
            done);
    },
    
    'test max': function(assert, done){
        test('max', 
            new User({ name: 'tyler', age: 250 }),
            'age',
            'User age 250 is above the maximum of 120',
            30,
            done);

        var largeName = Array(20).join('fail');
        test('max', 
            new User({ name: largeName }),
            'name',
            'User name \'' + largeName + '\' is above the maximum length of 32',
            'something smaller',
            done);
    },
    
    'test max': function(assert, done){
        test('max', 
            new User({ name: 'tyler', age: 250 }),
            'age',
            'User age 250 is above the maximum of 120',
            30,
            done);

        var largeName = Array(20).join('fail');
        test('max', 
            new User({ name: largeName }),
            'name',
            'User name \'' + largeName + '\' is above the maximum length of 32',
            'something smaller',
            done);
    },
    
    'test format': function(assert, done){
        test('format', 
            new User({ name: 'tyler%4' }),
            'name',
            'User name format is invalid',
            'tyler',
            done);
    }
};