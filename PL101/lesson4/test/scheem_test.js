var assert = require('chai').assert
  , scheem = require('../scheem').scheem
;

suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            scheem.eval(['quote', 3]),
            3
        );
    });

    test('an atom', function() {
        assert.deepEqual(
            scheem.eval(['quote', 'dog']),
            'dog'
        );
    });

    test('a list', function() {
        assert.deepEqual(
            scheem.eval(['quote', [1, 2, 3]]),
            [1, 2, 3]
        );
    });
});

suite('numbers', function() {
  test('addition', function() {
    assert.deepEqual(scheem.eval(['+', 1, 2, 3, 4]), 10);
  });

  test('subtraction', function() {
    assert.deepEqual(scheem.eval(['-', 10, 4, 3, 2]), 1);
  });

  test('multiplication', function() {
    assert.deepEqual(scheem.eval(['*', 1, 2, 3, 4]), 24);
  });

  test('division', function() {
    assert.deepEqual(scheem.eval(['/', 24, 4, 3, 1]), 2);
  });
});

suite('mutability', function() {
  test('set!', function() {
    var env = {};
    scheem.eval(['set!', 'x', ['+', 1, 1]], env);
    assert.deepEqual(env.x, 2);
  });
});

suite('booleanosity', function() {
  test('=', function() {
    assert.deepEqual('#t', scheem.eval(['=', 1, 1]));
    assert.deepEqual('#f', scheem.eval(['=', 0, 1]));
  });

  test('if', function() {
    var expr = ['if', ['=', 10, 10], 1, 0];
    assert.deepEqual(1, scheem.eval(expr));
  });

  test('conditional evaluation', function() {
    var env = {}
      , expr = ['if', 'cond', ['set!', 'foo', 1], 0]
    ;

    env.cond = '#f';
    scheem.eval(expr, env);
    assert.ok(!('foo' in env));

    env.cond = '#t';
    scheem.eval(expr, env);
    assert.ok('foo' in env);
    assert.equal(env.foo, 1);
  });
});
