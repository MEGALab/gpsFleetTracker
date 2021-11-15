/*
  Software serial multple serial test

 Receives from the hardware serial, sends to software serial.
 Receives from software serial, sends to hardware serial.

 The circuit:
 * RX is digital pin 10 (connect to TX of other device)
 * TX is digital pin 11 (connect to RX of other device)

 Note:
 Not all pins on the Mega and Mega 2560 support change interrupts,
 so only the following can be used for RX:
 10, 11, 12, 13, 50, 51, 52, 53, 62, 63, 64, 65, 66, 67, 68, 69

 Not all pins on the Leonardo and Micro support change interrupts,
 so only the following can be used for RX:
 8, 9, 10, 11, 14 (MISO), 15 (SCK), 16 (MOSI).

 created back in the mists of time
 modified 25 May 2012
 by Tom Igoe
 based on Mikal Hart's example

 This example code is in the public domain.

 */
#include <SoftwareSerial.h>

#include <TinyGPSPlus.h>

const int RXPin = 5, TXPin = 6;
const uint32_t GPSBaud = 9600; //Default baud of NEO-6M is 9600

TinyGPSPlus gps;                        // the TinyGPS++ object
SoftwareSerial gpsSerial(RXPin, TXPin); // the serial interface to the GPS device

void setup()
{
    Serial.begin(115200);
    gpsSerial.begin(GPSBaud);

    Serial.println(F("Arduino - GPS module"));
}

void loop()
{
    if (gpsSerial.available() > 0)
    {
        if (gps.encode(gpsSerial.read()))
        {
            if (gps.location.isValid())
            {
                Serial.print(F("- latitude: "));
                Serial.println(gps.location.lat());

                Serial.print(F("- longitude: "));
                Serial.println(gps.location.lng());

                Serial.print(F("- altitude: "));
                if (gps.altitude.isValid())
                    Serial.println(gps.altitude.meters());
                else
                    Serial.println(F("INVALID"));
            }
            else
            {
                Serial.println(F("- location: INVALID"));
            }

            Serial.print(F("- speed: "));
            if (gps.speed.isValid())
            {
                Serial.print(gps.speed.kmph());
                Serial.println(F(" km/h"));
            }
            else
            {
                Serial.println(F("INVALID"));
            }

            Serial.print(F("- GPS date&time: "));
            if (gps.date.isValid() && gps.time.isValid())
            {
                Serial.print(gps.date.year());
                Serial.print(F("-"));
                Serial.print(gps.date.month());
                Serial.print(F("-"));
                Serial.print(gps.date.day());
                Serial.print(F(" "));
                Serial.print(gps.time.hour());
                Serial.print(F(":"));
                Serial.print(gps.time.minute());
                Serial.print(F(":"));
                Serial.println(gps.time.second());
            }
            else
            {
                Serial.println(F("INVALID"));
            }

            Serial.println();
        }
    }

    if (millis() > 5000 && gps.charsProcessed() < 10)
        Serial.println(F("No GPS data received: check wiring"));
}
