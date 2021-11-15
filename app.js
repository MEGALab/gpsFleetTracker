var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
////var five = require("johnny-five");
//var board = new five.Board({
//  port: "/dev/ttyUSB0"
//});

const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const port = new SerialPort('/dev/ttyUSB0', {
  baudRate: 115200
})

const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
parser.on('data', function(string){
  console.log(string)
    //client.publish(string.toString())



})
/* GET home page. */

var doorRelayUnlock
var doorRelayLock
var fuelPumpRelay
var unKNownRelay
/*
board.on("ready", function() {
  doorRelayUnlock = new five.Relay({
    pin:9,
    type: "NO"


  })
  doorRelayLock = new five.Relay({
    pin:10,
    type: "NO"


  })

  fuelPumpRelay = new five.Relay({
    pin:11,
    type: "NO"


  })
  unKNownRelay = new five.Relay({
    pin:12,
    type: "NO"


  })
  doorRelayUnlock.close()
  fuelPumpRelay.open()
  doorRelayLock.close()
  unKNownRelay.close()
});
*/
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://localhost')

client.on('connect', function () {
  client.subscribe('/fleetTracker/Doors', function (err) {
    if (!err) {
      
    }
  })
})

client.on('message', function (topic, message) {
  console.log(topic + ":" + message)
  // message is Buffer
  let command = message.toString()
  switch (command) {
    case 'unlock':
      //doorRelayUnlock.open()
      setTimeout(() => {
        //doorRelayUnlock.close()
        client.publish('/fleetTracker/Doors', 'unLocked')
      }, 1000);
      break;
      case 'lock':
        //doorRelayLock.open()
        setTimeout(() => {
          //doorRelayLock.close()
          client.publish('/fleetTracker/Doors', 'Locked')
          
        }, 1000);
        break;
  }
  console.log(message.toString())
})
var obj = {
  GPS:{
    LAT: 25.23654,
    LON: -69.25415,
    Speed: 52,
    Course: 252,
    ALT: 231.25,
    DistFromBase:25.23,
    DirFromBase: 235


  },
  ODB:{
    Odometer: 45254.21,
    ThrottlePos: 25,
    EngineRunTime: 1250,
    IntakeAir: 32,
    CoolantTemp: 102,
    EngineTorq: 30,
    OilTemp: 125,
    AirTemp: 40,
    FuelLevel: 60,
    VehicleSpeed: 45,
    EngineSpeed: 3500,


  }


}


setInterval(() => {
  client.publish('/fleetTracker/Data', JSON.stringify(obj))
}, 10000);


module.exports = app;
