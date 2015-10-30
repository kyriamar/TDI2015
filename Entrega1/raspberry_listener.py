import bluetooth
import RPi.GPIO as GPIO
import time
import serial
 
arduino = serial.Serial('/dev/ttyACM0', 9600)

GPIO.setmode(GPIO.BCM)
GPIO.setup(17, GPIO.OUT) ## GPIO 17 como salida
GPIO.setup(27, GPIO.OUT) ## GPIO 17 como salida

server_sock=bluetooth.BluetoothSocket( bluetooth.RFCOMM )

port = 1
server_sock.bind(("",port))
server_sock.listen(1)

print "Esperando conexion"

client_sock,address = server_sock.accept()
print "conexion aceptada con ",address

while True:
        data = client_sock.recv(1024)
        if data == 'salir':
                print "chau"
                client_sock.close()
                server_sock.close()
                GPIO.cleanup() ## Hago una limpieza de los GPIO
		arduino.close()
                break
        if data == 'turn-left':
                GPIO.output(17, True)
                time.sleep(3)
                GPIO.output(17, False)
        if data == 'turn-slight-left':
                GPIO.output(17, True)
                time.sleep(0.5)
                GPIO.output(17, False)
                time.sleep(1)
                GPIO.output(17, True)
                time.sleep(0.5)
                GPIO.output(17, False)

        if data == 'turn-slight-right':
                GPIO.output(27, True)
                time.sleep(0.5)
                GPIO.output(27, False)
                time.sleep(1)
                GPIO.output(27, True)
                time.sleep(0.5)
                GPIO.output(27, False)

        if data == 'straight':
		GPIO.output(27, True)
		GPIO.output(17, True)
                time.sleep(2)
                GPIO.output(27, False)
                GPIO.output(17, False)

        if data == 'uturn-right' or data == 'uturn-left':
		GPIO.output(17, True)
                GPIO.output(27, True)
                time.sleep(3)
                GPIO.output(17, False)
		GPIO.output(27, False)
                time.sleep(1)
		#-------------------
                GPIO.output(17, True) 
		GPIO.output(27, True)
                time.sleep(3)
                GPIO.output(17, False)
		GPIO.output(27, False)

        if data == 'turn-right':
                GPIO.output(27, True)
                time.sleep(3)
                GPIO.output(27, False)

	if data == 'llegaste':
		GPIO.output(17, True)
		GPIO.output(27, True)
		time.sleep(1)
		GPIO.output(17, False)
                GPIO.output(27, False)
		time.sleep(1)
		#-------------------
		GPIO.output(17, True)
                GPIO.output(27, True)
                time.sleep(1)
                GPIO.output(17, False)
                GPIO.output(27, False)
                time.sleep(1)
		#-------------------
		GPIO.output(17, True)
                GPIO.output(27, True)
                time.sleep(1)
                GPIO.output(17, False)
                GPIO.output(27, False)
                time.sleep(1)

	if data == 'brake-on':
		arduino.write('H\n')

	if data == 'brake-off':
		arduino.write('L\n')		

        print "recibido [%s]" % data
