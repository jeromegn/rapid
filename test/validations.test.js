
/**
 * Module dependencies.
 */

var rapid = require('rapid'),
    validation = rapid.validations;

var User = rapid.createModel('User', {
    name: { type: 'String', required: true },
    age: { type: 'Number', min: 1, max: 120 }
});

module.exports = {
    'test required': function(assert, done){
        var user = new User,
            prop = user.properties.get('name');
        validation.required(user, prop, function(err){
            assert.equal('User "name" is required', err.message);
            user.name = 'tj';
            validation.required(user, prop, function(err){
                assert.isUndefined(err);
                done();
            });
        });
    },
    
    'test min': function(assert, done){
        var user = new User({ name: 'tj', age: 0 }),
            prop = user.properties.get('age');
        validation.min(user, prop, function(err){
            assert.equal('User "age" of 0 is below the minimum of 1', err.message);
            user.age = 23;
            validation.min(user, prop, function(err){
                assert.isUndefined(err);
                done();
            });
        });
    }
};