<?php include '../includes/header.php'; ?>

<div class="header-seccion d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
    <div>
        <h1>Gestión de Turnos</h1>
        <p class="mb-0">Administra los distintos turnos laborales del sistema.</p>
    </div>
    
    <div class="d-flex flex-column flex-sm-row gap-3 align-items-center">
        <div class="input-group shadow-sm rounded">
            <span class="input-group-text border-0 text-muted bg-white">
                <i class="bi bi-search"></i>
            </span>
            <input type="search" id="buscar-turnos" class="form-control border-0" placeholder="Buscar turno..." style="min-width: 250px;" autocomplete="new-password" data-lpignore="true" readonly onfocus="this.removeAttribute('readonly');">
        </div>

        <button type="button" class="btn btn-light shadow-sm fs-6 px-4 fw-bold text-nowrap" style="height: 38px;" onclick="abrirModalTurno()">
            <i class="bi bi-plus-circle me-2"></i> Nuevo Turno
        </button>
    </div>
</div>

<div class="row g-4 mt-2" id="contenedor-turnos"></div>

<div class="modal fade" id="modalFormTurno" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-light border-bottom-0">
                <h5 class="modal-title fw-bold text-black" id="tituloModalTurno">
                    <i class="bi bi-clock-history me-2 text-danger-yb"></i> Registrar Nuevo Turno
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
                <form id="formTurno">
                    <input type="hidden" id="turno_id" value="">
                    <div class="mb-3">
                        <label class="form-label fw-bold small text-muted">Nombre del Turno</label>
                        <input type="text" class="form-control" id="turno_nombre" placeholder="Ej. Mañana, Tarde..." required autocomplete="off">
                    </div>
                    <div class="row mb-3">
                        <div class="col-6">
                            <label class="form-label fw-bold small text-muted">Hora de Entrada</label>
                            <input type="time" class="form-control" id="turno_entrada" required>
                        </div>
                        <div class="col-6">
                            <label class="form-label fw-bold small text-muted">Hora de Salida</label>
                            <input type="time" class="form-control" id="turno_salida" required>
                        </div>
                    </div>
                    <div id="alerta-calculo" class="alert alert-info py-2 small d-flex align-items-center mb-0">
                        <i class="bi bi-info-circle-fill me-2 fs-5"></i><span>Complete las horas para calcular.</span>
                    </div>
                </form>
            </div>
            <div class="modal-footer border-top-0 pt-0 bg-light p-4">
                <button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn text-white fw-bold px-4" style="background-color: var(--yb-blue);" onclick="guardarTurno()">
                    <i class="bi bi-check-circle me-1"></i> Guardar
                </button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modalBorrarSeguro" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-top-danger-yb">
            <div class="modal-header border-0 pb-0">
                <h5 class="modal-title text-black fw-bold"><i class="bi bi-shield-lock-fill text-danger-yb me-2"></i>Seguridad de Borrado</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
                
                <div id="alerta-uso-dependencias" class="alert alert-warning d-none mb-4 shadow-sm border-warning">
                    <div class="d-flex align-items-center">
                        <i class="bi bi-exclamation-triangle-fill fs-3 me-3 text-warning"></i>
                        <div>
                            <h6 class="fw-bold mb-1 text-dark">¡Advertencia Crítica!</h6>
                            <span class="text-dark small" id="texto-uso-dependencias">Hay funcionarios usándolo.</span>
                        </div>
                    </div>
                </div>

                <div class="text-center mb-4">
                    <p class="mb-0 fs-5">¿Estás absolutamente seguro de eliminar <b id="nombre-item-borrar"></b>?</p>
                    <p class="text-danger-yb small fw-bold mt-2">Esta acción es irreversible y afectará a los registros vinculados.</p>
                </div>

                <div class="bg-light p-3 rounded border">
                    <label class="form-label fw-bold small text-muted text-uppercase">Contraseña de Autorización</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white"><i class="bi bi-key-fill text-muted"></i></span>
                        <input type="password" id="password-admin-borrado" class="form-control" placeholder="Ingrese la contraseña maestra" autocomplete="new-password">
                    </div>
                </div>

            </div>
            <div class="modal-footer border-0 bg-light justify-content-between">
                <button type="button" class="btn btn-secondary fw-bold px-4" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger fw-bold shadow-sm" style="background-color: var(--yb-red); border-color: var(--yb-red);" onclick="ejecutarBorradoSeguro()" id="btn-confirmar-borrado-seguro">
                    <i class="bi bi-trash-fill me-2"></i>Confirmar Eliminación
                </button>
            </div>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>