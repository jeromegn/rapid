
/**
 * Module dependencies.
 */

var rapid = require('rapid');

module.exports = {
    'test .version': function(assert){
        assert.match(rapid.version, /^\d+\.\d+\.\d+$/);
    }
};