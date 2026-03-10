<?php
require_once 'clases/turno.php';

header('Content-Type: application/json; charset=utf-8');

$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true) ?? [];
$action = $_GET['action'] ?? ($data['action'] ?? '');

try {
    switch ($action) {
        case 'getTurnos':
            // Llama a la función obtenerTodos() de la clase Turno
            echo json_encode(['status' => 1, 'data' => Turno::obtenerTodos()]);
            break;

        case 'createTurno':
            // Llama a la función crear()
            Turno::crear($data['nombre'], $data['hora_entrada'], $data['hora_salida']);
            echo json_encode(['status' => 1, 'message' => 'Turno creado con éxito.']);
            break;

        case 'updateTurno':
            // Llama a la función actualizar()
            Turno::actualizar($data['id'], $data['nombre'], $data['hora_entrada'], $data['hora_salida']);
            echo json_encode(['status' => 1, 'message' => 'Turno actualizado con éxito.']);
            break;

        case 'deleteTurno':
            // Llama a la función eliminar()
            Turno::eliminar($data['id']);
            echo json_encode(['status' => 1, 'message' => 'Turno eliminado del sistema.']);
            break;

        default:
            echo json_encode(['status' => 0, 'message' => 'Acción no válida.']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['status' => 0, 'message' => $e->getMessage()]);
}
?>