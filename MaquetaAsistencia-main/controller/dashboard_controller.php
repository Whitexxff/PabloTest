<?php
session_start();

// Asegúrate de que esta ruta apunte correctamente al archivo de la clase que modificamos recién
require_once __DIR__ . '/clases/dashboard.php'; 

// Le decimos al navegador que devolveremos un JSON (importante para el JavaScript)
header('Content-Type: application/json; charset=utf-8');

// Recibimos la acción desde el JavaScript (fetch)
$action = $_GET['action'] ?? '';

try {
    if ($action === 'getStats') {
        // Llamamos a la función que ahora sí cuenta los "Por enrolar" y "Licencias"
        echo json_encode(Dashboard::obtenerEstadisticas());
    } else {
        echo json_encode(['status' => 0, 'message' => 'Acción no válida.']);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 0, 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
?>