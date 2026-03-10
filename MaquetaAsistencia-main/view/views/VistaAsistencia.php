<?php include '../includes/header.php'; ?>

<div class="d-flex h-100 vh-100">
    <main class="main-content flex-grow-1 p-4 p-md-5 overflow-auto">
        
        <div class="header-seccion d-flex justify-content-between align-items-center mb-4 pb-3">
            <div>
                <h1 class="text-black fw-bold mb-0">Control de Asistencia</h1>
                <p class="text-muted mb-0">Gestión de personal y revisión de jornadas laborales.</p>
            </div>
            
            <div class="mt-3 mt-md-0">
                <div class="input-group shadow-sm rounded">
                    <span class="input-group-text border-0 text-muted" style="background-color: rgba(255,255,255,0.9);">
                        <i class="bi bi-search"></i>
                    </span>
                    <input type="text" id="buscador-funcionarios" class="form-control border-0" placeholder="Buscar por nombre, RUT o sección..." style="min-width: 300px; height: 48px; background-color: rgba(255,255,255,0.9);">
                </div>
            </div>
        </div>

        <div class="card border-0 shadow-sm card-dashboard mb-4" id="lista-funcionarios-container">
            <div class="card-header bg-white border-bottom fw-bold d-none d-lg-flex text-muted py-3">
                <div class="col-12"><i class="bi bi-person-check-fill text-success me-2"></i>Personal Activo</div>
            </div>
            <div class="bg-light border-bottom fw-bold d-none d-lg-flex text-muted py-2 px-3 small">
                <div class="col-2 ps-3">RUT</div>
                <div class="col-3">Nombre Completo</div>
                <div class="col-3">Sección</div>
                <div class="col-2">Turno</div>
                <div class="col-2 text-end pe-4">Acciones</div>
            </div>
            
            <div class="list-group list-group-flush" id="contenedor-funcionarios">
                </div>
        </div>

        <div class="card border-0 shadow-sm card-dashboard mb-5" style="border-top: 4px solid #ffc107 !important;">
            <div class="card-header bg-white border-bottom fw-bold d-none d-lg-flex py-3" style="color: #997404;">
                <div class="col-12"><i class="bi bi-exclamation-circle-fill text-warning me-2"></i>Pendientes de Enrolar</div>
            </div>
            
            <div class="list-group list-group-flush" id="contenedor-no-enrolados">
                </div>
        </div>
        
    </main>
</div>

<div class="modal fade" id="modalBorrar" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-top-danger-yb">
            <div class="modal-header border-0 pb-0">
                <h5 class="modal-title text-black fw-bold"><i class="bi bi-exclamation-triangle-fill text-danger-yb me-2"></i>Atención</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center py-4">
                <p class="mb-0 fs-5">¿Estás seguro que deseas eliminar a este funcionario?</p>
                <p class="text-danger-yb small fw-bold mt-2">Esta acción es irreversible.</p>
            </div>
            <div class="modal-footer border-0 bg-light justify-content-center">
                <button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger fw-bold px-4" style="background-color: var(--yb-red); border-color: var(--yb-red);" onclick="ejecutarBorrado()">Sí, Eliminar</button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modalAusencia" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-top-danger-yb">
            <div class="modal-header border-0 pb-0">
                <h5 class="modal-title text-black fw-bold"><i class="bi bi-file-medical text-danger-yb me-2"></i>Registrar Licencia</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
                <form id="formAusencia">
                    <input type="hidden" id="ausencia_rut">
                    <div class="mb-3">
                        <label class="form-label fw-bold small text-muted text-uppercase">Tipo de Licencia</label>
                        <select class="form-select" id="ausencia_tipo" required>
                            <option value="" selected disabled>Seleccione...</option>
                            <option value="Licencia Médica">Licencia Médica</option>
                            <option value="Feriado Legal">Feriado Legal (Vacaciones)</option>
                            <option value="Permiso Administrativo">Permiso Administrativo</option>
                            <option value="Cometido Funcionario">Cometido Funcionario</option>
                        </select>
                    </div>
                    <div class="row mb-3 g-2">
                        <div class="col-6">
                            <label class="form-label fw-bold small text-muted text-uppercase">Fecha Inicio</label>
                            <input type="date" class="form-control" id="ausencia_inicio" required>
                        </div>
                        <div class="col-6">
                            <label class="form-label fw-bold small text-muted text-uppercase">Fecha Término</label>
                            <input type="date" class="form-control" id="ausencia_fin" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold small text-muted text-uppercase">Observación / N° Documento</label>
                        <textarea class="form-control" id="ausencia_obs" rows="2" placeholder="Opcional..."></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-footer border-0 bg-light">
                <button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary fw-bold px-4" style="background-color: var(--yb-blue); border-color: var(--yb-blue);" onclick="guardarAusencia()">
                    <i class="bi bi-save me-1"></i> Guardar
                </button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modalDetalleDia" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-top-danger-yb">
            <div class="modal-header border-0 pb-0">
                <h5 class="modal-title text-black fw-bold"><i class="bi bi-calendar-day text-danger-yb me-2"></i>Detalle del Día</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4 pt-3">
                
                <div class="text-center mb-4">
                    <h4 class="fw-bold text-black mb-1" id="detalle_fecha">--</h4>
                    <span id="detalle_estado_badge" class="badge bg-secondary rounded-pill px-3 py-1 fs-6">Sin Registro</span>
                </div>

                <div id="detalle_caja_fotos" class="row justify-content-center text-center mb-4 d-none">
                    
                    <div class="col-6 d-none" id="col_foto_entrada">
                        <small class="fw-bold text-muted d-block mb-2 text-uppercase">Entrada</small>
                        <img id="detalle_img_entrada" src="" class="rounded-circle shadow-sm border border-3 border-success bg-white" style="width: 180px; height: 180px; object-fit: cover;">
                    </div>
                    
                    <div class="col-6 d-none" id="col_foto_salida">
                        <small class="fw-bold text-muted d-block mb-2 text-uppercase">Salida</small>
                        <img id="detalle_img_salida" src="" class="rounded-circle shadow-sm border border-3 border-primary bg-white" style="width: 180px; height: 180px; object-fit: cover;">
                    </div>

                </div>

                <ul class="list-group list-group-flush text-start">
                    <li class="list-group-item px-0 d-flex justify-content-between align-items-center">
                        <span class="text-muted fw-bold small text-uppercase">Entrada</span>
                        <span class="fw-bold fs-5 text-dark" id="detalle_entrada">--:--</span>
                    </li>
                    <li class="list-group-item px-0 d-flex justify-content-between align-items-center">
                        <span class="text-muted fw-bold small text-uppercase">Salida</span>
                        <span class="fw-bold fs-5 text-dark" id="detalle_salida">--:--</span>
                    </li>
                    <li class="list-group-item px-0 d-flex justify-content-between align-items-center" id="fila_extra" style="display: none !important;">
                        <span class="text-muted fw-bold small text-uppercase">Horas Extras</span>
                        <span class="fw-bold fs-5 text-primary" id="detalle_extra">+00:00</span>
                    </li>
                </ul>

            </div>
            <div class="modal-footer border-0 bg-light justify-content-center">
                <button type="button" class="btn btn-secondary fw-bold w-100 py-2" data-bs-dismiss="modal">Cerrar Detalle</button>
            </div>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>