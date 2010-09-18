/*global require console setTimeout process */
var redis = require("./index"),
    client = redis.createClient(),
    assert = require("assert"),
    sys = require('sys'),
    tests = {}, iterations = 10000;

redis.debug_mode = false;

function require_number(expected, label) {
    return function (err, results) {
        assert.strictEqual(null, err, "result sent back unexpected error");
        assert.strictEqual(expected, results, label + " " + expected + " !== " + results);
        assert.strictEqual(typeof results, "number", label);
        return true;
    };
}

function require_number_any(label) {
    return function (err, results) {
        assert.strictEqual(null, err, "result sent back unexpected error");
        assert.strictEqual(typeof results, "number", label + " " + results + " is not a number");
        return true;
    };
}

function require_number_pos(label) {
    return function (err, results) {
        assert.strictEqual(null, err, "result sent back unexpected error");
        assert.strictEqual(true, (results > 0), label + " " + results + " is not a positive number");
        return true;
    };
}

function require_string(str, label) {
    return function (err, results) {
        assert.strictEqual(null, err, "result sent back unexpected error");
        assert.equal(str, results, label + " " + str + " does not match " + results);
        return true;
    };
}

function require_error(label) {
    return function (err, results) {
        assert.notEqual(err, null, label + " err is null, but an error is expected here.");
        return true;
    };
}

function last(name, fn) {
    return function (err, results) {
        fn(err, results);
        next(name);
    };
}

function next(name) {
    console.log(" \x1b[33m" + (Date.now() - cur_start) + "\x1b[0m ms");
    run_next_test();
}

function reportRPS() {
    sys.print(" \x1b[33m" + (iterations / ((Date.now() - cur_start)/1000)).toFixed(2) + "\x1b[0m reqs/sec,");
}

// Tests are run in the order they are defined.  So FLUSHDB should be stay first.

tests.FLUSHDB = function () {
    var name = "FLUSHDB";
    client.mset("flush keys 1", "flush val 1", "flush keys 2", "flush val 2", require_string("OK", name));
    client.FLUSHDB(require_string("OK", name));
    client.dbsize(last(name, require_number(0, name)));
};

tests.HSET = function () {
    var key = "test hash",
        field1 = new Buffer(10),
        value1 = new Buffer(10),
        field2 = new Buffer(0),
        value2 = new Buffer(0),
        name = "HSET";

    field1.write("0123456789");
    value1.write("abcdefghij");
        
    client.HSET(key, field1, value1, require_number(1, name));
    client.HGET(key, field1, last(name, require_string(value1.toString(), name)));

    // TODO - this triggers a bug in the reply parser for 0 length bulk data
    
    // client.HSET(key, field1, value2, require_number(0, name));
    // client.HGET(key, field1, require_string("", name));
    // 
    // client.HSET(key, field2, value1, require_number(1, name)); // empty key is valid
    // client.HSET(key, field2, value2, require_number(11, name)); // empty key empty val
};

tests.PING_10K = function () {
    var name = "PING_10K", i = iterations;
    
    do {
        client.PING();
        i -= 1;
    } while (i > 1);
    client.PING([], function (err, res) {
        assert.strictEqual("PONG", res);
        reportRPS();
        next(name);
    });
};

tests.SET_10K = function () {
    var name = "SET_10K", i = iterations;
    
    do {
        client.SET("foo_rand000000000000", "xxx");
        i -= 1;
    } while (i > 1);
    client.SET("foo_rand000000000000", "xxx", function (err, res) {
        assert.strictEqual("OK", res);
        reportRPS();
        next(name);
    });
};

tests.GET_10K = function () {
    var name = "GET_10K", i = iterations;
    
    do {
        client.GET("foo_rand000000000000");
        i -= 1;
    } while (i > 1);
    client.GET("foo_rand000000000000", function (err, res) {
        assert.strictEqual("xxx", res.toString());
        reportRPS();
        next(name);
    });
};

tests.INCR_10K = function () {
    var name = "INCR_10K", i = iterations;
    
    do {
        client.INCR("counter_rand000000000000");
        i -= 1;
    } while (i > 1);
    client.INCR("counter_rand000000000000", function (err, res) {
        assert.strictEqual(iterations, res);
        reportRPS();
        next(name);
    });
};

tests.LPUSH_10K = function () {
    var name = "LPUSH_10K", i = iterations;
    
    do {
        client.LPUSH("mylist", "bar");
        i -= 1;
    } while (i > 1);
    client.LPUSH("mylist", "bar", function (err, res) {
        assert.strictEqual(iterations, res);
        reportRPS();
        next(name);
    });
};

tests.LRANGE_10K_100 = function () {
    var name = "LRANGE_10K_100", i = iterations;
    
    do {
        client.LRANGE("mylist", 0, 99);
        i -= 1;
    } while (i > 1);
    client.LRANGE("mylist", 0, 99, function (err, res) {
        assert.strictEqual("bar", res[0].toString());
        reportRPS();
        next(name);
    });
};

