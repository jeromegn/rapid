
/**
 * Module dependencies.
 */

var rapid = require('rapid'),
    assert = require('assert'),
    validation = rapid.validations;

var User = rapid.createModel('User', {
    name: { type: 'String', required: true, min: 3, max: 32, format: /^[\w ]+$/ },
    age: { type: 'Number', min: 1, max: 120 },
    postalCode: { type: 'String', format: 'postal-code' }
});

function test(validationName, record, prop, errMsg, okVal, fn) {
    var user = new User,
        prop = user.properties.get(prop);
    validation[validationName](record, prop, function(err){
        assert.equal(errMsg, err.message);
        record[prop.name] = okVal;
        validation[validationName](record, prop, function(err){
            assert.isUndefined(err);
            fn && fn();
        });
    });
}

module.exports = {
    'test required': function(assert){
        test('required', 
            new User, 
            'name', 
            'User name is required', 
            'tyler');
    },
    
    'test min with number': function(assert){
        test('min', 
            new User({ name: 'tyler', age: 0 }),
            'age',
            'User age 0 is below the minimum of 1',
            23);
    },
    
    'test min with string': function(assert){
        test('min',
            new User({ name: 'tj' }),
            'name',
            "User name 'tj' is below the minimum length of 3",
            'tyler');
    },
    
    'test max with number': function(assert){
        test('max', 
            new User({ name: 'tyler', age: 250 }),
            'age',
            'User age 250 is above the maximum of 120',
            30);
    },
    
    'test max with string': function(assert){
        var largeName = Array(20).join('fail');
        test('max', 
            new User({ name: largeName }),
            'name',
            'User name \'' + largeName + '\' is above the maximum length of 32',
            'something smaller');
    },
    
    'test format': function(assert){
        test('format', 
            new User({ name: 'tyler%4' }),
            'name',
            'User name format is invalid',
            'tyler');
    },
    
    'test "postal-code" format': function(assert){
        test('format', 
            new User({ name: 'tyler', postalCode: 'asdf' }),
            'postalCode',
            'User postalCode format is invalid',
            'v9b1t7');
        test('format', 
            new User({ name: 'tyler', postalCode: 'asdf' }),
            'postalCode',
            'User postalCode format is invalid',
            'V9B1T7');
    }
};