<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terminal de Asistencia - Municipalidad de Yerbas Buenas</title>

    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
    <link rel="stylesheet" href="../../assets/css/style.css?v=6">
    <script src="https://unpkg.com/html5-qrcode"></script>
</head>

<body class="d-flex flex-column vh-100" style="background-color: #f4f7f6;">

    <nav class="navbar terminal-header px-4 py-3 shadow-sm" ondblclick="window.location.href='VistaInicio.php'"
        style="user-select: none; cursor: default;">
        <div class="container-fluid d-flex justify-content-center justify-content-md-start align-items-center">
            <i class="bi bi-building fs-1 me-3 text-white"></i>
            <div>
                <h4 class="mb-0 fw-bold text-white tracking-wide">I. Municipalidad de Yerbas Buenas</h4>
                <span class="text-white-50 small text-uppercase fw-semibold" style="letter-spacing: 1px;">Terminal de Control de Asistencia</span>
            </div>
        </div>
    </nav>

    <main class="flex-grow-1 d-flex flex-column justify-content-center align-items-center p-3 p-md-4">

        <div class="text-center mb-4 mb-md-5">
            <div id="reloj-digital" class="reloj-terminal font-monospace">
                00:00:00
            </div>
            <h3 id="fecha-actual" class="fw-bold mt-1 text-capitalize" style="color: var(--yb-red);">Cargando fecha...</h3>
        </div>

        <div class="card border-0 shadow-lg p-4 p-md-5 text-center terminal-card w-100" style="max-width: 650px;">
            <h4 class="text-black fw-bold mb-4">
                <i class="bi bi-person-badge fs-3 text-danger-yb me-2 align-middle"></i>Pase su credencial por el lector
            </h4>

            <button type="button" class="btn btn-light border fw-bold mb-4 w-100 py-2 text-muted" id="btnToggleCamara" onclick="toggleCamaraEscaner()">
                <i class="bi bi-webcam-fill me-2 fs-5 align-middle"></i> Activar cámara del equipo
            </button>

            <div id="reader-container" class="mb-4 rounded-3 overflow-hidden shadow-sm border" style="display: none;">
                <div id="reader" width="100%"></div>
            </div>

            <form id="form_marcar_asistencia">

                <div class="input-group input-group-lg mb-4 shadow-sm rounded-3 overflow-hidden border input-wrapper bg-white transition">
                    <span class="input-group-text bg-transparent border-0 px-4" style="color: var(--yb-blue);">
                        <i class="bi bi-upc-scan fs-3"></i>
                    </span>
                    <input type="text" id="codigo_tarjeta"
                        class="form-control text-center fw-bold border-0 bg-transparent input-escaner py-3"
                        placeholder="Esperando lectura..." autofocus autocomplete="off"
                        style="caret-color: transparent;">
                </div>

                <div class="row g-3 mb-2">
                    <div class="col-6">
                        <input type="radio" class="btn-check" name="tipo_marca" id="marcaEntrada" value="entrada" autocomplete="off">
                        <label class="btn btn-entrada fw-bold py-3 fs-5 w-100 rounded-3" for="marcaEntrada">
                            <i class="bi bi-box-arrow-in-right d-block mb-2 fs-1"></i> Entrada
                        </label>
                    </div>
                    <div class="col-6">
                        <input type="radio" class="btn-check" name="tipo_marca" id="marcaSalida" value="salida" autocomplete="off">
                        <label class="btn btn-salida fw-bold py-3 fs-5 w-100 rounded-3" for="marcaSalida">
                            <i class="bi bi-box-arrow-left d-block mb-2 fs-1"></i> Salida
                        </label>
                    </div>
                </div>

                <button type="submit" class="d-none">Enviar Oculto</button>
            </form>

            <video id="videoSeguridad" autoplay muted playsinline style="display: none;"></video>
            <canvas id="canvasSeguridad" style="display: none;" width="640" height="480"></canvas>

        </div>

    </main>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="../../model/api.js?v=6"></script>
    <script src="../../assets/js/script.js?v=6"></script>
    
</body>
</html>