tests.LRANGE_10K_450 = function () {
    var name = "LRANGE_10K_450", i = iterations;
    
    do {
        client.LRANGE("mylist", 0, 449);
        i -= 1;
    } while (i > 1);
    client.LRANGE("mylist", 0, 449, function (err, res) {
        assert.strictEqual("bar", res[0].toString());
        reportRPS();
        next(name);
    });
};

tests.EXISTS = function () {
    var name = "EXISTS";
    client.del("foo", "foo2", require_number_any(name));
    client.set("foo", "bar", require_string("OK", name));
    client.EXISTS("foo", require_number(1, name));
    client.EXISTS("foo2", last(name, require_number(0, name)));
};

tests.DEL = function () {
    var name = "DEL";
    client.DEL("delkey", require_number_any(name));
    client.set("delkey", "delvalue", require_string("OK", name));
    client.DEL("delkey", require_number(1, name));
    client.exists("delkey", require_number(0, name));
    client.DEL("delkey", require_number(0, name));
    client.mset("delkey", "delvalue", "delkey2", "delvalue2", require_string("OK", name));
    client.DEL("delkey", "delkey2", last(name, require_number(2, name)));
};

tests.TYPE = function () {
    var name = "TYPE";
    client.set(["string key", "should be a string"], require_string("OK", name));
    client.rpush(["list key", "should be a list"], require_number_pos(name));
    client.sadd(["set key", "should be a set"], require_number_any(name));
    client.zadd(["zset key", "10.0", "should be a zset"], require_number_any(name));
    client.hset(["hash key", "hashtest", "should be a hash"], require_number_any(0, name));
    
    client.TYPE(["string key"], require_string("string", name));
    client.TYPE(["list key"], require_string("list", name));
    client.TYPE(["set key"], require_string("set", name));
    client.TYPE(["zset key"], require_string("zset", name));
    client.TYPE(["hash key"], last(name, require_string("hash", name)));
};

tests.KEYS = function () {
    var name = "KEYS";
    client.mset(["test keys 1", "test val 1", "test keys 2", "test val 2"], require_string("OK", name));
    client.KEYS(["test keys*"], function (err, results) {
        assert.strictEqual(null, err, "result sent back unexpected error");
        assert.strictEqual(2, results.length, name);
        assert.strictEqual("test keys 1", results[0].toString(), name);
        assert.strictEqual("test keys 2", results[1].toString(), name);
        next(name);
    });
};

tests.MULTIBULK_ZERO_LENGTH = function () {
    var name = "MULTIBULK_ZERO_LENGTH";
    client.KEYS(['users:*'], function(err, results){
        assert.strictEqual(null, err, 'error on empty multibulk reply');
        assert.strictEqual(null, results);
        next(name);
    });
};

tests.RANDOMKEY = function () {
    var name = "RANDOMKEY";
    client.mset(["test keys 1", "test val 1", "test keys 2", "test val 2"], require_string("OK", name));
    client.RANDOMKEY([], function (err, results) {
        assert.strictEqual(null, err, name + " result sent back unexpected error");
        assert.strictEqual(true, /\w+/.test(results), name);
        next(name);
    });
};

tests.RENAME = function () {
    var name = "RENAME";
    client.set(['foo', 'bar'], require_string("OK", name));
    client.RENAME(["foo", "new foo"], require_string("OK", name));
    client.exists(["foo"], require_number(0, name));
    client.exists(["new foo"], last(name, require_number(1, name)));
};

tests.RENAMENX = function () {
    var name = "RENAMENX";
    client.set(['foo', 'bar'], require_string("OK", name));
    client.set(['foo2', 'bar2'], require_string("OK", name));
    client.RENAMENX(["foo", "foo2"], require_number(0, name));
    client.exists(["foo"], require_number(1, name));
    client.exists(["foo2"], require_number(1, name));
    client.del(["foo2"], require_number(1, name));
    client.RENAMENX(["foo", "foo2"], require_number(1, name));
    client.exists(["foo"], require_number(0, name));
    client.exists(["foo2"], last(name, require_number(1, name)));
};

tests.DBSIZE = function () {
    var name = "DBSIZE";
    client.set(['foo', 'bar'], require_string("OK", name));
    client.DBSIZE([], last(name, require_number_pos("DBSIZE")));
};

tests.EXPIRE = function () {
    var name = "EXPIRE";
    client.set(['expiry key', 'bar'], require_string("OK", name));
    client.EXPIRE(["expiry key", "1"], require_number_pos(name));
    setTimeout(function () {
        client.exists(["expiry key"], last(name, require_number(0, name)));
    }, 2000);
};

tests.TTL = function () {
    var name = "TTL";
    client.set(["ttl key", "ttl val"], require_string("OK", name));
    client.expire(["ttl key", "100"], require_number_pos(name));
    setTimeout(function () {
        client.TTL(["ttl key"], last(name, require_number_pos(0, name)));
    }, 500);
};

tests.GET = function () {
    var name = "GET";
    client.set(["get key", "get val"], require_string("OK", name));
    client.GET(["get key"], last(name, require_string("get val", name)));
};

