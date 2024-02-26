import serial
import time
import mysql.connector

ser = serial.Serial('COM3',9600)

conexion = mysql.connector.connect(
    host="mysql-ricoline2.alwaysdata.net",
    user="ricoline2",
    password="1234561331",
    database="ricoline2_arduino"
 )
mi_cursor = conexion.cursor()

while True:
    
    if ser.in_waiting:
        
        mensaje = ser.readline().decode('utf-8').rstrip().split(", ")
        datoString = ser.readline().decode('utf-8').rstrip().split(", ")
        dato = int(datoString[0])
        distancia = ''
        print(mensaje, dato)
        
        if dato >0 and dato <20:
            distancia = "Distancia Cercana"
            ser.write(b'A')
        elif dato >19 and dato <50:
            distancia = "Distancia Intermedia"
            ser.write(b'B')
        else:
            distancia = "Distancia Larga"
            ser.write(b'C')
        query = "INSERT INTO tb_puerto_serial (mensaje,dato,distancia) VALUES (%s,%s,%s)"
        
        distancia = [distancia]
        
    
        mi_cursor.execute(query,(mensaje + datoString + distancia))
        conexion.commit()
        print(f"Insertado correctamente a la BD ")
       
    time.sleep(1)
