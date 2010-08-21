
/**
 * Module dependencies.
 */

var rapid = require('rapid'),
    validation = rapid.validations;

var User = rapid.createModel('User', {
    name: { type: 'String', required: true }
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
    }
};