
/**
 * Module dependencies.
 */

var rapid = require('rapid'),
    Model = rapid.Model;

module.exports = {
    'test .createModel()': function(assert){
        var Movie = rapid.createModel('Movie', {
            title: { type: 'String' },
            views: { type: 'Number' }
        });
        
        assert.ok(new Movie instanceof Model, 'Movie does not inherit from Model');
        assert.equal('String', Movie.properties.title.type);
    }
};