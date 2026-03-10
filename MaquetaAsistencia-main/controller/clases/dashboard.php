<?php
require_once __DIR__ . '/../../config/conexion.php';

class Dashboard {
    public static function obtenerEstadisticas() {
        try {
            $pdo = Conexion::conectar();
            
            // Obtenemos la fecha exacta de hoy (Ej: 2026-03-10)
            $fecha_hoy = date('Y-m-d');

            // 1. TOTAL FUNCIONARIOS (Le restamos los no enrolados para que sea un número real de activos)
            $stmtTotal = $pdo->query("SELECT COUNT(*) as total FROM funcionarios WHERE estado = 1 AND nombre NOT LIKE '%Por enrolar%'");
            $totalFuncionarios = $stmtTotal->fetch(PDO::FETCH_ASSOC)['total'];

            // =====================================================================
            // 2. ESTO FALTABA: CONTAR LOS QUE FALTAN POR ENROLAR (ALERTA AMARILLA)
            // =====================================================================
            $stmtPendientes = $pdo->query("SELECT COUNT(*) as pendientes FROM funcionarios WHERE nombre LIKE '%Por enrolar%' OR apellidoP LIKE '%Por enrolar%'");
            $pendientesEnrolar = $stmtPendientes->fetch(PDO::FETCH_ASSOC)['pendientes'];

            // 3. PRESENTES HOY
            $stmtPresentes = $pdo->prepare("SELECT COUNT(DISTINCT rut_funcionario) as presentes FROM asistencia WHERE fecha = :hoy AND tipo_marca = 'entrada'");
            $stmtPresentes->execute([':hoy' => $fecha_hoy]);
            $presentesHoy = $stmtPresentes->fetch(PDO::FETCH_ASSOC)['presentes'];

            // 4. ATRASOS HOY
            $sqlAtrasos = "SELECT COUNT(DISTINCT a.rut_funcionario) as atrasos
                           FROM asistencia a
                           INNER JOIN funcionarios f ON a.rut_funcionario = f.rut
                           INNER JOIN turnos t ON f.IDturno = t.IDturno
                           WHERE a.fecha = :hoy
                             AND a.tipo_marca = 'entrada'
                             AND a.hora > t.hora_entrada"; 
            $stmtAtrasos = $pdo->prepare($sqlAtrasos);
            $stmtAtrasos->execute([':hoy' => $fecha_hoy]);
            $atrasosHoy = $stmtAtrasos->fetch(PDO::FETCH_ASSOC)['atrasos'];

            // 5. LICENCIAS ACTIVAS (Modificado para mayor compatibilidad de fechas)
            $sqlLicencias = "SELECT COUNT(DISTINCT rut_funcionario) as licencias
                             FROM ausencia_permiso
                             WHERE :hoy >= fechaInicio AND :hoy <= fechaFIN";
            $stmtLicencias = $pdo->prepare($sqlLicencias);
            $stmtLicencias->execute([':hoy' => $fecha_hoy]);
            $licenciasActivas = $stmtLicencias->fetch(PDO::FETCH_ASSOC)['licencias'];

            // ENVIAMOS TODOS LOS DATOS (INCLUYENDO LOS PENDIENTES)
            return [
                'status' => 1,
                'data' => [
                    'total_funcionarios' => $totalFuncionarios,
                    'pendientes_enrolar' => $pendientesEnrolar, // ¡AQUÍ ESTÁ LA MAGIA DEL AVISO!
                    'presentes_hoy' => $presentesHoy,
                    'atrasos_hoy' => $atrasosHoy,
                    'licencias_activas' => $licenciasActivas
                ]
            ];
            
        } catch (PDOException $e) {
            return ['status' => 0, 'message' => 'Error BD: ' . $e->getMessage()];
        }
    }
}
?>