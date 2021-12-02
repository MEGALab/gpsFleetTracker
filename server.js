const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const port = new SerialPort('/dev/ttyUSB0', {
  baudRate: 115200
})

const parser = port.pipe(new Readline({ delimiter: '\r\n' }))


port.on('data', function(data){
  console.log(data.toString())
})
port.write("ATSP0")

setTimeout(() => {
  
}, 3000);