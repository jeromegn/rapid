
/**
 * Module dependencies.
 */

var rapid = require('rapid'),
    Collection = rapid.Collection;

var User = rapid.model('User', {
    name:  { type: 'string', required: true },
    email: { type: 'string', format: 'email' }
});

module.exports = {
    setup: function(fn){
        User.clear(fn);
    },

    'test Collection#save() valid': function(assert, done){
        var tj, simon, tobi, users = new Collection;
        users.push(tj = new User({ name: 'tj' }));
        users.push(simon = new User({ name: 'simon' }));
        users.push(tobi = new User({ name: 'tobi' }));
        users.save(function(err){
            assert.isUndefined(err);
            assert.equal(false, tj.new);
            assert.equal(false, simon.new);
            assert.equal(false, tobi.new);
            done();
        });
    },
    
    'test Collection#save() invalid': function(assert, done){
        var tj, simon, tobi, users = new Collection;
        users.push(tj = new User({ name: 'tj' }));
        users.push(simon = new User);
        users.push(tobi = new User({ name: 'tobi' }));
        users.save(function(err){
            assert.equal(simon, err.record);
            assert.equal(true, simon.new);
            assert.equal(true, simon.stale);
            simon.name = 'simon';
            done();
        });
    },
    
    after: function(){
        rapid.client.close();
    }
};