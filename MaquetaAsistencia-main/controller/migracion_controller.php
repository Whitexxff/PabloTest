<?php
session_start();
require_once __DIR__ . '/../config/conexion.php';

$action = $_GET['action'] ?? ($_POST['action'] ?? '');

try {
    $pdo = Conexion::conectar();

    if ($action === 'exportar') {
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="Respaldo_Asistencia_' . date('Ymd_His') . '.csv"');
        $output = fopen('php://output', 'w');
        fputcsv($output, ['RUT', 'Fecha', 'Hora', 'Tipo Marca']);
        $stmt = $pdo->query("SELECT rut_funcionario, fecha, hora, tipo_marca FROM asistencia ORDER BY fecha DESC");
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) { fputcsv($output, $row); }
        fclose($output);
        exit;
    }

    if ($action === 'importar') {
        if (!isset($_FILES['archivo_csv'])) {
            die(json_encode(['status' => 0, 'message' => 'No se subió el archivo.']));
        }

        $lineas = file($_FILES['archivo_csv']['tmp_name']);
        if (empty($lineas)) {
            die(json_encode(['status' => 0, 'message' => 'El archivo está vacío.']));
        }

        $primeraLinea = $lineas[0];
        $delimitador = (substr_count($primeraLinea, ';') > substr_count($primeraLinea, ',')) ? ';' : ',';
        
        $agrupacion = [];

        foreach ($lineas as $num => $texto) {
            $col = str_getcsv(trim($texto), $delimitador);
            if ($num === 0 || count($col) < 3) continue;

            $rut = strtoupper(preg_replace('/[^0-9Kk]/', '', $col[0]));
            $fecha = date('Y-m-d', strtotime(str_replace('/', '-', $col[1])));
            $hora = date('H:i:s', strtotime($col[2]));

            if ($rut && $fecha != '1970-01-01') {
                $agrupacion[$rut][$fecha][] = $hora;
            }
        }
        
        $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM funcionarios WHERE rut = ?");
        // MODIFICACIÓN: Ahora insertamos el RUT y el CODIGO_TARJETA generados por PHP
        $stmtAutoEnrolar = $pdo->prepare("INSERT INTO funcionarios (rut, codigo_tarjeta, nombre, apellidoP) VALUES (?, ?, 'Por enrolar', 'Por enrolar')");
        $stmtInsert = $pdo->prepare("INSERT INTO asistencia (rut_funcionario, fecha, hora, tipo_marca) VALUES (?, ?, ?, ?)");
        
        $creados = 0;
        $nuevos = 0;

        foreach ($agrupacion as $rut => $fechas) {
            $stmtCheck->execute([$rut]);
            if ($stmtCheck->fetchColumn() == 0) {
                // LÓGICA DE AUTO-GENERACIÓN DE CÓDIGO (Igual que en el frontend JS)
                // 1. Tomamos el RUT (sin puntos ni guion) pero sin el dígito verificador (le quitamos el último caracter)
                $rutBase = substr($rut, 0, -1); 
                // 2. Generamos 5 números aleatorios (entre 10000 y 99999)
                $sufijoAleatorio = rand(10000, 99999);
                // 3. Los unimos
                $codigoGenerado = $rutBase . $sufijoAleatorio;

                // Ejecutamos el insert con el nuevo código
                $stmtAutoEnrolar->execute([$rut, $codigoGenerado]);
                $nuevos++;
            }

            foreach ($fechas as $fecha => $horas) {                
                if ($stmtInsert->execute([$rut, $fecha, $horas[0], 'entrada'])) $creados++;
                
                if (count($horas) > 1) {
                    if ($stmtInsert->execute([$rut, $fecha, end($horas), 'salida'])) $creados++;
                }
            }
        }

        http_response_code(200);
        echo json_encode([
            'status' => 1, 
            'message' => "Éxito: Se crearon $creados marcas y auto-enrolamos a $nuevos funcionarios genéricos."
        ]);
        exit;
    }
} catch (Exception $e) {
    http_response_code(503);
    echo json_encode(['status' => 0, 'message' => 'Error SQL: ' . $e->getMessage()]);
    exit;
}