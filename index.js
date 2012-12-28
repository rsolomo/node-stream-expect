var util = require('util')
var pty = require('pty.js')

function Expect(file, args, opt) {
  pty.Terminal.call(this, file, args, opt)
  this._stream = this
  this._before = ''
  this.on('data', this.onData.bind(this))
}

util.inherits(Expect, pty.Terminal)

Expect.prototype.onData = function(data) {
  this._before += data
}

Expect.prototype.expect = function(pattern, callback) {
  var self = this
  
  var timeoutId = setTimeout(function() {
    var err = new Error('Expect timed out.')
    self._stream.removeListener('data', matcher)
    callback(err)
  }, 10000)

  function matcher(data) {
    if (data.match(pattern)) {
      this._stream.removeListener('data', matcher)
      //this._before = ''
      clearTimeout(timeoutId)
      callback(null, self)
    }
  }
  
  this._stream.on('data', matcher.bind(this))
  return this
}

Expect.prototype.send = function(string) {
  this._stream.write(string)
  return this
}

Expect.prototype.before = function() {
  return this._before
}

exports.spawn = function(file, args, opt) {
  return new Expect(file, args, opt)
}

exports.init = function(file, args, opt) {
  return new Expect(file, args, opt)
} 

exports.Expect = Expect
