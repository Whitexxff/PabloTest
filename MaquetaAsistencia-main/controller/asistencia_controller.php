<?php
require_once 'clases/asistencia.php';

header('Content-Type: application/json; charset=utf-8');

// Leemos datos si vienen por JSON (para las marcas del escáner)
$json_input = file_get_contents('php://input');
$data = json_decode($json_input, true) ?? [];

// El formulario de ausencias manda FormData, así que priorizamos el $_POST
$action = $_POST['action'] ?? $_GET['action'] ?? $data['action'] ?? '';

try {
    switch ($action) {
        case 'registrarMarca':
            $codigo = $data['codigo'] ?? $data['codigo_tarjeta'] ?? $data['rut'] ?? '';
            $tipo = $data['tipo'] ?? $data['tipo_marca'] ?? '';
            $foto = $data['foto'] ?? null; 
            
            if(empty($codigo)) {
                echo json_encode(['status' => 0, 'message' => 'El código llegó vacío al servidor.']);
                break;
            }

            $resultado = Asistencia::registrarMarca($codigo, $tipo, $foto);
            echo json_encode($resultado);
            break;
            
        case 'getAsistencia':
            $rut = $_GET['rut'] ?? '';
            $mes = $_GET['mes'] ?? date('m');
            $anio = $_GET['anio'] ?? date('Y');
            
            $datosMes = Asistencia::obtenerAsistenciaMes($rut, $mes, $anio);
            echo json_encode(['status' => 1, 'data' => $datosMes]);
            break;

        // ¡AQUÍ ESTÁ LA NUEVA PUERTA PARA LAS LICENCIAS!
        case 'registrarAusencia':
            $rut = $_POST['rut'] ?? '';
            $tipo = $_POST['tipo'] ?? '';
            $inicio = $_POST['fecha_inicio'] ?? '';
            $fin = $_POST['fecha_fin'] ?? '';
            $obs = $_POST['observacion'] ?? '';

            if (empty($rut) || empty($tipo) || empty($inicio) || empty($fin)) {
                echo json_encode(['status' => 0, 'message' => 'Faltan datos obligatorios para la licencia.']);
                break;
            }

            $resultado = Asistencia::registrarAusencia($rut, $tipo, $inicio, $fin, $obs);
            echo json_encode($resultado);
            break;

        default:
            echo json_encode(['status' => 0, 'message' => 'No reconozco la acción: ' . $action]);
            break;
    }
} catch (Exception $e) {
    echo json_encode(['status' => 0, 'message' => $e->getMessage()]);
}
?>