var scheem = (function() {
  var slice = [].slice;

  function fold(list, memo, fn) {
    for (var i = 0, len = list.length; i < len; i += 1) {
      memo = fn(memo, list[i]);
    }

    return memo;
  }


  function apply(vec) {
// console.log('apply', vec);
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
    env[expr[1]] = eval_(expr[2], env);
    return 0;
  }

  function lookup(name, env) {
    var value = env[name] || base[name];
    if (!value) throw new Error("undefined variable: "+name);

    return value;
  }

  function eval_(expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') return expr;
    if (expr === '#t' || expr === '#f') return expr;
    if (typeof expr === 'string') return lookup(expr, env);

    // Look at head of list for operation
    switch (expr[0]) {
      case 'quote': return expr[1];
      case 'begin': return begin(expr, env);

      case 'define':
      case 'set':
      case 'set!': return define(expr, env);

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
  };

  return { eval: function(expr, env) { return eval_(expr, env || {}); } }
})();

if (typeof exports !== 'undefined') exports.scheem = scheem;
