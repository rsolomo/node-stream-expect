var assert = require('assert')
var path = require('path')
var mocha = require('mocha')
var sinon = require('sinon')
var pty = require('pty.js')
var expect = require('../index')

var Terminal = pty.Terminal
var Expect = expect.Expect

describe('pty-expect', function() {
  describe('#spawn()', function() {
    it('should return an instance of Expect', function() {
      var exp = expect.spawn()
      assert.ok(exp instanceof expect.Expect)
    })
  })
  
  describe('#init()', function() {
    it('should return an instance of Expect', function() {
      var exp = expect.init()
      assert.ok(exp instanceof expect.Expect)
    })
  })
  
  describe('#expect()', function() {
    var exp, clock
    beforeEach(function(done) {
      exp = expect.spawn(path.join(__dirname, 'fixtures', 'hello.js'))
      clock = sinon.useFakeTimers()
      done()
    })
    afterEach(function() {
      clock.restore()
    })
    it('should call callback(null) on pattern match', function(done) {
      exp.expect(/World/, function(err) {
        assert.strictEqual(null, err)
        done()
      })
    })
    it('should call callback(err) on timeout', function(done) {
      exp.expect(/nothing/, function(err) {
        assert.ok(err instanceof Error)
        done()
      })
      clock.tick(60 * 1000)
    })
    it('should return an Expect object', function() {
      var obj = exp.expect(/world/, function(){})
      assert.ok(obj instanceof Expect)
    })
  })
  
  describe('#send()', function() {
    var exp
    beforeEach(function() {
      exp = expect.spawn('ls')
    })
    it('should call stream.write', function() {
      var stub = sinon.stub(exp._stream, 'write')
      exp.send('ls\n')
      assert.ok(stub.calledWith('ls\n'))
    })
    it('should return an Expect object', function() {
      var obj = exp.send('ls\n')
      assert.ok(obj instanceof Expect)
    })
  })
  
  describe('#before()', function() {
    var exp
    beforeEach(function(done) {
      exp = expect.spawn(path.join(__dirname, 'fixtures', 'hello.js'))
      done()
    })
    it('should return a string', function() {
      var str = exp.before()
      assert.equal(typeof str, 'string')
    })
  })
  
  describe('#onData()', function() {
    var exp
    beforeEach(function(done) {
      exp = expect.spawn(path.join(__dirname, 'fixtures', 'hello.js'))
      done()
    })
    it('should push data to before', function() {
      exp.onData('some text\n')
      exp.onData('more text\n')
      assert.equal(exp._before, 'some text\n' + 'more text\n')
    })
  })
})
