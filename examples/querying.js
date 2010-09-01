
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

// Generate 1000 records

var users = new rapid.Collection;
var n = 1000;
while (n--) {
    var user = (function(){
        switch (n % 3) {
            case 2:
                return new User({
                    first: 'TJ',
                    last: 'Holowaychuk',
                    age: 23,
                    email: 'tj@vision-media.ca'
                });
            case 1:
                return new User({
                    first: 'Simon',
                    last: 'foobar',
                    age: 14,
                    email: 'simon@vision-media.ca'
                });
            case 0:
                return new User({
                    first: 'Tobi',
                    last: 'Holowaychuk',
                    age: 1,
                    email: 'tobi@vision-media.ca'
                });
            
        }
    })();
    users.push(user);
}

// Save the entire collection

console.log('... saving %d records', users.length);
users.save(function(err){
    console.log('... saved');
    User.find({ first: 'Tobi' }).all(function(err, users){
        console.log('... fetched %d', users.length);
        // We now have 1/3 of the users,
        // we can delete them all below
        users.destroy(function(err){
            console.log('... destroyed %d', users.length);
            // Figure out how many remain
            User.count(function(err, n){
                console.log('... %d remain', n);
                // Remove the rest
                User.clear(function(err){
                    console.log('... removed all users');
                    process.exit(0);
                });
            });
        });
    });
});