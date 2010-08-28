
/**
 * Module dependencies.
 */

var rapid = require('../index');

var User = rapid.model('User', {
    first : { type: 'string', required: true },
    last  : { type: 'string', required: true },
    email : { type: 'string', format: 'email' },
    age   : { type: 'number', min: 1, max: 120 },
    image : { type: 'binary' } 
});

var tj = new User({
    first: 'TJ',
    last: 'Holowaychuk',
    age: 23,
    email: 'invalid'
});

// TODO: fix callback which is called twice...

tj.save(function(err){
    // access err.record and err.property
    console.log('error: %s', err.message);

    // Fix and re-save
    tj.email = 'tj@vision-media.ca';
    tj.save(function(err){
        User.get(tj.id, function(err, user){
            console.dir(user)
        });
    });
});