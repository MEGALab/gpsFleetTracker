// app.js

const express = require('express')
const logger = require('morgan')
const bodyParser = require('body-parser')
const cors = require('cors')

const plates = require('./routes/plates')

const app = express()

app.use(cors())
app.use(logger('dev'))
app.use(bodyParser.json({limit: '2mb'}))
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/plates', plates)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send()
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.send()
})


const { spawn } = require('child_process');
const child = spawn('alpr /home/pi/express-openalpr-server/plate1.jpeg', {shell: true});
child.stdout.on('data', (data) => {
  var string = data.toString()
  string=String(string).replace('\t','');
  var substrings = string.split('\n')
  var stringClean =String(substrings[1]).replace('\t','');
  var stringClean2 =String(substrings[2]).replace('\t','');
  var uncleanPlateString = stringClean.split(/[ ,]+/)
child.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});
  
child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
  console.log(uncleanPlateString[2])
  console.log(uncleanPlateString[4]);
});
setTimeout(() => {
  const child2 = spawn('alpr /home/pi/express-openalpr-server/plate2.jpg', {shell: true});
  child2.stdout.on('data', (data) => {
      var string = data.toString()
      console.log(string)
      string=String(string).replace('\t','');
      var substrings = string.split('\n')
      var stringClean =String(substrings[1]).replace('\t','');
      var stringClean2 =String(substrings[2]).replace('\t','');
      var uncleanPlateString = stringClean.split(/[ ,]+/)

      console.log(uncleanPlateString[2])
      console.log(uncleanPlateString[4]);
  });
  child2.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});
  
child2.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
  setTimeout(() => {
    const child3 = spawn('alpr /home/pi/express-openalpr-server/plate3.jpg', {shell: true});
    child3.stdout.on('data', (data) => {
    var string = data.toString()
    console.log(string)
    string=String(string).replace('\t','');
    var substrings = string.split('\n')
    var stringClean =String(substrings[1]).replace('\t','');
    var stringClean2 =String(substrings[2]).replace('\t','');
    var uncleanPlateString = stringClean.split(/[ ,]+/)


    console.log(uncleanPlateString[2])
    console.log(uncleanPlateString[4]);
  });
  child3.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});
  
child3.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
}, 1000);
}, 1000);


  





module.exports = app
