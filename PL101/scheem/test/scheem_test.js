var assert = require('chai').assert
  , scheem = require('./..').scheem
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
  test('define', function() {
    var env = {};
    scheem.eval(['define', 'x', ['+', 1, 1]], env);
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

  // test('conditional evaluation', function() {
  //   var env = { foo: 0 }
  //     , expr = ['if', 'cond', ['set!', 'foo', 1], 0]
  //   ;

  //   env.cond = '#f';
  //   scheem.eval(expr, env);
  //   assert.ok(!('foo' in env));

  //   env.cond = '#t';
  //   scheem.eval(expr, env);
  //   assert.ok('foo' in env);
  //   assert.equal(env.foo, 1);
  // });
});

suite('environments', function() {
  test('let-one', function() {
    var env = { a: 1 }
      , e = scheem.evalString
    ;

    assert.equal(1, e('a', env));
    assert.equal(2, e('(let-one a 2 a)', env));
    assert.equal(3, e('(let-one a 2 (let-one a 3 a))', env));
    assert.equal(2, e('(let-one a 2 (let-one b 3 a))', env));
  });
});

suite('lambda', function() {
  var e = scheem.evalString;

  test('lambda-one', function() {
    assert.equal(5, e('((lambda-one x x) 5)'));
    assert.equal(6, e('((lambda-one x (+ x 1)) 5)'));
    assert.equal(7, e('(((lambda-one x (lambda-one y (+ x y))) 3) 4)'));
    assert.equal(8, e('(((lambda-one x (lambda-one x (+ x x))) 3) 4)'));
  });

  test('recursion', function() {
    assert.equal(24, e(
      '(define fac (lambda-one x (if (= x 0) 1 (* x (fac (- x 1)))))) ' +
      '(fac 4)'
    ));
  });

  // holy balls, stateful encapsulation
  test('make-account', function() {
    var env = {};
    var result = e(
      '(define make-account (lambda-one (bal) (lambda-one (amt) (set! bal (+ bal amt)))))'
    +' (define a (make-account 20))'
    +' (a -10)'
    +' (a 5)'
    );

    assert.equal(result, 15);
  });
});
