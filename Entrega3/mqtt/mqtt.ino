/*
 This example connects to a WPA encrypted WiFi network,
 using the WiFi Shield 101.

 Then connects to the Arduino Cloud MQTT broker using
 SSL, and sends updates on the status of an LED which
 is controlled by a button.

 Circuit:
 * WiFi shield attached
 * LED
 * button

 */

#include <SPI.h>
#include <WiFi.h>

// include PubSubClient library
// https://github.com/knolleary/pubsubclient
#include <PubSubClient.h>

// WiFi settings
char ssid[]           = "wifing";     //  your network SSID (name)
char password[]       = "wifing-pub";  // your network password

// MQTT settings
char mqttServer[]     = "m11.cloudmqtt.com";
int  mqttPort         = 17451;
char mqttClientName[] = "arduinoWiFiClient";
char mqttUsername[]   = "irxannry";       // your MQTT username
char mqttPassword[]   = "LpAOhyNwQktz";       // your MQTT password
char mqttTopic[]      = "/tdi/home/config";  // your MQTT topic /<username>/topic

// You can also access the MQTT broker service
// using the same set of credentials using
// WebSockets via the following URI:
//
//   wss://mqtt.arduino.cc:9002/
//
// This would allow you to subscribe and publish
// to MQTT topics using a web browser.



// variables will change:
int wifiStatus        = WL_IDLE_STATUS;  // the Wifi radio's status
bool handshake = 0;

// Initialize the WiFi client library
WiFiClient wifiClient;

// Initialize the PubSubClient
PubSubClient mqttClient(mqttServer, mqttPort, callback, wifiClient);

void callback(char* topic, byte* payload, unsigned int length) {
  //*****************************************
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i=0;i<length;i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
  //*****************************************

  if (handshake == 0){
    mqttClient.unsubscribe(mqttTopic);
    Serial.print("Send Device Name");
    mqttClient.publish(mqttTopic, "Luz Principal");
    handshake = 1;
    mqttClient.subscribe("tdi/home/messages");
  }

  if ((char)payload[0] == '1') {
    //prender el led
    Serial.println("************ PRENDO LED ************");
    digitalWrite(2, HIGH); 
  }

  
  if ((char)payload[0] == '0') {
    //apagar el led
    Serial.println("************ APAGO LED ************");
    digitalWrite(2, LOW); 
  }
  
}
void setup() {
  // Initialize serial and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  setupWiFi();
  pinMode(2, OUTPUT);

  Serial.println(F("Connecting to MQTT broker ..."));
  if (mqttClient.connect(mqttClientName, mqttUsername, mqttPassword)) {
    Serial.println(F("Connected :D"));
    mqttClient.subscribe(mqttTopic);
  } else {
    Serial.println(F("Connection failed :("));
    // don't continue:
    while (true);
  }
}

void setupWiFi() {
  // check for the presence of the shield:
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println(F("WiFi shield not present"));
    // don't continue:
    while (true);
  }

  Serial.print("Firmware version is ");
  Serial.println(WiFi.firmwareVersion());

  // attempt to connect to Wifi network:
  while (wifiStatus != WL_CONNECTED) {
    Serial.print(F("Attempting to connect to WPA SSID: "));
    Serial.println(ssid);
    // Connect to WPA/WPA2 network:
    wifiStatus = WiFi.begin(ssid, password);

    if (wifiStatus != WL_CONNECTED) {
      // wait 10 seconds for next connection attempt
      delay(10000);
    }
  }

  Serial.println(F("Connected to wifi"));

  Serial.print(F("SSID: "));
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print(F("IP Address: "));
  Serial.println(ip);

  Serial.print(F("signal strength (RSSI):"));
  Serial.print(WiFi.RSSI());
  Serial.println(F(" dBm"));
}

void loop() {
  mqttClient.loop();
}
