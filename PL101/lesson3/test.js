var peg = require('pegjs')
  , assert = require('assert')
  , fs = require('fs')
;

function getParser(name) {
  return peg.buildParser(fs.readFileSync(name+'.js.peg', 'utf-8'));
}

var scheem = getParser('scheem')
  , comma  = getParser('comma')
  , mus    = getParser('mus')
;

describe('mus', function() {
  describe('a list of notes', function() {
    var tree = mus.parse("a1:5 b1:5 c1:5");

    it('is a seq', function() { assert.equal('seq', tree.tag); });

    it('has the first note on the left', function() {
      var left = tree.left;
      assert.ok(left);
      assert.equal(left.tag, 'note');
      assert.equal(left.pitch, 'a1');
      assert.equal(left.duration, 5);
    });

    it('has a seq on the right', function() {
      var right = tree.right;
      assert.ok(right);
      assert.equal(right.tag, 'seq');

      assert.ok(right.left);
      assert.equal(right.left.tag, 'note');
      assert.equal(right.left.pitch, 'b1');

      assert.ok(right.right);
      assert.equal(right.right.tag, 'note');
      assert.equal(right.right.pitch, 'c1');
    });
  });

  describe("optional duration", function() {
    var tree = mus.parse('a1');

    it("uses a default value of 1", function() {
      assert.equal('note', tree.tag);
      assert.equal('a1', tree.pitch);
      assert.equal('1', tree.duration);
    });
  });

  describe("parallel notes", function() {
    var tree = mus.parse("a1/c1");

    it("makes a par", function() {
      assert.equal(tree.tag, 'par');
      assert.ok(tree.left);
    });
  });

  describe("grouping", function() {
    var tree = mus.parse("a1:2/[c1/e1 d1/f1]");

    it('parses correctly', function() {
      assert.equal('par', tree.tag);
      assert.equal('seq', tree.right.tag);
      assert.equal('note', tree.left.tag);
      assert.equal('par', tree.right.left.tag);
      assert.equal('par', tree.right.right.tag);
    });
  });
});
