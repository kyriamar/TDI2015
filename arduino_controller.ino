
int led1 = 9;           // the pin that the LED is attached to
int led2 = 6;
int ledrojo1 = 2;
int ledrojo2 = 4;
int loops = 0;
int transistor = 8;
int vccTrans = 13;

String incomingString;

void processInput(String inputData){
  if(inputData=="break-on\n"){
    digitalWrite(ledrojo1,HIGH);  // prende led rojo 1
    digitalWrite(ledrojo2,HIGH);  // prende led rojo 2
  }

  if(inputData=="break-off\n"){
    digitalWrite(ledrojo1,LOW); // apaga led rojo1
    digitalWrite(ledrojo2,LOW); // apaga led rojo 2
  }

  if(inputData=="trans-off\n"){
    digitalWrite(transistor,LOW); // apaga transistor
  }

  if(inputData=="trans-on\n"){
    digitalWrite(transistor,HIGH);  // prende transistor
  }
 
}

void setup() {
  // declarar los pins de salida:
  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);
  pinMode(ledrojo1, OUTPUT);
  pinMode(ledrojo2, OUTPUT);
  pinMode(transistor, OUTPUT);
  
  pinMode(vccTrans, OUTPUT);
  
  // empezar el puerto serial:
  Serial.begin(9600);
  
  incomingString = "";

  digitalWrite(transistor, LOW);
  digitalWrite(vccTrans, HIGH);

}


void loop() {
  // SENALERO
  loops=loops+1;

  if (loops == 15000){
    digitalWrite(led1, HIGH);   // prende el 1
    digitalWrite(led2, HIGH);   // prende el 2
  }
  if (loops == 30000){
    digitalWrite(led1, LOW);    // apaga el 1             
    digitalWrite(led2, LOW);    // apaga el 2
    loops = 0;
  }
  
  
  // FRENO
  // Check if there's incoming serial data.
  if (Serial.available() > 0) {
    // Read a byte from the serial buffer.
    char incomingByte = (char)Serial.read();
    incomingString += incomingByte;

    // Checks for null termination of the string.
    if (incomingByte == '\n') {
      // ...do something with String...
      processInput(incomingString);
      Serial.print(incomingString);
      incomingString = "";
    }
  }
}
