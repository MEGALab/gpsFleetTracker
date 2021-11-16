
#include <IridiumSBD.h>
#include <SoftwareSerial.h>
/*
 * Ring
 * 
 * This sketch demonstrates how to use the Iridium RING line to detect
 * when inbound messages are available and retrieve them.
 * 
 * Assumptions
 * 
 * The sketch assumes an Arduino Mega or other Arduino-like device with
 * multiple HardwareSerial ports.  It assumes the satellite modem is
 * connected to Serial3.  Change this as needed.  SoftwareSerial on an Uno
 * works fine as well.
 * 
 * This sketch assumes the RING pin is connected to Arduino pin 5
 * 
 */

SoftwareSerial mySerial(7, 8);  // RX, TX

#define IridiumSerial mySerial
#define RING_PIN 4
#define DIAGNOSTICS false // Change this to see diagnostics

IridiumSBD modem(IridiumSerial);
String inputString = "";         // a String to hold incoming data
bool stringComplete = false;
void setup()
{
    int signalQuality = -1;

    // Start the serial ports
    Serial.begin(115200);
   

    while (!Serial)
        ;
    IridiumSerial.begin(19200);

    // Setup the Iridium modem
    modem.setPowerProfile(IridiumSBD::USB_POWER_PROFILE);
    if (modem.begin() != ISBD_SUCCESS)
    {
        Serial.println("Couldn't begin modem operations.");
        exit(0);
    }

    // Check signal quality for fun.
    int err = modem.getSignalQuality(signalQuality);
    if (err != 0)
    {
        Serial.print("SignalQuality failed: error ");
        Serial.println(err);
        return;
    }

    Serial.print("Signal quality is ");
    Serial.println(signalQuality);
    Serial.println("Begin waiting for RING...");
    pinMode(4, INPUT);
    inputString.reserve(400);
}


void loop()
{


   
    static int err = ISBD_SUCCESS;

    if (digitalRead(4) == 0 || modem.getWaitingMessageCount() > 0)
    {
        if (digitalRead(4) == 0)
            Serial.println("RING asserted!  Let's try to read the incoming message.");
        else if (modem.getWaitingMessageCount() > 0)
            Serial.println("Waiting messages available.  Let's try to read them.");
        else
            Serial.println("Let's try again.");

        uint8_t buffer[200];
        size_t bufferSize = sizeof(buffer);
        err = modem.sendReceiveSBDText(NULL, buffer, bufferSize);
        if (err != ISBD_SUCCESS)
        {
            
            return;
        }

       
        for (int i = 0; i < (int)bufferSize; ++i)
        {
            
            if (isprint(buffer[i]))
            {
                
            }
           
        }
        

        String str = (char *)buffer;
        Serial.print("message:");
        Serial.println(str);
        
    }

    if (stringComplete) {
    //Serial.println(inputString);
    uint8_t buffer[200];
        size_t bufferSize = sizeof(buffer);
        char Buf[50];
    inputString.toCharArray(Buf, 50);
    modem.sendSBDText(Buf);
    // clear the string:
    inputString = "";
    stringComplete = false;
  }
}
void serialEvent() {
  while (Serial.available()) {
    // get the new byte:
    char inChar = (char)Serial.read();
    // add it to the inputString:
    inputString += inChar;
    // if the incoming character is a newline, set a flag so the main loop can
    // do something about it:
    if (inChar == '\n') {
      stringComplete = true;
    }
  }
}
#if DIAGNOSTICS
void ISBDConsoleCallback(IridiumSBD *device, char c)
{
    Serial.write(c);
}

void ISBDDiagsCallback(IridiumSBD *device, char c)
{
    Serial.write(c);
}
#endif