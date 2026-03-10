<?php
session_start();
error_reporting(0); 
header('Content-Type: application/json; charset=utf-8');

try {
    require_once '../config/conexion.php'; 
    $pdo = Conexion::conectar();

    $action = $_GET['action'] ?? '';

    // =========================================================
    // 1. VERIFICAR USO (ALERTA AMARILLA)
    // =========================================================
    if ($action === 'verificarUso') {
        $tipo = $_GET['tipo'] ?? '';
        $id = $_GET['id'] ?? '';
        $cantidad = 0;

        if ($tipo === 'turno') {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM funcionarios WHERE IDturno = ?");
            $stmt->execute([$id]);
            $cantidad = $stmt->fetchColumn();
        } else if ($tipo === 'seccion') {
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM funcionarios WHERE IDseccion = ?");
            $stmt->execute([$id]);
            $cantidad = $stmt->fetchColumn();
        }

        echo json_encode(['status' => 1, 'cantidad' => $cantidad]);
        exit;
    }

    // =========================================================
    // 2. VALIDAR CONTRASEÑA MAESTRA ("admin1234")
    // =========================================================
    if ($action === 'validarPassword') {
        // Recibimos por GET y limpiamos espacios vacíos
        $passwordInput = trim($_GET['password'] ?? '');
        
        if ($passwordInput === 'admin1234') {
            echo json_encode(['status' => 1, 'message' => 'Autorizado.']);
        } else {
            echo json_encode(['status' => 0, 'message' => 'La clave ingresada no es la maestra.']);
        }
        exit;
    }

    echo json_encode(['status' => 0, 'message' => 'Acción no reconocida.']);

} catch (PDOException $e) {
    echo json_encode(['status' => 0, 'message' => 'Fallo BD: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['status' => 0, 'message' => 'Error General: ' . $e->getMessage()]);
}
?>