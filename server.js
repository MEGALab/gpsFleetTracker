const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const port = new SerialPort('/dev/ttyUSB0', {
  baudRate: 115200
})

const parser = port.pipe(new Readline({ delimiter: '\r' }))
parser.on('data', console.log)