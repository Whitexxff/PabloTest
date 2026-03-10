<?php
session_start();
require_once 'clases/usuario.php';

// =========================================================================
// 1. CERRAR SESIÓN (Si recibe ?action=logout por la URL)
// =========================================================================
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    $_SESSION = array();
    session_destroy();
    header("Location: ../view/views/VistaLogin.php");
    exit();
}

// =========================================================================
// 2. INICIAR SESIÓN (Si recibe datos por POST desde tu JS)
// =========================================================================
header('Content-Type: application/json; charset=utf-8'); 

$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true);

if ($_SERVER["REQUEST_METHOD"] == "POST" && $data) {
    
    $nombre_usuario = trim($data['username'] ?? '');
    $contra = trim($data['password'] ?? '');

    if (empty($nombre_usuario) || empty($contra)) {
        echo json_encode(['status' => 0, 'message' => 'Campos vacíos']);
        exit();
    }
    
    $usuarioValido = Usuario::validarLogin($nombre_usuario, $contra);

    if ($usuarioValido) {
        $_SESSION['id_usuario'] = $usuarioValido['id'];
        $_SESSION['nombre']     = $usuarioValido['nombre']; 
        $_SESSION['rol']        = $usuarioValido['rol']; 
        
        echo json_encode([
            'status' => 1, 
            'message' => 'Login exitoso', 
            'rol' => $usuarioValido['rol'] 
        ]);
        exit();
    } else {
        echo json_encode(['status' => 0, 'message' => 'Usuario o contraseña incorrectos']);
        exit();
    }
} else {
    echo json_encode(['status' => 0, 'message' => 'Método no permitido']);
    exit();
}
?>