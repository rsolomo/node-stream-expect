var cp = require('child_process')
var util = require('util')
var EventEmitter = require('events').EventEmitter

function Expect(readStream, writeStream, options) {
  var opts = options || {} 
  var self = this
  this.log = opts.log
  this._rStream = readStream
  this._wStream = writeStream
  this.child = opts.process

  if (this.log) {
    this.on('data', this.logger.bind(this))
  }
  
  this._rStream.on('data', function(chunk) {
    self.emit('data', chunk.toString())
  })
}

util.inherits(Expect, EventEmitter)

Expect.prototype.logger = function(string) {
  this.log.write(string)
}

Expect.prototype.expect = function(pattern, callback) {
  var self = this
  var output = ''
  
  var timeoutId = setTimeout(function() {
    var err = new Error('Expect timed out.')
    return done(err)
  }, 10000)
  
  function expListener (chunk) {
    var str = chunk.toString()
    var data = {}
    var results = pattern.exec(str)
    output += str
    
    if (results) {
      clearTimeout(timeoutId)
      return done(null, output, results)
    }
  }

  function done(err, output, results) {
    self.removeListener('data', expListener)
    return callback(err, output, results)
  }

  this.on('data', expListener)
  return this
}

Expect.prototype.send = function(string) {
  this._wStream.write(string)
  return this
}

exports.spawn = function(command, args, options) {
  var child = cp.spawn(command, args, options)
  var opts = options || {}
  return new Expect(child.stdout, child.stdin, {
    process : child,
    log : opts.log
  })
}

exports.init = function(readStream, writeStream, options) {
  return new Expect(readStream, writeStream, options)
}

exports.Expect = Expect