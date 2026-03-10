<?php
session_start();
require_once 'clases/usuario.php';

header('Content-Type: application/json; charset=utf-8');

// BLOQUEO DE SEGURIDAD ABSOLUTO
$rol = $_SESSION['rol'] ?? '';
if ($rol !== 'superadmin') {
    echo json_encode(['status' => 0, 'message' => 'Acceso denegado. Solo Superadmin.']);
    exit();
}

$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true) ?? [];
$action = $_GET['action'] ?? ($data['action'] ?? '');

try {
    switch ($action) {
        case 'getUsuarios':
            echo json_encode(['status' => 1, 'data' => Usuario::obtenerTodos()]);
            break;

        case 'createUsuario':
            if (empty($data['password'])) throw new Exception("La contraseña es obligatoria para usuarios nuevos.");
            Usuario::crear($data['nombre'], $data['login'], $data['password'], $data['rol'], $data['estado']);
            echo json_encode(['status' => 1, 'message' => 'Usuario creado con éxito.']);
            break;

        case 'updateUsuario':
            Usuario::actualizar($data['id'], $data['nombre'], $data['login'], $data['password'], $data['rol'], $data['estado']);
            echo json_encode(['status' => 1, 'message' => 'Usuario actualizado.']);
            break;

        case 'deleteUsuario':
            Usuario::eliminar($data['id']);
            echo json_encode(['status' => 1, 'message' => 'Usuario eliminado del sistema.']);
            break;

        default:
            echo json_encode(['status' => 0, 'message' => 'Acción no válida.']);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['status' => 0, 'message' => $e->getMessage()]);
}
?>