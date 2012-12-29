var assert = require('assert')
var stream = require('stream')
var path = require('path')
var mocha = require('mocha')
var sinon = require('sinon')
var expect = require('../index')

var Expect = expect.Expect

describe('stream-expect', function() {
  describe('#spawn()', function() {
    it('should return an instance of Expect', function() {
      var exp = expect.spawn('ls')
      assert.ok(exp instanceof Expect)
    })
  })
  
  describe('#init()', function() {
    it('should return an instance of Expect', function() {
      var exp = expect.init(new stream.Stream(), new stream.Stream())
      assert.ok(exp instanceof Expect)
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
    var exp, stub
    beforeEach(function() {
      exp = expect.spawn('ls')
      stub = sinon.stub(exp._wStream, 'write')
    })
    it('should write to the Writeable Stream', function() {
      exp.send('ls\n')
      assert.ok(stub.calledWith('ls\n'))
    })
    it('should return an Expect object', function() {
      var obj = exp.send('ls\n')
      assert.ok(obj instanceof Expect)
    })
  })
  
  describe('#onData()', function() {
    var exp
    beforeEach(function(done) {
      exp = expect.spawn(path.join(__dirname, 'fixtures', 'hello.js'))
      done()
    })
    it('should push string type chunks to before', function() {
      exp.onData('some text\n')
      exp.onData('more text\n')
      assert.equal(exp.before, 'some text\n' + 'more text\n')
    })
    it('should push buffer type chunks to before', function() {
      exp.onData(new Buffer('some text\n'))
      exp.onData(new Buffer('more text\n'))
      assert.equal(exp.before, 'some text\n' + 'more text\n')
    })
  })
})
