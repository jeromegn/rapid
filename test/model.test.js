
/**
 * Module dependencies.
 */

var rapid = require('rapid'),
    Model = rapid.Model,
    Collection = rapid.Collection;

rapid.pending = rapid.pending || 0;
++rapid.pending;

var Movie = rapid.model('Movie', {
    title: { type: 'string', required: true },
    desc:  { type: 'string' },
    sales: { type: 'number', default: 0 },
    image: { type: 'binary' },

    // Example getter
    get summary(){
        return this.title + ' ' + this.desc;
    },

    // Example setter
    set summary(str){
        var parts = str.split(' ');
        this.title = parts.shift();
        this.desc = parts.join(' ');
    },

    // Example method
    setTitle: function(val){
        return this.title = val;
    }
});

module.exports = {
    setup: function(fn){
        Movie.clear(fn);
    },

    'test .model()': function(assert){
        assert.equal(Movie, rapid.model('Movie'));
        assert.ok(new Movie instanceof Model, 'Movie does not inherit from Model');
        assert.equal('string', Movie.properties.get('title').type);
        assert.equal('number', Movie.properties.get('sales').type);
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
    
    'test getters': function(assert){
        var movie = new Movie({
            title: 'Batman',
            desc: 'is cool'
        });
        assert.equal('Batman is cool', movie.summary);
    },
    
    'test setters': function(assert){
        var movie = new Movie;
        movie.summary = 'Batman is cool';
        assert.equal('Batman', movie.title);
        assert.equal('is cool', movie.desc);
    },
    
    'test methods': function(assert, done){
        var movie = new Movie;
        movie.setTitle('foo');
        assert.equal('foo', movie.title);
        movie.setTitle(new Buffer('test'));
        movie.save(function(err){
            assert.ok(!err);
            assert.equal('test', movie.title);
            done();
        });
    },
    
    'test Model() when valid': function(assert){
        var movie = new Movie({ title: 'Batman', desc: 'just some lame movie' });
        assert.equal('Batman', movie.title);
        assert.equal('just some lame movie', movie.desc);
    },
    
    'test Model#save() valid': function(assert, done){
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
                done();
            });
        });
    },
    
    'test Model#save() invalid': function(assert, done){
        var movie = new Movie;
        movie.save(function(err){
            assert.equal('Movie title is required', err.message);
            assert.equal(movie, err.record);
            assert.equal(err, movie.error);
            assert.equal(movie.properties.get('title'), err.property);
            done();
        });
    },
    
    'test Model#destroy() unsaved': function(assert, done){
        var movie = new Movie;
        movie.destroy(function(err){
            assert.ok(!err);
            done();
        });
    },
    
    'test Model#destroy() saved': function(assert, done){
        var movie = new Movie({ title: 'foobar' });
        movie.save(function(err){
            assert.ok(!err);
            Movie.get(movie.id, function(err, movie){
                assert.ok(movie);
                assert.ok(!movie.destroyed, 'record is initialized as destroyed');
                movie.destroy(function(err){
                    assert.ok(!err);
                    assert.equal(true, movie.destroyed, 'record not flagged as destroyed');
                    Movie.get(movie.id, function(err, movie){
                        assert.ok(!err);
                        assert.ok(!movie, 'failed to destroy record');
                        done();
                    });
                });
            });
        });
    },
    
    'test Model#update()': function(assert, done){
        var movie = new Movie({ title: 'foo' });
        movie.update({ desc: 'bar', sales: 10 }, function(err){
            assert.ok(!err);
            Movie.get(movie.id, function(err, movie){
                assert.equal('bar', movie.desc);
                assert.equal(10, movie.sales);
                done();
            });
        });
    },
    
    'test Model.get()': function(assert, done){
        var fakeImage = new Buffer('im an image');

        var movie = new Movie({
            title: 'Foo',
            desc: 'some foo bar',
            sales: 100,
            image: fakeImage
        });

        movie.save(function(err){
            assert.isUndefined(err);
            Movie.get(movie.id, function(err, movie){
                assert.equal(false, movie.new, 'new after fetch');
                assert.equal(false, movie.stale, 'stale after fetch');
                assert.equal('Foo', movie.title);
                assert.equal('some foo bar', movie.desc);
                assert.strictEqual(100, movie.sales);
                done();
            });
        });
    },
    
    'test Model.count()': function(assert, done){
        var a = new Movie({ title: 'Foo' });
        var b = new Movie({ title: 'Bar' });
        a.save(function(err){
            assert.isUndefined(err);
            b.save(function(err){
                assert.isUndefined(err);
                assert.notEqual(a.id, b.id, 'record ids match');
                Movie.count(function(err, n){
                    assert.isUndefined(err);
                    assert.strictEqual(n, 2);
                    done();
                });
            });
        });
    },
    
    'test Model.keys()': function(assert, done){
        var a = new Movie({ title: 'Foo' });
        var b = new Movie({ title: 'Bar' });
        a.save(function(err){
            assert.isUndefined(err);
            b.save(function(err){
                assert.isUndefined(err);
                assert.notEqual(a.id, b.id, 'record ids match');
                Movie.keys(function(err, keys){
                    assert.isUndefined(err);
                    keys = keys.map(function(key){ return key.toString(); });
                    assert.includes(keys, 'Movie:' + a.id);
                    assert.includes(keys, 'Movie:' + b.id);
                    done();
                });
            });
        }); 
    },
    
    'test Model.find() string comparison': function(assert, done){
        var a = new Movie({ title: 'foo' }),
            b = new Movie({ title: 'bar' }),
            c = new Movie({ title: 'baz' });
        new Collection([a,b,c]).save(function(){
            Movie.find({ title: 'foo' }).all(function(err, movies){
                assert.ok(!err);
                assert.length(movies, 1);
                assert.equal('foo', movies[0].title);
                done();
            });
        });
    },
    
    'test Model.find() regexp support': function(assert, done){
        var a = new Movie({ title: 'foo' }),
            b = new Movie({ title: 'bar' }),
            c = new Movie({ title: 'baz' });
        new Collection([a,b,c]).save(function(){
            Movie.find({ title: /^foo|bar$/ }).all(function(err, movies){
                assert.ok(!err);
                assert.length(movies, 2);
                var titles = movies.map(function(movie){ return movie.title; });
                assert.includes(titles, 'foo');
                assert.includes(titles, 'bar');
                done();
            });
        });
    },
    
    'test Model.find() empty collection': function(assert, done){
        var a = new Movie({ title: 'foo' }),
            b = new Movie({ title: 'bar' }),
            c = new Movie({ title: 'baz' });
        new Collection([a,b,c]).save(function(){
            Movie.find({ title: /^fail$/ }).all(function(err, movies){
                assert.ok(!err);
                assert.length(movies, 0);
                done();
            });
        });
    },
    
    'test Model.find() everything': function(assert, done){
        var a = new Movie({ title: 'foo' }),
            b = new Movie({ title: 'bar' }),
            c = new Movie({ title: 'baz' });
        new Collection([a,b,c]).save(function(){
            Movie.find().all(function(err, movies){
                assert.ok(!err);
                assert.length(movies, 3);
                done();
            });
        });
    },

    'test Model.find() by numeric value': function(assert, done){
        var a = new Movie({ title: 'foo', sales: 1 }),
            b = new Movie({ title: 'bar', sales: 1 }),
            c = new Movie({ title: 'baz', sales: 3 });
        new Collection([a,b,c]).save(function(){
            Movie.find({ sales: 1 }).all(function(err, movies){
                assert.ok(!err);
                assert.length(movies, 2);
                done();
            });
        });
    },
    
    'test Model.find() gt': function(assert, done){
        var a = new Movie({ title: 'foo', sales: 1 }),
            b = new Movie({ title: 'bar', sales: 1 }),
            c = new Movie({ title: 'baz', sales: 3 });
        new Collection([a,b,c]).save(function(){
            Movie.find({ sales: { gt: 1 }}).all(function(err, movies){
                assert.ok(!err);
                assert.length(movies, 1);
                assert.equal('baz', movies[0].title);
                done();
            });
        });
    },
    
    'test Model.find() lt': function(assert, done){
        var a = new Movie({ title: 'foo', sales: 1 }),
            b = new Movie({ title: 'bar', sales: 4 }),
            c = new Movie({ title: 'baz', sales: 3 });
        new Collection([a,b,c]).save(function(){
            Movie.find({ sales: { lt: 3 }}).all(function(err, movies){
                assert.ok(!err);
                assert.length(movies, 1);
                assert.equal('foo', movies[0].title);
                done();
            });
        });
    },
    
    'test Model.find() lte': function(assert, done){
        var a = new Movie({ title: 'foo', sales: 1 }),
            b = new Movie({ title: 'bar', sales: 4 }),
            c = new Movie({ title: 'baz', sales: 3 });
        new Collection([a,b,c]).save(function(){
            Movie.find({ sales: { lte: 3 }}).all(function(err, movies){
                assert.ok(!err);
                assert.length(movies, 2);
                done();
            });
        });
    },
    
    'test Model.find() gte': function(assert, done){
        var a = new Movie({ title: 'foo', sales: 1 }),
            b = new Movie({ title: 'bar', sales: 4 }),
            c = new Movie({ title: 'baz', sales: 3 });
        new Collection([a,b,c]).save(function(){
            Movie.find({ sales: { gte: 3 }}).all(function(err, movies){
                assert.ok(!err);
                movies = movies.map(function(movie){ return movie.title; });
                assert.length(movies, 2);
                assert.includes(movies, 'baz');
                assert.includes(movies, 'bar');
                done();
            });
        });
    },
    
    'test defaults': function(assert, done){
        var movie = new Movie({ title: 'something' });
        movie.save(function(err){
            assert.isUndefined(err);
            assert.equal(0, movie.sales);
            done();
        });
    },
    
    after: function(){
        --rapid.pending || rapid.client.close();
    }
};