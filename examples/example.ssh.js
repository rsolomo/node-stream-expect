var expect = require('../index')

var exp = expect.spawn('/usr/bin/ssh', ['-l', 'yourusername', '127.0.0.1'], {
  cwd : process.env.HOME,
  env : process.env
})

exp.expect(/assword:/, function(err, data) {
  if (err) throw err
  exp.send('yourpass\n')
    .expect(/\$/, function(err, data) {
      if (err) throw err
      console.log(exp.before())
      exp.destroy()
    })
})
