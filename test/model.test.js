
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
        assert.equal('String', Movie.properties.get('title').type);
        assert.equal('Number', Movie.properties.get('sales').type);
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
        var movie = new Movie({ 
            title: 'Nightmare Before Xmas',
            desc: 'some description',
            sales: 10
        });

        assert.equal(true, movie.new, 'not new on initialization');
        assert.equal(true, movie.stale, 'not stale on initialization');

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
        var movie = new Movie({ title: 'Foo', desc: 'some foo bar', sales: 100 });
        movie.save(function(err){
            assert.isUndefined(err);
            Movie.get(movie.id, function(err, movie){
                assert.equal(false, movie.new, 'new after fetch');
                assert.equal(false, movie.stale, 'stale after fetch');
                assert.equal('Foo', movie.title);
                assert.equal('some foo bar', movie.desc);
                assert.strictEqual(100, movie.sales);
            });
        });
    },
    
    after: function(){
        rapid.client.close();
    }
};