// Importing all required libraries.
#include <String.h>
#include <LiquidCrystal_I2C.h>

// Setting up the LCD Display pins.
#define I2C_SDA 47
#define I2C_SCL 48

// Setting up the LED pins.
#define LED_GREEN 41
#define LED_RED 7

// Instancing the LCD display.
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Instancing buffers to store the passwords...
String registeredPassword;
String typedPassword;

// Controlling the app fluxe...
bool isPasswordSet = false;
bool isUserLogged = false;

void setup() {

  // Setting up the serial frequency.
  Serial.begin(9600);

  // Defining the pin mode of LEDS.
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);

  // Initializing the lcd display.
  Wire.begin(I2C_SDA, I2C_SCL);
  lcd.init();
  lcd.backlight();
  lcd.clear();

  // Printing an empty line...
  Serial.println("");

  // Asking for the password.
  Serial.println("Waiting for the four digit password... Please enter it in the serial monitor input.");

}

void loop() {

  // Allowing the reading from serial...
  while(!isPasswordSet) {

    if(Serial.available()) {

      // When user press enter, storing the password inside the buffer.
      registeredPassword = Serial.readStringUntil('\n');

      // If the entered password length is not 4...
      if(registeredPassword.length() != 4) {

        // Asking a new password.
        Serial.println("Please enter a four digit password!");

        // Returning...
        return;

      }

      // If password is registered...
      if(registeredPassword) {

        // Setting the password as set.
        isPasswordSet = true;

        // Printing a log...
        Serial.println("Password set successfully!");

      }

    }

  }

  // If password was set and user is'nt logged...
  if(isPasswordSet && !isUserLogged) {

    // Printing an empty line.
    Serial.println();

    // Printing the instruction.
    Serial.println("Please enter the password to login.");

  }

  // While password was set and user is'nt logged...
  while(isPasswordSet && !isUserLogged) {

    if(Serial.available()) {

      // When user press enter, storing the typed password inside the buffer.
      typedPassword = Serial.readStringUntil('\n');

      // Comparing the passwords...
      if(registeredPassword != typedPassword) {

        Serial.println("Incorrect password.");

        digitalWrite(LED_GREEN, LOW);
        digitalWrite(LED_RED, HIGH);

        lcd.clear();
        lcd.print("Incorrect pwd!");

        return;

      } else {

        isUserLogged = true;

        Serial.println("Login made successfully.");

        digitalWrite(LED_GREEN, HIGH);
        digitalWrite(LED_RED, LOW);

        lcd.clear();
        lcd.print("Authorized!");

        return;

      }

    }

  }
  

}
