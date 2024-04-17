import asyncio
import websockets
import mysql.connector
import serial
import json
import concurrent.futures

# Configuración de la base de datos
#Realiza la configuracion de la base de datos
db_config = {
    'host': '',
    'user': '',
    'password': '',
    'database': ''
}

# Configura el puerto serial según tu configuración de Arduino
arduino_serial = serial.Serial('COM3', 9600, timeout=1)


def update_led_status_in_db(status):
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("UPDATE estado_led SET led_status = %s WHERE id_estado_led = 1", (status,))
        conn.commit()
    except mysql.connector.Error as e:
        print(f"Error de base de datos: {e}")
    finally:
        cursor.close()
        conn.close()


def get_led_status_from_db():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT led_status FROM estado_led WHERE id_estado_led = 1")
        status = cursor.fetchone()[0]
        print(status)
        return status
    except mysql.connector.Error as e:
        print(f"Error de base de datos: {e}")
        return None
    finally:
        cursor.close()
        conn.close()


def get_ultrasonic_from_db():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        cursor.execute("SELECT dato, led_color FROM tb_puerto_serial ORDER BY id_puerto_serial DESC LIMIT 100")

        # Leer todos los resultados
        results = cursor.fetchall()

        # Convertir los resultados en una lista de tuplas
        data = [{"dato": dato, "color": led_color} for dato, led_color in results]

        # Devolver los resultados como un objeto
        return data
    except mysql.connector.Error as e:
        print(f"Error de base de datos: {e}")
        return None
    finally:
        cursor.close()
        conn.close()


def interactuar_arduino():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        while True:
            data = arduino_serial.readline().decode().strip()  # Leer y decodificar datos del Arduino

            if data:
                distancia = int(data)  # Convertir la distancia a entero
                # Determinar el color del LED basado en la distancia
                if distancia < 10:
                    led_color = 'rojo'
                    arduino_serial.write(b'R')  # Enviar comando para LED Rojo
                elif distancia < 20:
                    led_color = 'amarillo'
                    arduino_serial.write(b'A')  # Enviar comando para LED Amarillo
                else:
                    led_color = 'verde'
                    arduino_serial.write(b'V')  # Enviar comando para LED Verde

                # Preparar sentencia SQL para insertar los datos incluyendo el color del LED
                sql = "INSERT INTO tb_puerto_serial (dato, led_color) VALUES (%s, %s)"
                cursor.execute(sql, (data, led_color))
                conn.commit()
                print(f"Distancia: {data} cm, LED: {led_color}")

    except mysql.connector.Error as e:
        print(f"Error de base de datos: {e}")
    finally:
        # Cerrar conexiones
        cursor.close()
        conn.close()
        arduino_serial.close()


async def handle_led(websocket, path):
    status = get_led_status_from_db()
    await websocket.send(json.dumps({"Status": str(status), "Ultrasonico": ultrasonico}))

    # Enviar estado actual al cliente al conectarse
    async for message in websocket:
        if message in ["1", "0"]:
            update_led_status_in_db(message)
            arduino_serial.write(message.encode())
            await websocket.send(message)  # Opcional: Confirmar el cambio al cliente


async def start_server():
    # Crear tarea asincrónica para la interacción con Arduino en un subproceso
    with concurrent.futures.ThreadPoolExecutor() as executor:
        await asyncio.gather(
            asyncio.to_thread(interactuar_arduino),
            websockets.serve(handle_led, "localhost", 8765)
        )


if __name__ == "__main__":
    print("Iniciando servidor WebSocket...")
    asyncio.run(start_server())
