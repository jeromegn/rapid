
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

var Post = rapid.model('Post', {
    title: { type: 'string', require: true },
    body: { type: 'string', min: 5, max: 1500 }
});

var Comment = rapid.model('Comment', {
    body: { type: 'string', required: true, min: 5 }
});

console.log(rapid.graph());
process.exit(0);

// node examples/graph.js > test.dot && dot -Tpng test.dot > test.png && open test.png