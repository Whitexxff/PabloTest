<?php
session_start();
require_once __DIR__ . '/clases/asistencia.php';
require_once __DIR__ . '/../config/conexion.php';

// 1. Recibimos los datos de la URL
$rut = $_GET['rut'] ?? '';
$mes = $_GET['mes'] ?? date('m');
$anio = $_GET['anio'] ?? date('Y');

if (empty($rut)) {
    die("Error: No se especificó el funcionario para el reporte.");
}

// 2. Buscamos los datos del Funcionario
try {
    $pdo = Conexion::conectar();
    $sqlFunc = "SELECT f.rut, f.nombre, f.apellidoP, f.apellidoM, s.nombre as seccion, t.nombre as turno, f.tipo_contrato 
                FROM funcionarios f
                LEFT JOIN secciones s ON f.IDseccion = s.id
                LEFT JOIN turnos t ON f.IDturno = t.IDturno
                WHERE f.rut = :rut LIMIT 1";
    $stmt = $pdo->prepare($sqlFunc);
    $stmt->execute([':rut' => $rut]);
    $funcionario = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$funcionario) die("Error: Funcionario no encontrado.");

} catch (Exception $e) {
    die("Error de Base de Datos: " . $e->getMessage());
}

// 3. Calculamos la asistencia base
$datosMes = Asistencia::obtenerAsistenciaMes($rut, $mes, $anio);
$nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
$nombreMesStr = $nombresMeses[$mes - 1];

// 4. Lógica de Separación de Horas y Corrección de Licencias
$minutos_ordinarios = 0;
$minutos_extra_diurnas = 0;
$minutos_extra_nocturnas = 0;

foreach ($datosMes as $dia => &$info) {
    // Verificar qué día de la semana es (1 = Lunes, 7 = Domingo)
    $fecha_str = "$anio-" . str_pad($mes, 2, '0', STR_PAD_LEFT) . "-" . str_pad($dia, 2, '0', STR_PAD_LEFT);
    $dia_semana = date('N', strtotime($fecha_str));

    // REPARACIÓN DE LICENCIAS MÉDICAS Y VACACIONES PARA EL PDF
    $esLicencia = (isset($info['estado']) && in_array($info['estado'], ['licencia', 'vacaciones'])) || (isset($info['estado_especial']) && in_array($info['estado_especial'], ['licencia', 'vacaciones']));
    
    if ($esLicencia) {
        if ($dia_semana >= 1 && $dia_semana <= 5) {
            // De Lunes a Viernes: Vale por 8 horas (480 minutos)
            $info['minutos_totales'] = 480;
            $info['trabajado'] = "08:00"; 
        } else {
            // Sábado o Domingo: Vale 0 horas
            $info['minutos_totales'] = 0;
            $info['trabajado'] = "00:00";
        }
        // Limpiamos datos visuales de la tabla para que se vea ordenado
        $info['entrada'] = "---";
        $info['salida'] = strtoupper($info['estado'] ?? $info['estado_especial']); // Imprime "LICENCIA"
        $info['extra'] = "00:00";
        $info['tipo_extra'] = "-";
    }

    // CÁLCULO DE SUMATORIAS TOTALES DEL MES
    if (isset($info['estado']) && $info['estado'] !== 'gris') {
        
        $extra_str = $info['extra'] ?? '00:00';
        $partes_extra = explode(':', $extra_str);
        $extra_mins = (int)$partes_extra[0] * 60 + (int)$partes_extra[1];

        $min_trabajados = $info['minutos_totales'] ?? 0;

        // Separar minutos ordinarios
        if ($esLicencia) {
            $min_ordinarios_dia = $min_trabajados;
        } else {
            $min_ordinarios_dia = $min_trabajados - $extra_mins;
            if ($min_ordinarios_dia < 0) $min_ordinarios_dia = 0;
        }

        $minutos_ordinarios += $min_ordinarios_dia;

        // Clasificar las horas extras
        if (isset($info['tipo_extra'])) {
            if ($info['tipo_extra'] === 'Diurna') {
                $minutos_extra_diurnas += $extra_mins;
            } elseif ($info['tipo_extra'] === 'Nocturna') {
                $minutos_extra_nocturnas += $extra_mins;
            }
        }
    }
}
unset($info); // Romper referencia

