<?php include '../includes/header.php'; ?>

<div class="header-seccion">
    <div>
        <h1>Enrolamiento de Funcionario</h1>
        <p>Registra un nuevo trabajador y genera su credencial de acceso.</p>
    </div>
    <div>
        <a href="VistaAsistencia.php" class="btn btn-light shadow-sm fs-5 px-4">
            <i class="bi bi-arrow-left me-2"></i> Volver a la Lista
        </a>
    </div>
</div>

<div class="row g-4">
    <div class="col-12 col-lg-7">
        <div class="card border-0 shadow-sm h-100 border-top-danger-yb">
            <div class="card-body p-4 p-md-5 d-flex flex-column justify-content-center">
                <h4 class="fw-bold text-danger-yb mb-4"><i class="bi bi-person-lines-fill me-2"></i>Datos del Funcionario</h4>
                <form id="form-enrolar">
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-bold small text-muted">RUT</label>
                            <input type="text" class="form-control" id="enrolar_rut" placeholder="Ej. 12345678-9" required oninput="generarCodigoAutomatico()">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold small text-muted">Nombres</label>
                            <input type="text" class="form-control" id="enrolar_nombres" required>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label fw-bold small text-muted">Apellido Paterno</label>
                            <input type="text" class="form-control" id="enrolar_ap_paterno" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold small text-muted">Apellido Materno</label>
                            <input type="text" class="form-control" id="enrolar_ap_materno">
                        </div>
                    </div>
                    <div class="row mb-4">
                        <div class="col-md-6">
                            <label class="form-label fw-bold small text-muted">Sección</label>
                            <select class="form-select" id="enrolar_seccion" required>
                                <option value="" selected disabled>Cargando secciones...</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold small text-muted">Turno Asignado</label>
                            <select class="form-select" id="enrolar_turno" required>
                                <option value="" selected disabled>Cargando turnos...</option>
                            </select>
                        </div>
                    </div>
                    <hr class="mb-4 text-muted">
                    <div class="d-grid">
                        <button type="button" class="btn btn-lg fw-bold shadow-sm text-white" style="background-color: var(--yb-blue);" onclick="guardarNuevoFuncionario()">
                            <i class="bi bi-save me-2"></i> Guardar Funcionario
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div class="col-12 col-lg-5">
        <div class="card border-0 shadow-sm h-100 border-top-danger-yb">
            <div class="card-body p-4 p-md-5 text-center d-flex flex-column justify-content-center">
                <h4 class="fw-bold text-black mb-2">Código de Credencial</h4>
                <p class="text-muted small mb-4">El código se genera automáticamente basado en el RUT + 5 dígitos.</p>

                <div class="generator-zone rounded-4 p-4 mb-4 mx-auto bg-light border w-100 d-flex flex-column align-items-center justify-content-center" style="min-height: 200px;">
                    <svg id="barcode" style="display: none;"></svg>
                    
                    <div id="barcode-placeholder" class="text-muted">
                        <i class="bi bi-qr-code" style="font-size: 3rem; display: block;"></i>
                        <span class="small">Ingrese RUT para generar</span>
                    </div>
                </div>

                <div class="input-group mb-3">
                    <span class="input-group-text bg-light text-muted"><i class="bi bi-upc"></i></span>
                    <input type="text" class="form-control fw-bold text-center fs-5" id="enrolar_codigo" placeholder="Código generado" readonly>
                    <button class="btn btn-outline-primary" style="color: var(--yb-blue); border-color: var(--yb-blue);" type="button" onclick="generarCodigoAutomatico()" title="Regenerar sufijo">
                        <i class="bi bi-arrow-clockwise"></i>
                    </button>
                </div>
                
                <button type="button" id="btn-descargar-png" class="btn btn-success fw-bold w-100 mb-2" style="display: none;" onclick="descargarCodigoDeBarrasPNG()">
                    <i class="bi bi-download me-2"></i> Descargar Código en PNG
                </button>
                
                <p class="text-xs text-muted fst-italic">Este código será el que deba imprimir en la credencial.</p>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
<?php include '../includes/footer.php'; ?>