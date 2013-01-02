/*
 * This example is dependent upon pty.js
 * 
 * https://github.com/chjj/pty.js
 */

var pty = require('pty.js')
var expect = require('../index')
var term = pty.spawn('/bin/sh')

// Use pty Terminal as read and write stream
var exp = expect.createExpect(term, term)

// Expect shell prompt
exp.expect(/> |\$ |# /, function(err, output, results) {
  if (err) throw err
  console.log('OUTPUT:\n' + output)
  exp.send('echo "hi"\n')
  exp.expect(/> |\$ |# /, function(err, output, results) {
      if (err) throw err
      console.log('OUTPUT:\n' + output)
      term.destroy()
    })
})