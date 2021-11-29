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
var five = require("johnny-five");

var board = new five.Board({
  port: "/dev/ttyS0"
});

const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const port = new SerialPort('/dev/ttyUSB0', {
 baudRate: 115200
})
const gpsport = new SerialPort('/dev/ttyACM0', {
 baudRate: 9600
})


var GPS = require('gps');
var gps = new GPS;

const parser = port.pipe(new Readline({ delimiter: '\r\n' }))
const gpsparser = gpsport.pipe(new Readline({ delimiter: '\r\n' }))
gpsparser.on('data', function(gpsstring){
  gps.update(gpsstring)


})
var GPS = require('/home/pi/fleetTracker/node_modules/gps/gps.js');
var angles = require('angles');
var prevLat
var prevLon
var gpsData = {}
gpsData['state'] = {}
gps.on('data', function() {


 prevLat = gps.state.lat
 prevLon = gps.state.lon
 
 var head = GPS.Heading(gps.state.lat, gps.state.lat, prevLat, prevLon);
  var rose = angles.compass(head);
  gps.state['head'] = head
  gps.state['rose'] = rose
  gps.state['distBase'] = GPS.Distance(gps.state.lat, gps.state.lon, 38.441438, -78.881344)
  gps.state['dirBase'] = GPS.Heading(gps.state.lat, gps.state.lat, 38.441438, -78.881344)
  gpsData.state = gps.state
  
});

parser.on('data', function(string){
  console.log(string)
})
/* GET home page. */

var doorRelayUnlock
var doorRelayLock
var fuelPumpRelay
var unKNownRelay
  var obj = {
  GPS:{
    Time: '',
    LAT: '',
    LON: '',
    Speed:'',
    Course:'',
    ALT: '',
    DistFromBase:'',
    DirFromBase:''
  },
  ODB:{
    Odometer: '',
    ThrottlePos: '',
    EngineRunTime: '',
    IntakeAir: '',
    CoolantTemp: '',
    EngineTorq: '',
    OilTemp: '',
    AirTemp: '',
    FuelLevel: '',
    VehicleSpeed: '',
    EngineSpeed: '',
  }
}
board.on("ready", function() {


  doorRelayUnlock = new five.Relay({
    pin:12,
    type: "NO"


  })
  doorRelayLock = new five.Relay({
    pin:11,
    type: "NO"


  })

  fuelPumpRelay = new five.Relay({
    pin:10,
    type: "NO"


  })
  unKNownRelay = new five.Relay({
    pin:9,
    type: "NO"


  })
  doorRelayUnlock.open()
  fuelPumpRelay.close()
  doorRelayLock.open()
  unKNownRelay.open()

});

var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://localhost')

client.on('connect', function () {
console.log("conected MQTT");
  client.publish('/fleetTracker/AlphaOne/Jeep', 'Alpha-One Online')
  
  
  
  client.subscribe('/fleetTracker/AlphaOne/Doors', function (err) {
    if (!err) {
      
    }
  })
  client.subscribe('/fleetTracker/AlphaOne/Pump', function (err) {
    if (!err) {
      
    }
  })
})






client.on('message', function (topic, message) {
  console.log(topic + ":" + message)
  // message is Buffer
  let command = message.toString()
  if(topic==='/fleetTracker/data'){
    switch (command) {
      case 'location':
        client.publish('/fleetTracker/AlphaOne/data/location', obj.GPS)
        break;
      case 'obd':
         client.publish('/fleetTracker/AlphaOne/data/obd',obj.OBD )
        break;
  
    }
  }
  if(topic==='/fleetTracker/Doors'){
    switch (command) {
      case 'unlock':
        doorRelayUnlock.close()
        setTimeout(() => {
          doorRelayUnlock.open()
          client.publish('/fleetTracker/AlphaOne/Doors', 'unLocked')
        }, 1000);
        break;
      case 'lock':
        doorRelayLock.close()
        setTimeout(() => {
          doorRelayLock.open()
          client.publish('/fleetTracker/AlphaOne/Doors', 'Locked')
            
        }, 1000);
        break;
  
    }
  }
  if(topic==='/fleetTracker/AlphaOne/Pump'){
    switch (command) {
      case 'On':
        fuelPumpRelay.close()
        client.publish('/fleetTracker/AlphaOne/Pump', 'On')
        
        break;
      case 'Off':
          fuelPumpRelay.open()
          client.publish('/fleetTracker/AlphaOne/Pump', 'Off')
          
        break; 
    }
  }   
  console.log(message.toString())
})






require('dns').resolve('google.com', function(err) {
  if (err) {
     console.log("No connection");
  } else {
     console.log("Connected");
  }
});

setInterval(() => {

  
    obj.GPS.Time= gpsData.state.time,
    obj.GPS.LAT= gpsData.state.lat,
    obj.GPS.LON= gpsData.state.lon,
    obj.GPS.Speed= gpsData.state.speed,
    obj.GPS.Course= gpsData.state.head,
    obj.GPS.ALT= gpsData.state.alt,
    obj.GPS.DistFromBase=gpsData.state.distBase,
    obj.GPS.DirFromBase= gpsData.state.dirBase


    obj.ODB.Odometer= 45254.21,
    obj.ODB.ThrottlePos= 25,
    obj.ODB.EngineRunTime= 1250,
    obj.ODB.IntakeAir= 32,
    obj.ODB.CoolantTemp= 102,
    obj.ODB.EngineTorq= 30,
    obj.ODB.OilTemp= 125,
    obj.ODB.AirTemp= 40,
    obj.ODB.FuelLevel= 60,
    obj.ODB.VehicleSpeed= 45,
    obj.ODB.EngineSpeed= 3500,
  

  client.publish('/fleetTracker/AlphaOne/Data', JSON.stringify(obj))
}, 10000);


module.exports = app;
