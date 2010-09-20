
# Rapid

 Rapid is an ORM-ish api for [redis](http://code.google.com/p/redis/), currently backed by [node_redis](http://github.com/mranney/node_redis). Rapid is very much a work-in-progress and represents a day or two of work, so feel free to contribute!!

## Installation

    $ npm install rapid

## Examples

Source:

    var rapid = require('rapid');

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

    tj.save(function(err){
        // access err.record and err.property
        console.error('error: %s', err.message);

        // Fix and re-save
        tj.email = 'tj@vision-media.ca';
        tj.save(function(err){

            // Grab user by id
            User.get(tj.id, function(err, user){
                console.dir(user)
                process.exit(0);
            });
        });
    });

std{err,out}:

    error: User email format is invalid

    [User
      id: '841c71863a7cfce63b5393b4f64b8814'
      first: 'TJ'
      last: 'Holowaychuk'
      email: 'tj@vision-media.ca'
      age: 23
      image: undefined
    ]

## Validations

The following validations are currently supported:

  - `require`: ensures that a property value has been assigned
  - `min`: ensures numeric value or string length when assigned is >= min
  - `max`: ensures numeric value or string length when assigned is <= max
  - `format`: ensures string format via the given `RegExp` or canned format such as "email".

## Types

Each rapid "type" is tasked with coercion, "loading" redis `Buffer` data into a native JavaScript equiv, as well as "dumping" JavaScript values to a `Buffer` object for storage within Redis. Current supported are the following types:

  - `binary`
  - `string`
  - `date`
  - `json`
  - `number`
  - `boolean` (aliased as bool)

## Testing

Launch redis:

    $ nohup redis-server &

Run the tests:

    $ make test

## License 

(The MIT License)

Copyright (c) 2009-2010 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
