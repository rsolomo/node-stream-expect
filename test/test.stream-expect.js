var assert = require('assert')
var os = require('os')
var spawn = require('child_process').spawn
var path = require('path')
var mocha = require('mocha')
var sinon = require('sinon')
var expect = require('../index')

var Expect = expect.Expect
var fixture = path.join(__dirname, 'fixtures', 'lorem-ipsum.js')

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
  
  describe('#init()', function() {
    it('should return an instance of Expect', function() {
      var child = spawn('node', [fixture])
      var exp = expect.init(child.stdout, child.stdin)
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
      var listeners = exp._rStream.listeners('data').slice(0)
      exp.expect(/ipsum/, function(err, match) {
        var nListeners = exp._rStream.listeners('data').slice(0)
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
      clock.tick(60 * 1000)
      clock.restore()
    })
    it('should remove the listener on timeout', function(done) {
      var clock = sinon.useFakeTimers()
      var listeners = exp._rStream.listeners('data').slice(0)
      exp.expect(/nothing/, function(err) {
        var nListeners = exp._rStream.listeners('data').slice(0)
        assert.equal(nListeners.length, listeners.length)
        done()
      })
      clock.tick(60 * 1000)
      clock.restore()
    })
    it('output should contain output since expect was called', function(done) {
      var lines = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do'
        + os.EOL + 'tempor incididunt ut labore et dolore magna aliqua. Ut enim ad'
      var obj = exp.expect(/minim/, function(err, output, results) {
        assert.notEqual(output.indexOf(lines), -1)
        done()
      })
    })
    it('results should be a regex array', function(done) {
      var obj = exp.expect(/^minim/m, function(err, output, results) {
        assert.ok(results instanceof Array)
        done()
      })
    })
  })
  
  describe('#send()', function() {
    var exp, stub
    beforeEach(function() {
      exp = expect.spawn('node', [fixture])
      stub = sinon.stub(exp._wStream, 'write')
    })
    it('should return an Expect object', function() {
      var obj = exp.send('ls\n')
      assert.ok(obj instanceof Expect)
    })
    it('should write to the Writeable Stream', function() {
      exp.send('ls\n')
      assert.ok(stub.calledWith('ls\n'))
    })
  })
  
  describe('#logger()', function() {
    it('should write to log stream', function() {
      var stream = {
        write : sinon.stub()
      }
      var exp = expect.spawn('node', [fixture], {log : stream})
      exp.logger('some text')
      assert.ok(stream.write.called)
    })
  })
})
