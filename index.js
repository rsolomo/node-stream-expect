var cp = require('child_process')

function Expect(readStream, writeStream) {
  this._rStream = readStream
  this._wStream = writeStream
  this.before = ''
  this._rStream.on('data', this.onData.bind(this))
}

Expect.prototype.onData = function(chunk) {
  this.before += chunk
}

Expect.prototype.expect = function(pattern, callback) {
  var self = this
  
  var timeoutId = setTimeout(function() {
    var err = new Error('Expect timed out.')
    self._rStream.removeListener('data', matcher)
    callback(err)
  }, 10000)

  function matcher(self, str) {
    if (str.match(pattern)) {
      self._rStream.removeListener('data', matcher)
      //this._before = ''
      clearTimeout(timeoutId)
      callback(null, str)
    }
  }
  
  this._rStream.on('data', function(chunk) {
    matcher(self, chunk.toString())
  })
  return this
}

Expect.prototype.send = function(string) {
  this._wStream.write(string)
  return this
}

exports.spawn = function(command, args, options) {
  var child = cp.spawn(command, args, options)
  return new Expect(child.stdout, child.stdin)
}

exports.init = function(readStream, writeStream) {
  return new Expect(readStream, writeStream)
} 

exports.Expect = Expect