var assert = require('assert')
var spawn = require('child_process').spawn
var path = require('path')
var sinon = require('sinon')
var expect = require('../index')

var Expect = expect.Expect
var fixture = path.join(__dirname, 'fixtures', 'lorem-ipsum.js')
var SECOND = 1000

describe('stream-expect', function() {
  var exp
  beforeEach(function() {
    exp = expect.spawn('node', [fixture])
  })
  describe('#spawn()', function() {
    it('should return an instance of Expect', function() {
      assert.ok(exp instanceof Expect)
    })
    it('should expose the child process', function() {
      assert.ok(exp.child.pid)
    })
  })
  
  describe('#createExpect()', function() {
    it('should return an instance of Expect', function() {
      var child = spawn('node', [fixture])
      var exp = expect.createExpect(child.stdout, child.stdin)
      assert.ok(exp instanceof Expect)
    })
  })
  
  describe('#expect()', function() {
    it('should return an Expect object', function() {
      var obj = exp.expect(/./, function(){})
      assert.ok(obj instanceof Expect)
    })
    it('should call callback(null) on pattern match', function(done) {
      exp.expect(/ipsum/, function(err) {
        assert.strictEqual(null, err)
        done()
      })
    })
    it('should remove the listener on pattern match', function(done) {
      var listeners = exp.listeners('data').slice(0)
      exp.expect(/ipsum/, function(err, match) {
        var nListeners = exp.listeners('data').slice(0)
        assert.equal(nListeners.length, listeners.length)
        done()
      })
    })
    it('should call callback(err) on timeout', function(done) {
      var clock = sinon.useFakeTimers()
      exp.expect(/nothing/, function(err) {
        assert.ok(err instanceof Error)
        done()
      })
      clock.tick(60 * SECOND)
      clock.restore()
    })
    it('should remove the listener on timeout', function(done) {
      var clock = sinon.useFakeTimers()
      var listeners = exp.listeners('data').slice(0)
      exp.expect(/nothing/, function(err) {
        var nListeners = exp.listeners('data').slice(0)
        assert.equal(nListeners.length, listeners.length)
        done()
      })
      clock.tick(60 * SECOND)
      clock.restore()
    })
    it('output should contain output since expect was called', function(done) {
      var str = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do\n'
        + 'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad\n'
        + 'minim veniam'
      exp.expect(/veniam/, function(err, output, results) {
        assert.equal(output, str)
        done()
      })
    })
    it('matches are non-greedy', function(done) {
      var firstChar = 'L'
      exp.expect(/.*/, function(err, output, results) {
        assert.equal(results.input, firstChar)
        done()
      })
    })
    it('results should be a regex array', function(done) {
      exp.expect(/minim/, function(err, output, results) {
        assert.ok(results instanceof Array)
        done()
      })
    })
    it('timeout should be determined by this.timeout', function() {
      var clock = sinon.useFakeTimers()
      var stub = sinon.stub()
      exp.timeout = 7 * SECOND
      exp.expect(/nothing/, stub)
      
      clock.tick(6 * SECOND)
      assert.ok(stub.notCalled)
      
      clock.tick(1 * SECOND)
      assert.ok(stub.called)
      clock.restore()
    })
  })
  
  describe('#send()', function() {
    var stub
    beforeEach(function() {
      stub = sinon.stub(exp._wStream, 'write')
    })
   it('should return an Expect object', function() {
     var obj = exp.send('ls\n')
     assert.ok(obj instanceof Expect)
   })
    it('should write to the writeable Stream', function() {
      exp.send('ls\n')
      assert.ok(stub.calledWith('ls\n'))
    })
  })
})
