
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
    
    after: function(){
        --rapid.pending || rapid.client.close();
    }
};