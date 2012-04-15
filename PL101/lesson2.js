// ex 7
function duration(expr) {
  if (expr.tag === 'note') {
    return expr.dur;
  }

  if (expr.tag === 'seq') {
    return duration(expr.left) + duration(expr.right);
  }

  if (expr.tag === 'par') {
    return duration(endTime(expr.left), duration(expr.right));
  }
}

function compile(musexpr) {
  var out = [];

  function streamCompile(expr, time) {
    time = time || 0;

    switch (expr.tag) {
      case 'note':
        out.push({
          tag: 'note',
          pitch: expr.pitch,
          dur: expr.dur,
          start: time
        });
        break;
      
      case 'seq':
        streamCompile(expr.left, time, out);
        streamCompile(expr.right, time + duration(expr.left), out);
        break;

      case 'par':
        streamCompile(expr.left, time);
        streamCompile(expr.right, time);
    }
  }

  streamCompile(musexpr);
  return out;
}
