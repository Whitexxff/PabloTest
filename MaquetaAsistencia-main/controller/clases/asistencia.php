<?php
require_once __DIR__ . '/../../config/conexion.php';

class Asistencia {
    
    // 1. REGISTRAR MARCA CON FOTO
    public static function registrarMarca($codigo_escaner, $tipo_marca, $foto_base64 = null) {
        try {
            $pdo = Conexion::conectar();
            $codigo_limpio = trim($codigo_escaner);

            if (strlen($codigo_limpio) > 9) { 
                $rut_extraido = substr($codigo_limpio, 0, -5);
            } else {
                $rut_extraido = $codigo_limpio;
            }
            $rut_final = str_replace(['.', '-'], '', $rut_extraido);

            $sqlBusqueda = "SELECT rut, nombre, apellidoP FROM funcionarios 
                            WHERE REPLACE(REPLACE(rut, '.', ''), '-', '') = :rut LIMIT 1";
            $stmt = $pdo->prepare($sqlBusqueda);
            $stmt->bindParam(':rut', $rut_final);
            $stmt->execute();
            $funcionario = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$funcionario) return ['status' => 0, 'message' => "No se encontró el RUT ({$rut_extraido})."];

            $rut = $funcionario['rut'];
            $fecha_actual = date('Y-m-d');
            $hora_actual = date('H:i:s');

            $sqlInsert = "INSERT INTO asistencia (rut_funcionario, fecha, hora, tipo_marca, foto_seguridad) 
                          VALUES (:rut, :fecha, :hora, :tipo, :foto)";
            $stmtMarca = $pdo->prepare($sqlInsert);
            $stmtMarca->bindParam(':rut', $rut);
            $stmtMarca->bindParam(':fecha', $fecha_actual);
            $stmtMarca->bindParam(':hora', $hora_actual);
            $stmtMarca->bindParam(':tipo', $tipo_marca);
            $stmtMarca->bindParam(':foto', $foto_base64);
            
            if ($stmtMarca->execute()) {
                $accion = ($tipo_marca === 'entrada') ? 'Entrada' : 'Salida';
                return ['status' => 1, 'message' => "{$accion} exitosa a las {$hora_actual} hrs."];
            }
            return ['status' => 0, 'message' => 'Error interno al guardar en BD.'];
        } catch (PDOException $e) {
            return ['status' => 0, 'message' => 'Error BD: ' . $e->getMessage()];
        }
    }

    // 2. NUEVA FUNCIÓN: GUARDAR LICENCIA/PERMISO
    public static function registrarAusencia($rut, $tipo, $fecha_inicio, $fecha_fin, $observacion) {
        try {
            $pdo = Conexion::conectar();
            $sql = "INSERT INTO ausencia_permiso (rut_funcionario, tipo, fechaInicio, fechaFIN, observacion) 
                    VALUES (:rut, :tipo, :inicio, :fin, :obs)";
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':rut', $rut);
            $stmt->bindParam(':tipo', $tipo);
            $stmt->bindParam(':inicio', $fecha_inicio);
            $stmt->bindParam(':fin', $fecha_fin);
            $stmt->bindParam(':obs', $observacion);

            if ($stmt->execute()) {
                return ['status' => 1, 'message' => 'Licencia/Ausencia registrada correctamente.'];
            }
            return ['status' => 0, 'message' => 'Error al guardar la licencia.'];
        } catch (PDOException $e) {
            return ['status' => 0, 'message' => 'Error BD: ' . $e->getMessage()];
        }
    }

    // 3. CALENDARIO: CRUZANDO ASISTENCIA CON LICENCIAS
    public static function obtenerAsistenciaMes($rut, $mes, $anio) {
        try {
            $pdo = Conexion::conectar();
            
            $sqlTurno = "SELECT t.hora_entrada, t.hora_salida FROM funcionarios f LEFT JOIN turnos t ON f.IDturno = t.IDturno WHERE f.rut = :rut LIMIT 1";
            $stmtT = $pdo->prepare($sqlTurno);
            $stmtT->bindParam(':rut', $rut);
            $stmtT->execute();
            $turno = $stmtT->fetch(PDO::FETCH_ASSOC);
            
            $turno_ent = ($turno && $turno['hora_entrada']) ? $turno['hora_entrada'] : '08:00:00';
            $turno_sal = ($turno && $turno['hora_salida']) ? $turno['hora_salida'] : '17:00:00';

            // A. Rescatamos Asistencia
            $sqlMarcas = "SELECT fecha, hora, tipo_marca, foto_seguridad 
                          FROM asistencia WHERE rut_funcionario = :rut AND MONTH(fecha) = :mes AND YEAR(fecha) = :anio ORDER BY fecha ASC, hora ASC";
            $stmtM = $pdo->prepare($sqlMarcas);
            $stmtM->execute([':rut' => $rut, ':mes' => $mes, ':anio' => $anio]);
            $marcas = $stmtM->fetchAll(PDO::FETCH_ASSOC);

            // B. Rescatamos Licencias y Vacaciones de este mes
            $sqlLicencias = "SELECT tipo, fechaInicio, fechaFIN FROM ausencia_permiso 
                             WHERE rut_funcionario = :rut 
                             AND (MONTH(fechaInicio) = :mes OR MONTH(fechaFIN) = :mes) 
                             AND (YEAR(fechaInicio) = :anio OR YEAR(fechaFIN) = :anio)";
            $stmtL = $pdo->prepare($sqlLicencias);
            $stmtL->execute([':rut' => $rut, ':mes' => $mes, ':anio' => $anio]);
            $licencias = $stmtL->fetchAll(PDO::FETCH_ASSOC);

            $dias = [];
            
            // Llenamos marcas primero
            foreach ($marcas as $m) {
                $dia = (int)date('d', strtotime($m['fecha']));
                if (!isset($dias[$dia])) {
                    $dias[$dia] = ['entrada' => null, 'salida' => null, 'foto_entrada' => null, 'foto_salida' => null, 'estado_especial' => null];
                }
                if ($m['tipo_marca'] === 'entrada') {
                    $dias[$dia]['entrada'] = $m['hora']; 
                    $dias[$dia]['foto_entrada'] = $m['foto_seguridad']; 
                }
                if ($m['tipo_marca'] === 'salida') {
                    $dias[$dia]['salida'] = $m['hora']; 
                    $dias[$dia]['foto_salida'] = $m['foto_seguridad']; 
                }
            }

            // Aplicamos las licencias "aplastando" los días vacíos
            foreach ($licencias as $lic) {
                $inicio = strtotime($lic['fechaInicio']);
                $fin = strtotime($lic['fechaFIN']);
                
                // Determinamos la palabra clave que busca tu JavaScript
                $estadoPintar = 'licencia'; 
                if (stripos($lic['tipo'], 'Vacaciones') !== false || stripos($lic['tipo'], 'Feriado') !== false) {
                    $estadoPintar = 'vacaciones';
                }

                // Recorremos los días que dura la licencia
                for ($i = $inicio; $i <= $fin; $i += 86400) {
                    if ((int)date('m', $i) == $mes) {
                        $diaLicencia = (int)date('d', $i);
                        
                        // Si no hay marcas en ese día, le ponemos la etiqueta de licencia
                        if (!isset($dias[$diaLicencia])) {
                            
                            // CALCULAMOS SI ES LUNES(1) A VIERNES(5) PARA DARLE 8 HORAS (480 MINUTOS)
                            $diaSemana = (int)date('N', $i);
                            $minutosLicencia = ($diaSemana >= 1 && $diaSemana <= 5) ? 480 : 0;

                            // TU CÓDIGO ORIGINAL, SOLO LE AGREGAMOS LOS MINUTOS AL FINAL
                            $dias[$diaLicencia] = [
                                'entrada' => null, 
                                'salida' => null, 
                                'foto_entrada' => null, 
                                'foto_salida' => null, 
                                'estado_especial' => $estadoPintar,
                                'minutos_totales' => $minutosLicencia // <--- AQUÍ SE ASIGNAN LAS 8 HORAS
                            ];
                        }
                    }
                }
            }

            $calendario = [];
            foreach ($dias as $dia => $datos) {
                if ($datos['estado_especial']) {
                    $calendario[$dia] = [
                        'estado' => $datos['estado_especial'], 
                        'entrada' => '--:--',
                        'salida' => '--:--',
                        'trabajado' => '00:00',
                        'minutos_totales' => 0,
                        'extra' => '00:00',
                        'tipo_extra' => ''
                    ];
                    continue;
                }

                $entrada = $datos['entrada'];
                $salida = $datos['salida'];

                $estado = 'amarillo'; 
                $hrs_trabajadas = '00:00';
                $hrs_extra = '00:00';
                $tipo_extra = '';
                $minutos_totales = 0;

                if ($entrada && $salida) {
                    $t_ent = strtotime($entrada);
                    $t_sal = strtotime($salida);
                    $req_ent = strtotime($turno_ent);
                    $req_sal = strtotime($turno_sal);
                    if ($req_sal < $req_ent) $req_sal += 86400; 
                    if ($t_sal < $t_ent) $t_sal += 86400;

                    $segundos_trabajados = $t_sal - $t_ent;
                    $segundos_requeridos = $req_sal - $req_ent;
                    $minutos_totales = floor($segundos_trabajados / 60);
                    $h_trab = floor($segundos_trabajados / 3600);
                    $m_trab = floor(($segundos_trabajados % 3600) / 60);
                    $hrs_trabajadas = str_pad($h_trab, 2, '0', STR_PAD_LEFT) . ':' . str_pad($m_trab, 2, '0', STR_PAD_LEFT);

                    if ($segundos_trabajados >= $segundos_requeridos) {
                        $estado = 'verde'; 
                        $segundos_extra = $segundos_trabajados - $segundos_requeridos;
                        if ($segundos_extra > 60) {
                            $h_ext = floor($segundos_extra / 3600);
                            $m_ext = floor(($segundos_extra % 3600) / 60);
                            $hrs_extra = str_pad($h_ext, 2, '0', STR_PAD_LEFT) . ':' . str_pad($m_ext, 2, '0', STR_PAD_LEFT);
                            $hora_salida_real = (int)date('H', $t_sal);
                            $tipo_extra = ($hora_salida_real >= 21 || $hora_salida_real <= 7) ? 'Nocturna' : 'Diurna';
                        }
                    }
                }

                $calendario[$dia] = [
                    'entrada' => $entrada ? substr($entrada, 0, 5) : '--:--',
                    'salida' => $salida ? substr($salida, 0, 5) : '--:--',
                    'foto_entrada' => $datos['foto_entrada'],
                    'foto_salida' => $datos['foto_salida'], 
                    'estado' => $estado,
                    'trabajado' => $hrs_trabajadas,
                    'minutos_totales' => $minutos_totales,
                    'extra' => $hrs_extra,
                    'tipo_extra' => $tipo_extra
                ];
            }
            return $calendario;
        } catch (PDOException $e) {
            return ['error_bd' => "Error de BD: " . $e->getMessage()];
        }
    }
}
?>