$(document).ready(function () {
    var ctx = document.getElementById("sensorHumo").getContext("2d");
    var chart = new Chart(ctx, {
      type: "line", // Tipo de gráfica
      data: {
        labels: [], // Las etiquetas de tiempo
        datasets: [
          {
            label: "Sensor Data",
            backgroundColor: "rgb(51, 141, 255)",
            borderColor: "rgb(93, 164, 255)",
            data: [], // Los datos del sensor
          },
        ],
      },
      options: {},
    });
  
    // Función para actualizar la gráfica
    function fetchData() {
      $.ajax({
        url: "http://localhost:4001/api/humo",
        type: "GET",
        success: function (data) {
  
          var labels = [];
          var sensorData = [];
  
          data.forEach(function (row) {
            labels.push(row.id);
            sensorData.push(row.dato);
          });
          
          chart.data.labels = labels;
          chart.data.datasets[0].data = sensorData;
          chart.update();
          
          var led6 = document.getElementById("led6");
  
          // Recuperar el color del último registro
          var lastColor = data[0].led_color;
          console.log("------LAst 2script: "+lastColor)
  
          // Cambiar el estado de los LEDs según el color recibido
          if (lastColor === "rojo") {
            led6.src = "img/fab4.png";
          } else if (lastColor === "amarillo") {
            led6.src = "img/fab3.png";
          } else if (lastColor === "verde") {
            led6.src = "img/fab2.png";
          }
        },
      });
    }
  
    // Actualizar la gráfica cada cierto tiempo, por ejemplo, cada 5 segundos
    setInterval(function () {
      fetchData(); // Actualizar la gráfica de datos
    }, 1000); // Ajustar el intervalo según sea necesario
  });
  