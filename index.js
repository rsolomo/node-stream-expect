var childProcess = require('child_process')

function Expect(readStream, writeStream, options) {
  var self = this
  var opts

  if (!arguments[1]) {
    this._wStream = readStream
    opts = {}
  } else if (!arguments[1].write) {
    this._wStream = readStream
    opts = arguments[1]
  } else {
    this._wStream = arguments[1]
    opts = options || {}
  }

  this.timeout = opts.timeout || 10000
  this.child = opts.process || null
  this._rStream = readStream
}

Expect.prototype.expect = function(pattern, callback) {
  var self = this
  var output = ''

  var timeoutId = setTimeout(function() {
    var err = new Error('Expect timed out after ' + self.timeout + 'ms')
    return done(err)
  }, self.timeout)

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
    self._rStream.removeListener('data', expListener)
    return callback(err, output, results)
  }

  this._rStream.on('data', expListener)
  return this
}

Expect.prototype.send = function(string) {
  this._wStream.write(string)
  return this
}

exports.spawn = function(command, args, options) {
  var child = childProcess.spawn(command, args, options)
  return new Expect(child.stdout, child.stdin, { process : child })
}

exports.createExpect = function(readStream, writeStream, options) {
  return new Expect(readStream, writeStream, options)
}

exports.Expect = Expect
