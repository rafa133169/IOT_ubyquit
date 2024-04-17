document.addEventListener("DOMContentLoaded", () => {
    const websocket = new WebSocket("ws://localhost:8765");
    let chart;
  
    websocket.onopen = () => console.log("Conectado al servidor WebSocket");
  
    // Manejar mensajes recibidos del servidor
    websocket.onmessage = (event) => {
      const message = event.data;
      var datos = JSON.parse(message);
      console.log("Status: " + datos.Status);
      console.log(datos.Ultrasonico);
      
      // Actualizar la interfaz de usuario según el estado del LED
      const toggleBtn = document.getElementById("toggleBtn");
  
      if (datos.Status === "1") {
        toggleBtn.checked = true;
      } else if (datos.Status === "0") {
        toggleBtn.checked = false;
      }
  
      // Actualizar el gráfico con los datos del sensor ultrasónico
      updateChart(datos.Ultrasonico);
    };
  
    document.getElementById("toggleBtn").addEventListener("change", function () {
      const command = this.checked ? "1" : "0";
      websocket.send(command);
      console.log("Enviado:", command);
    });
  
    function updateChart(ultrasonicData) {
      var ctx = document.getElementById("sensorUltrasonico").getContext("2d");
      var labels = [];
      var sensorData = [];
  
      if (Array.isArray(ultrasonicData)) {
        ultrasonicData.forEach(function (row) {
          labels.push(row.color);
          sensorData.push(row.dato);
        });
  
        // Si el gráfico ya existe, actualízalo; de lo contrario, créalo
        if (chart) {
          chart.data.labels = labels;
          chart.data.datasets[0].data = sensorData;
          chart.update();
        } else {
          chart = new Chart(ctx, {
            type: "line",
            data: {
              labels: labels,
              datasets: [
                {
                  label: "Sensor Ultrasonico",
                  backgroundColor: "rgb(51, 141, 255)",
                  borderColor: "rgb(93, 164, 255)",
                  data: sensorData,
                },
              ],
            },
            options: {},
          });
        }
      } else {
        console.error("Los datos del sensor ultrasónico no son válidos:");
      }
    }
  });
  