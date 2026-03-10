<?php
session_start();
require_once 'clases/seccion.php'; 

header('Content-Type: application/json; charset=utf-8');

// Validación de seguridad (Solo admin)
$rol = $_SESSION['rol'] ?? '';
if ($rol !== 'admin' && $rol !== 'superadmin') {
    echo json_encode(['status' => 0, 'message' => 'Acceso denegado.']);
    exit();
}

$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true) ?? [];
$action = $_GET['action'] ?? ($data['action'] ?? '');

try {
    switch ($action) {
        case 'getSecciones':
            echo json_encode(['status' => 1, 'data' => Seccion::obtenerTodas()]);
            break;

        case 'createSeccion':
            if (empty(trim($data['nombre']))) throw new Exception("El nombre no puede estar vacío.");
            Seccion::crear(trim($data['nombre']));
            echo json_encode(['status' => 1, 'message' => 'Sección creada con éxito.']);
            break;

        case 'updateSeccion':
            if (empty(trim($data['nombre'])) || empty($data['id'])) throw new Exception("Faltan datos.");
            Seccion::actualizar($data['id'], trim($data['nombre']));
            echo json_encode(['status' => 1, 'message' => 'Sección actualizada correctamente.']);
            break;

        case 'deleteSeccion':
            Seccion::eliminar($data['id']);
            echo json_encode(['status' => 1, 'message' => 'Sección eliminada.']);
            break;

        default:
            echo json_encode(['status' => 0, 'message' => 'Acción no válida.']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['status' => 0, 'message' => $e->getMessage()]);
}
?>