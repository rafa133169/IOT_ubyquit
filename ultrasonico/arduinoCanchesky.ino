#include <Ultrasonic.h>

Ultrasonic ultrasonic(12, 13); // (Trig pin, Echo pin)
int ledR = 9; // LED Rojo
int ledA = 10; // LED Amarillo
int ledV = 11; // LED Verde
int pinSensorGasAnalogico = A1; // Pin analógico donde está conectado el sensor de gas MQ-2
int pinSensorGasDigital = 8; // Pin digital donde está conectado el sensor de gas MQ-2

void setup() {
  Serial.begin(9600);
  pinMode(ledR, OUTPUT);
  pinMode(ledA, OUTPUT);
  pinMode(ledV, OUTPUT);
  pinMode(pinSensorGasAnalogico, INPUT); // Configura el pin del sensor de gas como entrada
  pinMode(pinSensorGasDigital, INPUT);   // Configura el pin del sensor de gas como entrada
}

void loop() {
  if (Serial.available() > 0) {
    char command = Serial.read();
    controlLEDs(command);
  }

  long distance = ultrasonic.distanceRead(CM);
  Serial.print("Distancia: ");
  Serial.println(distance);

  int valorSensorGasAnalogico = analogRead(pinSensorGasAnalogico); // Lee el valor del sensor de gas
  int valorSensorGasDigital = digitalRead(pinSensorGasDigital);    // Lee el valor digital del sensor de gas

  Serial.print("Valor del sensor de gas (analogico): ");
  Serial.println(valorSensorGasAnalogico);
  Serial.print("Valor del sensor de gas (digital): ");
  Serial.println(valorSensorGasDigital);

  delay(1000);
}

void controlLEDs(char command) {
  // Apagar todos los LEDs primero
  digitalWrite(ledR, LOW);
  digitalWrite(ledA, LOW);
  digitalWrite(ledV, LOW);
  
  // Encender el LED basado en el comando recibido
  switch (command) {
    case 'R':
      digitalWrite(ledR, HIGH);
      break;
    case 'A':
      digitalWrite(ledA, HIGH);
      break;
    case 'V':
      digitalWrite(ledV, HIGH);
      break;
    default:
      // Si se recibe otro carácter, no hacer nada o apagar todos los LEDs
      break;
  }
}
