var expect = require('../index')

var exp = expect.spawn('echo', ['test'])
exp.expect(/test/, function(err, match) {
   console.log(exp.before)
 })
