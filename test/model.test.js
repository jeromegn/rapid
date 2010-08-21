
/**
 * Module dependencies.
 */

var rapid = require('rapid'),
    Model = rapid.Model;

var Movie = rapid.createModel('Movie', {
    title: { type: 'String' },
    desc:  { type: 'String' },
    views: { type: 'Number' }
});

module.exports = {
    'test .createModel()': function(assert){
        assert.ok(new Movie instanceof Model, 'Movie does not inherit from Model');
        assert.equal('String', Movie.properties.title.type);
        assert.equal('String', Movie.properties.desc.type);
        assert.equal('Number', Movie.properties.views.type);
    },
    
    'test Model() with invalid property': function(assert){
        var err;
        try {
            new Movie({ name: 'batman' });
        } catch (e) {
            err = e;
        }
        assert.equal('Movie has no property "name".', err.message);
    },
    
    'test Model() when valid': function(assert){
        var movie = new Movie({ title: 'Batman', desc: 'just some lame movie' });
        assert.equal('Batman', movie.title);
        assert.equal('just some lame movie', movie.desc);
    }
};