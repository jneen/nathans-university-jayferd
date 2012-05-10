var peg = require('pegjs')
  , fs = require('fs')
;

var parserSource = fs.readFileSync(__dirname + '/scheem.js.peg', 'utf-8')
  , parser = peg.buildParser(parserSource)
;

var scheem = (function() {
  var slice = [].slice;

  function fold(list, memo, fn) {
    for (var i = 0, len = list.length; i < len; i += 1) {
      memo = fn(memo, list[i]);
    }

    return memo;
  }


  function apply(vec) {
    var fn = vec[0], args = vec.slice(1);

    return fn.apply(null, args);
  }

  var base = {
    cons: function(h, t) { return [h].concat(t); },
    car: function(list) { return list[0]; },
    cdr: function(list) { return list.slice(1); },
    '+': function() {
      return fold(arguments, 0, function(a, b) { return a + b; });
    },

    '*': function() {
      return fold(arguments, 1, function(a, b) { return a * b; });
    },

    '-': function(start) {
      var args = slice.call(arguments, 1);
      return fold(args, start, function(a, b) { return a - b; });
    },

    log: function(e) {
      console.log(e);
    },

    '/': function(start) {
      var args = slice.call(arguments, 1);
      return fold(args, start, function(a, b) { return a / b; });
    },

    '=': function(a, b) {
      return (a === b) ? '#t' : '#f';
    }
  };

  function begin(expr, env) {
    var out = 0;
    for (var idx = 1, len = expr.length; idx < len; idx += 1) {
      out = eval_(expr[idx], env);
    }

    return out;
  }

  function define(expr, env) {
    env.bindings[expr[1]] = eval_(expr[2], env);
    return 0;
  }

  function letOne(expr, env) {
    var newVars = {};
    newVars[expr[1]] = expr[2];

    var newEnv = makeEnv(env, newVars);

    return eval_(expr[3], newEnv);
  }

  function lambdaOne(expr, env) {
    var name = expr[1]
      , body = expr[2]
    ;

    return function(arg) {
      var newVars = {};
      newVars[name] = arg;

      return eval_(body, makeEnv(env, newVars));
    };
  }

  function makeEnv(outer, vars) {
    if (!vars) vars = {};

    return { bindings: vars, outer: outer };
  }

  function lookup(env, name) {
    if (!env) {
      if (base.hasOwnProperty(name)) return base[name];
      throw new Error("undefined variable: "+name);
    }

    if (env.bindings.hasOwnProperty(name)) return env.bindings[name];

    return lookup(env.outer, name);
  }

  function update(env, name, val) {
    if (!env) throw new Error("undefined variable: "+name);

    if (env.bindings.hasOwnProperty(name)) return env.bindings[name] = val;

    return update(env.outer, name, val);
  }

  function eval_(expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') return expr;
    if (expr === '#t' || expr === '#f') return expr;
    if (typeof expr === 'string') return lookup(env, expr);

    // Look at head of list for operation
    switch (expr[0]) {
      case 'quote': return expr[1];
      case 'begin': return begin(expr, env);

      case 'define': return define(expr, env);

      case 'set':
      case 'set!': return update(env, expr[1], eval_(expr[2], env));

      case 'let-one': return letOne(expr, env);

      case 'lambda-one': return lambdaOne(expr, env);

      case 'if':
        if (eval_(expr[1], env) === '#t') {
          return eval_(expr[2], env);
        } else {
          return eval_(expr[3], env);
        }
    }

    var vec = [];
    for (var i = 0, len = expr.length; i < len; i += 1) {
      vec[i] = eval_(expr[i], env);
    }

    return apply(vec);
  }

  return {
    'eval': function(expr, env) {
      return eval_(expr, makeEnv(null, env));
    },
    parse: function(str) {
      return parser.parse(str);
    },
    evalString: function(str, env) {
      return eval_(parser.parse(str), makeEnv(null, env));
    }
  };
})();

if (typeof exports !== 'undefined') exports.scheem = scheem;