tests.SET = function () {
    var name = "SET";
    client.SET(["set key", "set val"], require_string("OK", name));
    client.get(["set key"], last(name, require_string("set val", name)));
};

tests.GETSET = function () {
    var name = "GETSET";
    client.set(["getset key", "getset val"], require_string("OK", name));
    client.GETSET(["getset key", "new getset val"], require_string("getset val", name));
    client.get(["getset key"], last(name, require_string("new getset val", name)));
};

tests.MGET = function () {
    var name = "MGET";
    client.mset(["mget keys 1", "mget val 1", "mget keys 2", "mget val 2", "mget keys 3", "mget val 3"], require_string("OK", name));
    client.MGET(["mget keys 1", "mget keys 2", "mget keys 3"], function (err, results) {
        assert.strictEqual(null, err, "result sent back unexpected error");
        assert.strictEqual(3, results.length, name);
        assert.strictEqual("mget val 1", results[0].toString(), name);
        assert.strictEqual("mget val 2", results[1].toString(), name);
        assert.strictEqual("mget val 3", results[2].toString(), name);
    });
    client.MGET(["mget keys 1", "some random shit", "mget keys 2", "mget keys 3"], function (err, results) {
        assert.strictEqual(null, err, "result sent back unexpected error");
        assert.strictEqual(4, results.length, name);
        assert.strictEqual("mget val 1", results[0].toString(), name);
        assert.strictEqual(null, results[1], name);
        assert.strictEqual("mget val 2", results[2].toString(), name);
        assert.strictEqual("mget val 3", results[3].toString(), name);
        next(name);
    });
};

tests.SETNX = function () {
    var name = "SETNX";
    client.set(["setnx key", "setnx value"], require_string("OK", name));
    client.SETNX(["setnx key", "new setnx value"], require_number(0, name));
    client.del(["setnx key"], require_number(1, name));
    client.exists(["setnx key"], require_number(0, name));
    client.SETNX(["setnx key", "new setnx value"], require_number(1, name));
    client.exists(["setnx key"], last(name, require_number(1, name)));
};

tests.SETEX = function () {
    var name = "SETEX";
    client.SETEX(["setex key", "100", "setex val"], require_string("OK", name));
    client.exists(["setex key"], require_number(1, name));
    client.ttl(["setex key"], last(name, require_number_pos(name)));
};

// plenty of tests of MSET already

tests.MSETNX = function () {
    var name = "MSETNX";
    client.mset(["mset1", "val1", "mset2", "val2", "mset3", "val3"], require_string("OK", name));
    client.MSETNX(["mset3", "val3", "mset4", "val4"], require_number(0, name));
    client.del(["mset3"], require_number(1, name));
    client.MSETNX(["mset3", "val3", "mset4", "val4"], require_number(1, name));
    client.exists(["mset3"], require_number(1, name));
    client.exists(["mset4"], last(name, require_number(1, name)));
};

tests.MULTI = function () {
    var name = "MULTI";
    client.multi([
        ["mset", ["multifoo", "10", "multibar", "20"], require_string("OK", name)],
        ["set", ["foo2"], require_error(name)],
        ["incr", ["multifoo"], require_number(11, name)],
        ["incr", ["multibar"], require_number(21, name)]
    ]);

    client.multi([
        ["incr", ["multibar"], require_number(22, name)],
        ["incr", ["multifoo"], last(name, require_number(12, name))]
    ]);
};

tests.HGETALL = function () {
    var name = "HGETALL";
    client.hmset(["hosts", "mjr", "1", "another", "23", "home", "1234"], require_string("OK", name));
    client.HGETALL(["hosts"], function (err, obj) {
        assert.strictEqual(null, err, name + " result sent back unexpected error");
        assert.strictEqual(3, Object.keys(obj).length, name);
        assert.ok(Buffer.isBuffer(obj.mjr), name);
        assert.strictEqual("1", obj.mjr.toString(), name);
        assert.strictEqual("23", obj.another.toString(), name);
        assert.strictEqual("1234", obj.home.toString(), name);
        next(name);
    });
};

var all_tests = Object.keys(tests),
    all_start = new Date(), cur_start, test_count = 0;

function run_next_test() {
    var test_name = all_tests.shift();
    if (typeof tests[test_name] === "function") {
        sys.print('- \x1b[1m' + test_name.toLowerCase() + '\x1b[0m:');
        cur_start = new Date();
        test_count += 1;
        tests[test_name]();
    } else {
        console.log('\n  completed \x1b[32m%d\x1b[0m tests in \x1b[33m%d\x1b[0m ms\n', test_count, new Date - all_start);
        client.end();
    }
}

client.on("connect", function () {
    run_next_test();
});

client.on("error", function (err) {
    console.log("Redis clent connection failed.");
});

client.on("reconnecting", function (msg) {
    console.log("reconnecting: " + msg);
});

process.on('uncaughtException', function (err) {
    console.log("Uncaught exception: " + err.stack);
});
