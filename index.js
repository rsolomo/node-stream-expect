var cp = require('child_process')
var util = require('util')
var EventEmitter = require('events').EventEmitter

function Expect(readStream, writeStream, options) {
  var opts = options || {} 
  var self = this
  this.child = opts.process || null
  this._rStream = readStream
  this._wStream = writeStream

  this._rStream.on('data', function(chunk) {
    self.emit('data', chunk.toString())
  })
}

util.inherits(Expect, EventEmitter)

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
    var results
    for (var i = 0, l = str.length; i < l; i++) {
      output += str[i]
      results = pattern.exec(output)
      if (results) {
        clearTimeout(timeoutId)
        return done(null, output, results)
      }
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
  return new Expect(child.stdout, child.stdin, { process : child })
}

exports.createExpect = function(readStream, writeStream, options) {
  return new Expect(readStream, writeStream, options)
}

exports.Expect = Expect