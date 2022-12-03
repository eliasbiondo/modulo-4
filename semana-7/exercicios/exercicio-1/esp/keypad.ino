// Including the required libraries.
#include <Keypad.h>
#include <string.h>
#include "EspMQTTClient.h"
#include <Wifi.h>

// Defining the buzzer output pin.
#define OUTPUT_BUZZER 35

// Defining the rows and columns quantity of keypad.
#define ROW_NUM     4
#define COLUMN_NUM  4

// Defining the input pins of the keypad.
byte pin_rows[ROW_NUM]      = { 9, 46,  3, 8};
byte pin_column[COLUMN_NUM] = {18, 17, 16, 15};

// Mapping the keypad keys.
char keys[ROW_NUM][COLUMN_NUM] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};

// Defining the keypad with the informations above.
Keypad keypad = Keypad( makeKeymap(keys), pin_rows, pin_column, ROW_NUM, COLUMN_NUM );

// Defining the WiFi credentials.
const char * WIFI_SSID = "Inteli-COLLEGE";
const char * WIFI_PASS = "QazWsx@123";

// Defining the MQTT Broker info to external communication.
const char * MQTT_HOST = "broker.hivemq.com";
const char * MQTT_CLIENT_ID = "5e8391cc-cecc-4d70-bd1d-731d17e7f7cf";
const char * MQTT_TOPIC_TO_PUBLISH = "JogoDaMemoria/TeclaPressionada";
const char * MQTT_TOPIC_TO_LISTEN = "JogoDaMemoria/TocarBuzzer";

// Setting up the MQTT Client.
EspMQTTClient client(

  WIFI_SSID,
  WIFI_PASS,
  MQTT_HOST,
  MQTT_CLIENT_ID
  
);

// Setting up some important commands to be executed on connection established.
void onConnectionEstablished() {

  // Printing a message.
  Serial.println("MQTT connection established successfully.");

  // Subscribing the client to the topic to listen defined above.
  client.subscribe(MQTT_TOPIC_TO_LISTEN, [](const String & payload) {
    
    // If payload notifies the game over...
    if(payload == "gameover") {

      // Playing a sound three times.
      for(int i = 0; i < 3; i++) {

        tone(OUTPUT_BUZZER, 3000);
        delay(500);
        noTone(OUTPUT_BUZZER);
        delay(100);

      }

    }

  });

}

// Defining the setup block.
void setup() {

  // Defining the frequency of the serial port.
  Serial.begin(115200);

  // Defining the pin mode of the buzzer.
  pinMode(OUTPUT_BUZZER, OUTPUT);

}

void loop() {

  // Initializing the MQTT client.
  client.loop();

  // Getting a possible key from keypad.
  char key = keypad.getKey();

  // If has a key, sending it to the target MQTT topic.
  if (key) {

    // Storing the char in a buffer.
    char buf[1] = {key};
    
    // Converting the character into a string.
    String mystring(buf); 
  
    // Publishing the stored char.
    client.publish(MQTT_TOPIC_TO_PUBLISH, mystring);

  }

}