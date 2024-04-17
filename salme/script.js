$(document).ready(function () {
    var ctx = document.getElementById("sensorUltrasonico").getContext("2d");
    var chart = new Chart(ctx, {
        type: "line", // Tipo de gráfica
        data: {
            labels: [], // Las etiquetas de tiempo
            datasets: [
                {
                    label: "Sensor Ultrasonico",
                    backgroundColor: "rgb(51, 141, 255)",
                    borderColor: "rgb(93, 164, 255)",
                    data: [], // Los datos del sensor
                },
            ],
        },
        options: {},
    });

    // Crear una conexión WebSocket
var socket = new WebSocket("ws://localhost:8765");

// Función para manejar la apertura de la conexión WebSocket
socket.onopen = function () {
    console.log("Conexión WebSocket establecida");
};


    // Función para manejar los datos recibidos a través del WebSocket
    socket.onmessage = function (event) {
        console.log("Mensaje recibido del servidor:", event.data); 
    
        var data = JSON.parse(event.data);  // Parsear los datos recibidos del servidor
        var labels = chart.data.labels;
        var sensorData = chart.data.datasets[0].data;
        
        // Procesar los datos recibidos
        labels.push(data.timestamp);
        sensorData.push(data.value);
    
        // Actualizar la gráfica con los nuevos datos
        chart.update();
    
        // Cambiar el LED basado en el color recibido
        var led1 = document.getElementById("led1");
        var led2 = document.getElementById("led2");
        var led3 = document.getElementById("led3");
    
        if (data.color === "R") {
            led1.src = "img/VERDE-OFF.svg";
            led2.src = "img/AMARILLO-OFF.svg";
            led3.src = "img/ROJO-ON.svg";
        } else if (data.color === "A") {
            led1.src = "img/VERDE-OFF.svg";
            led2.src = "img/AMARILLO-ON.svg";
            led3.src = "img/ROJO-OFF.svg";
        } else if (data.color === "V") {
            led1.src = "img/VERDE-ON.svg";
            led2.src = "img/AMARILLO-OFF.svg";
            led3.src = "img/ROJO-OFF.svg";
        }
    };

    // Función para manejar errores en la conexión WebSocket
    socket.onerror = function (error) {
        console.error("WebSocket error: ", error);
    };

    // Función para manejar la conexión cerrada del WebSocket
    socket.onclose = function () {
        console.log("WebSocket connection closed");
    };

    // Actualizar la gráfica cada cierto tiempo
    setInterval(function () {
        // Enviar un mensaje al servidor para solicitar nuevos datos
        if (socket.readyState === WebSocket.OPEN) {
            socket.send("get_data");
            console.log("Mensaje enviado al servidor: get_data"); // Agregar este console.log
        } else {
            console.error('La conexión WebSocket no está abierta.');
        }
    }, 5000); // Ajustar el intervalo según sea necesario
});
