<?php
// Seguro para evitar el error de sesión ya iniciada
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['rol']) || $_SESSION['rol'] !== 'superadmin') {
    header("Location: VistaInicio.php");
    exit();
}
?>
<?php include '../includes/header.php'; ?>
<div class="header-seccion">
    <div>
        <h1>Gestión de Usuarios</h1>
        <p>Administra los usuarios con acceso al sistema.</p>
    </div>
    <div>
        <button class="btn btn-light shadow-sm fs-5 px-4" onclick="abrirModalUsuario()">
            <i class="bi bi-plus-circle me-2"></i> Nuevo Usuario
        </button>
    </div>
</div>

<div class="card border-0 shadow-sm mt-4">
    <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
            <thead class="bg-light text-muted">
                <tr>
                    <th class="ps-4">Nombre</th>
                    <th>Usuario (Login)</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th class="text-end pe-4">Acciones</th>
                </tr>
            </thead>
            <tbody id="tabla-usuarios">
                </tbody>
        </table>
    </div>
</div>

<div class="modal fade" id="modalFormUsuario" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-light border-bottom-0">
                <h5 class="modal-title fw-bold text-black" id="textoTituloModal">
                    <i class="bi bi-person-badge me-2 text-danger-yb"></i> Registrar Nuevo Usuario
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body p-4">
                <form id="formUsuario">
                    <input type="hidden" id="usuario_id">
                    <div class="mb-3">
                        <label class="form-label fw-bold small text-muted">Nombre Completo</label>
                        <input type="text" class="form-control" id="usuario_nombre" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold small text-muted">Login (Usuario)</label>
                        <input type="text" class="form-control" id="usuario_login" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold small text-muted">Contraseña</label>
                        <input type="password" class="form-control" id="usuario_password">
                        <small id="hint-password" class="text-muted mt-1" style="display:none;">Deja en blanco para no cambiarla.</small>
                    </div>
                    <div class="row">
                        <div class="col-6">
                            <label class="form-label fw-bold small text-muted">Rol</label>
                            <select class="form-select" id="usuario_rol">
                                <option value="Administrador">Administrador</option>
                                <option value="Operador">Operador</option>
                            </select>
                        </div>
                        <div class="col-6">
                            <label class="form-label fw-bold small text-muted">Estado</label>
                            <select class="form-select" id="usuario_estado">
                                <option value="Activo">Activo</option>
                                <option value="Inactivo">Inactivo</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer border-top-0 pt-0 bg-light p-4">
                <button type="button" class="btn btn-secondary fw-bold" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn text-white fw-bold px-4" style="background-color: var(--yb-blue);" onclick="guardarUsuario()">
                    <i class="bi bi-save me-1"></i> Guardar
                </button>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="modalBorrarUsuario" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-sm">
        <div class="modal-content border-top-danger-yb">
            <div class="modal-body text-center py-4">
                <input type="hidden" id="delete_usuario_id">
                <i class="bi bi-exclamation-circle text-danger-yb display-4 d-block mb-3"></i>
                <h5 class="fw-bold text-black mb-2">¿Eliminar Usuario?</h5>
                <p class="text-muted small mb-4">Esta acción no se puede deshacer.</p>
                <div class="d-flex justify-content-center gap-2">
                    <button type="button" class="btn btn-light fw-bold px-4" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-danger fw-bold px-4" onclick="ejecutarBorrarUsuario()">Eliminar</button>
                </div>
            </div>
        </div>
    </div>
</div>

<?php include '../includes/footer.php'; ?>