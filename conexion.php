<?php
// Configuración de la conexión a la base de datos
$host = 'mysql-ricoline2.alwaysdata.net';
$dbname = 'ricoline2_arduino';
$username = 'ricoline2';
$password = '123456';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);

    // Configura el PDO error mode a excepción
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Consulta SQL para obtener los últimos datos
    $sql = "SELECT dato, led_color, fecha FROM tb_puerto_serial ORDER BY id_puerto_serial DESC LIMIT 100";
    $stmt = $pdo->query($sql);

    $data = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $data[] = $row;
    }

    // Enviar datos en formato JSON
    echo json_encode($data);
} catch (PDOException $e) {
    die("ERROR: Could not connect. " . $e->getMessage());
}
