
/**
 * Module dependencies.
 */

var rapid = require('rapid'),
    Model = rapid.Model;

var Movie = rapid.createModel('Movie', {
    title: { type: 'String' },
    desc:  { type: 'String' },
    sales: { type: 'Number' }
});

module.exports = {
    setup: function(fn){
        Movie.clear(fn);
    },

    'test .createModel()': function(assert){
        assert.ok(new Movie instanceof Model, 'Movie does not inherit from Model');
        assert.equal('String', Movie.properties.title.type);
        assert.equal('String', Movie.properties.desc.type);
        assert.equal('Number', Movie.properties.sales.type);
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
    },
    
    'test Model#save()': function(assert){
        var movie = new Movie({ title: 'Batman', desc: 'some description', sales: 10 });

        assert.equal(true, movie.new);
        assert.equal(true, movie.stale);

        movie.save(function(err){
            assert.isUndefined(err);
            assert.equal(false, movie.new);
            assert.equal(false, movie.stale);

            movie.save(function(err){
                assert.isUndefined(err);
                assert.equal(false, movie.new);
                assert.equal(false, movie.stale);

                movie.title = 'Batman Begins';
                assert.equal(true, movie.stale);
                assert.equal(false, movie.new);
            });
        });
    },
    
    'test Model.get()': function(assert){
        var movie = new Movie({ title: 'Batman' });
        movie.save(function(err){
            assert.isUndefined(err);
            Movie.get(movie.id, function(err, movie){
                console.dir(movie)
                assert.equal(false, movie.new, 'new after fetch');
                assert.equal(false, movie.stale, 'stale after fetch');
            });
        });
    }
};