// VALIDACIÓN LEGAL DE HORAS EXTRAS (Máximo 40 horas al mes)
$total_minutos_extras = $minutos_extra_diurnas + $minutos_extra_nocturnas;
$excede_limite_legal = $total_minutos_extras > (40 * 60);

// Función para formatear minutos a "HH:MM hrs"
function formatoHoras($minutos_totales) {
    if ($minutos_totales == 0) return "00:00";
    $horas = floor($minutos_totales / 60);
    $minutos = $minutos_totales % 60;
    return str_pad($horas, 2, '0', STR_PAD_LEFT) . ':' . str_pad($minutos, 2, '0', STR_PAD_LEFT);
}

// 5. Generar el nombre del archivo
$nombreSinEspacios = str_replace(' ', '', $funcionario['nombre']);
$mesFormateado = str_pad($mes, 2, '0', STR_PAD_LEFT);
$nombre_archivo = "{$nombreSinEspacios}_{$rut}_{$anio}{$mesFormateado}.pdf";
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Generando Reporte...</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <style>
        body { background-color: #f0f2f5; display: flex; justify-content: center; padding: 20px; margin: 0; }
        #reporte-pdf { 
            background-color: white; 
            width: 100%; 
            max-width: 850px; 
            margin: 0 auto;
            padding: 40px; 
            font-family: Arial, sans-serif; 
            font-size: 12px; 
            color: #000;
        }
        .cabecera-oficial { border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .tabla-reporte th { background-color: #f8f9fa !important; font-size: 11px; text-transform: uppercase; border: 1px solid #dee2e6;}
        .tabla-reporte td { padding: 5px 8px; border: 1px solid #dee2e6; }
        
        /* Estilo para fila de licencia */
        .fila-licencia { background-color: #f4f6f9; color: #495057; font-style: italic; }
        
        .firma-box { margin-top: 50px; text-align: center; }
        .linea-firma { border-top: 1px solid #000; width: 250px; margin: 0 auto; margin-top: 60px; padding-top: 5px; font-weight: bold; }
        
        /* Alerta legal */
        .alerta-legal { border: 1px solid #dc3545; background-color: #f8d7da; color: #721c24; padding: 12px; margin-top: 15px; border-radius: 5px; font-size: 11px; }
        
        #pantalla-carga { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.9); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 1000; }
    </style>
</head>
<body>

<div id="pantalla-carga">
    <div class="spinner-border text-danger mb-3" style="width: 3rem; height: 3rem;" role="status"></div>
    <h3 class="text-dark fw-bold">Generando PDF...</h3>
    <p class="text-muted">La descarga comenzará automáticamente.</p>
</div>

<div id="reporte-pdf">
    <div class="cabecera-oficial d-flex justify-content-between align-items-center">
        <div>
            <h4 class="mb-0 fw-bold">MUNICIPALIDAD DE YERBAS BUENAS</h4>
            <span class="text-muted">Departamento de Recursos Humanos</span>
        </div>
        <div class="text-end">
            <h5 class="mb-0 fw-bold">REPORTE DE ASISTENCIA</h5>
            <span>PERIODO: <?php echo strtoupper($nombreMesStr) . ' ' . $anio; ?></span>
        </div>
    </div>

    <div class="row mb-4">
        <div class="col-8">
            <strong>Nombre Completo:</strong> <?php echo $funcionario['nombre'] . ' ' . $funcionario['apellidoP'] . ' ' . $funcionario['apellidoM']; ?><br>
            <strong>RUT:</strong> <?php echo $funcionario['rut']; ?><br>
            <strong>Tipo de Contrato:</strong> <?php echo $funcionario['tipo_contrato']; ?>
        </div>
        <div class="col-4 text-end">
            <strong>Sección:</strong> <?php echo $funcionario['seccion'] ?? 'No asignada'; ?><br>
            <strong>Turno Asignado:</strong> <?php echo $funcionario['turno'] ?? 'No asignado'; ?>
        </div>
    </div>

    <table class="table table-sm tabla-reporte w-100 text-center mb-0">
        <thead>
            <tr>
                <th>Día</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Total Trabajado</th>
                <th>Horas Extras</th>
                <th>Tipo Extra</th>
            </tr>
        </thead>
        <tbody>
            <?php 
            $diasDelMes = cal_days_in_month(CAL_GREGORIAN, $mes, $anio);
            for ($i = 1; $i <= $diasDelMes; $i++) {
                if (isset($datosMes[$i])) {
                    $d = $datosMes[$i];
                    
                    // Identificamos si es licencia para pintarla distinto
                    $es_licencia = (isset($d['estado']) && in_array($d['estado'], ['licencia', 'vacaciones'])) || (isset($d['estado_especial']) && in_array($d['estado_especial'], ['licencia', 'vacaciones']));
                    $clase_fila = $es_licencia ? "fila-licencia" : "";

                    echo "<tr class='$clase_fila'>
                            <td class='fw-bold'>$i</td>
                            <td>{$d['entrada']}</td>
                            <td>{$d['salida']}</td>
                            <td class='fw-bold'>{$d['trabajado']}</td>
                            <td>" . ($d['extra'] !== '00:00' ? "+{$d['extra']}" : "-") . "</td>
                            <td>{$d['tipo_extra']}</td>
                          </tr>";
                } else {
                    echo "<tr>
                            <td class='fw-bold text-muted'>$i</td>
                            <td colspan='5' class='text-muted small'><em>Sin registro</em></td>
                          </tr>";
                }
            }
            ?>
        </tbody>
    </table>

    <?php if ($excede_limite_legal): ?>
    <div class="alerta-legal">
        <strong>⚠️ ADVERTENCIA LEGAL POR SOBRETIEMPO:</strong> El total de horas extraordinarias de este funcionario supera el límite máximo permitido mensual (40 horas).<br>
        <em>* Estatuto Administrativo (Ley N° 18.883), Art. 63: "Los trabajos extraordinarios no podrán exceder de 40 horas mensuales".</em><br>
        <em>* Código del Trabajo, Art. 31: "Podrá pactarse horas extraordinarias hasta un máximo de 2 horas por día" (Límite proporcional).</em>
    </div>
    <?php endif; ?>

    <table class="table table-sm tabla-reporte w-100 mt-4">
        <tbody>
            <tr>
                <td class="text-end fw-bold w-75">TOTAL HORAS ORDINARIAS (Incluye licencias):</td>
                <td class="fw-bold fs-6 text-center w-25"><?php echo formatoHoras($minutos_ordinarios); ?> hrs</td>
            </tr>
            <tr>
                <td class="text-end fw-bold">TOTAL EXTRAS DIURNAS (25%):</td>
                <td class="fw-bold fs-6 text-center text-primary"><?php echo formatoHoras($minutos_extra_diurnas); ?> hrs</td>
            </tr>
            <tr>
                <td class="text-end fw-bold">TOTAL EXTRAS NOCTURNAS / FESTIVAS (50%):</td>
                <td class="fw-bold fs-6 text-center text-danger"><?php echo formatoHoras($minutos_extra_nocturnas); ?> hrs</td>
            </tr>
            <tr class="table-secondary">
                <td class="text-end fw-bold fs-5">GRAN TOTAL DEL MES:</td>
                <td class="fw-bold fs-5 text-center"><?php echo formatoHoras($minutos_ordinarios + $minutos_extra_diurnas + $minutos_extra_nocturnas); ?> hrs</td>
            </tr>
        </tbody>
    </table>

    <div class="row mt-5 pt-4">
        <div class="col-6 firma-box">
            <div class="linea-firma">Firma del Funcionario</div>
            <small>Acepta conforme el registro de jornada</small>
        </div>
        <div class="col-6 firma-box">
            <div class="linea-firma">Jefatura / Recursos Humanos</div>
            <small>V°B° Control de Asistencia</small>
        </div>
    </div>
</div>

<script>
    window.onload = function() {
        const elemento = document.getElementById('reporte-pdf');
        
        const opciones = {
            margin:       [15, 10, 15, 10], 
            filename:     '<?php echo $nombre_archivo; ?>',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'mm', format: 'legal', orientation: 'portrait' } 
        };

        html2pdf().set(opciones).from(elemento).save().then(function() {
            document.getElementById('pantalla-carga').innerHTML = `
                <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                <h3 class="mt-3 text-dark fw-bold">¡Descarga Completada!</h3>
                <p class="text-muted">El archivo <b><?php echo $nombre_archivo; ?></b> se guardó en tus Descargas.</p>
                <button class="btn btn-outline-secondary mt-3" onclick="window.close()">Cerrar Pestaña</button>
            `;
        });
    };
</script>

</body>
</html>