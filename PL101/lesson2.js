// ex 7
function duration(expr) {
  if (expr.tag === 'note') {
    return expr.dur;
  }

  if (expr.tag === 'seq') {
    return duration(expr.left) + duration(expr.right);
  }

  if (expr.tag === 'par') {
    return Math.max(duration(expr.left), duration(expr.right));
  }
}

function compile(musexpr) {
  var out = [];

  function _compile(expr, time) {
    switch (expr.tag) {
      case 'note':
        out.push({
          tag: 'note',
          pitch: expr.pitch,
          dur: expr.dur,
          start: time
        });
        break;

      // seq is the only one that needs to know about duration :)
      case 'seq':
        streamCompile(expr.left, time, out);
        streamCompile(expr.right, time + duration(expr.left), out);
        break;

      case 'par':
        streamCompile(expr.left, time);
        streamCompile(expr.right, time);
    }
  }

  _compile(musexpr, 0);
  return out;
}
