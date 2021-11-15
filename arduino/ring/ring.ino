
#include <IridiumSBD.h>

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
#include <SoftwareSerial.h>
#include <TinyGPSPlus.h>
SoftwareSerial mySerial(7, 8);  // RX, TX
SoftwareSerial gpsSerial(5, 6); // RX, TX
#define IridiumSerial mySerial
#define RING_PIN 4
#define DIAGNOSTICS false // Change this to see diagnostics

IridiumSBD modem(IridiumSerial);
const uint32_t GPSBaud = 9600; //Default baud of NEO-6M is 9600

TinyGPSPlus gps; // the TinyGPS++ object
void setup()
{
    int signalQuality = -1;

    // Start the serial ports
    Serial.begin(115200);
    gpsSerial.begin(GPSBaud);

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
}
int messageReceived = 0;

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
            Serial.print("sendReceiveSBDBinary failed: error ");
            Serial.println(err);
            return;
        }

        Serial.println("Message received!");
        Serial.print("Inbound message size is ");
        Serial.println(bufferSize);
        for (int i = 0; i < (int)bufferSize; ++i)
        {
            Serial.print(buffer[i], HEX);
            if (isprint(buffer[i]))
            {
                Serial.print("(");
                Serial.write(buffer[i]);
                Serial.print(")");
            }
            Serial.print(" ");
        }
        Serial.println("Message:");

        String str = (char *)buffer;

        Serial.println(str);
        Serial.print("Messages remaining to be retrieved: ");
        Serial.println(modem.getWaitingMessageCount());
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
