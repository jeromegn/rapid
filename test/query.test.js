
/**
 * Module dependencies.
 */

var rapid = require('rapid'),
    Query = rapid.Query;

rapid.pending = rapid.pending || 0;
++rapid.pending;

var User = rapid.model('User2', {
    name:  { type: 'string', required: true },
    email: { type: 'string', format: 'email' }
});

module.exports = {
    setup: function(fn){
        User.clear(fn);
    },
    
    'test inheritance': function(assert){
        assert.ok(new Query instanceof Array);
    },

    'test Query#save() valid': function(assert, done){
        var tj, simon, tobi, users = new Query;
        users.push(tj = new User({ name: 'tj' }));
        users.push(simon = new User({ name: 'simon' }));
        users.push(tobi = new User({ name: 'tobi' }));
        users.save(function(err){
            assert.ok(!err);
            assert.equal(false, tj.new);
            assert.equal(false, simon.new);
            assert.equal(false, tobi.new);
            done();
        });
    },
    
    'test Query#save() invalid': function(assert, done){
        var tj, simon, tobi, users = new Query;
        users.push(tj = new User({ name: 'tj' }));
        users.push(simon = new User);
        users.push(tobi = new User({ name: 'tobi' }));
        users.save(function(err){
            assert.ok(err, 'save with invalid record did not throw');
            assert.equal(simon, err.record);
            assert.equal(true, simon.new);
            assert.equal(true, simon.stale);
            simon.name = 'simon';
            done();
        });
    },
    
    'test Query#destroy() valid': function(assert, done){
        var tj, simon, tobi, users = new Query;
        users.push(tj = new User({ name: 'tj' }));
        users.push(simon = new User({ name: 'simon' }));
        users.push(tobi = new User({ name: 'tobi' }));
        users.save(function(err){
            assert.ok(!err);
            users.destroy(function(err){
                assert.ok(!err);
                assert.equal(true, tj.destroyed);
                assert.equal(true, simon.destroyed);
                assert.equal(true, tobi.destroyed);
                User.get(tj.id, function(err, user){
                    assert.ok(!err);
                    assert.ok(!user);
                    done();
                });
            });
        });
    },
    
    after: function(){
        --rapid.pending || rapid.client.close();
    }
};