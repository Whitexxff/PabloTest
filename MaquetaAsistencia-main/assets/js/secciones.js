/* =========================================================================
   MÓDULO 5: SECCIONES (CRUD)
   ========================================================================= */

async function cargarListaSecciones() {
    const contenedor = document.getElementById('contenedor-secciones');
    if (!contenedor) return;

    const res = await apiSecciones.getSecciones();
    contenedor.innerHTML = '';

    if (res.status === 1 && res.data && res.data.length > 0) {
        res.data.forEach(sec => {
            contenedor.innerHTML += `
            <div class="col-12 col-md-6 col-xl-4">
                <div class="card bg-white border-0 shadow-sm card-depto h-100">
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center mb-3">
                            <div class="icon-depto me-3 text-primary fs-3">
                                <i class="bi bi-building"></i>
                            </div>
                            <div>
                                <h5 class="fw-bold text-black mb-0">${sec.nombre}</h5>
                                <small class="text-muted">ID: ${sec.id}</small>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-white border-top-0 p-4 pt-0 d-flex gap-2">
                        <button class="btn btn-sm btn-outline-dark flex-grow-1 fw-bold" onclick="editarSeccion(${sec.id}, '${sec.nombre}')">
                            <i class="bi bi-pencil-square me-1"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger px-3" onclick="confirmarBorrarSeccion(${sec.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        });
    } else {
        contenedor.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning text-center fw-bold shadow-sm border-0">
                    <i class="bi bi-exclamation-circle me-2"></i> No hay secciones registradas.
                </div>
            </div>`;
    }
}

async function guardarSeccion() {
    const id = document.getElementById('seccion_id').value;
    const nombre = document.getElementById('seccion_nombre').value.trim();

    if (!nombre) {
        alert("El nombre de la sección no puede estar vacío.");
        return;
    }

    let res;
    if (id) {
        res = await apiSecciones.updateSeccion(id, nombre);
    } else {
        res = await apiSecciones.createSeccion(nombre);
    }

    if (res.status === 1) {
        const modalEl = document.getElementById('modalFormSeccion');
        if (modalEl) bootstrap.Modal.getInstance(modalEl).hide();
        cargarListaSecciones();
    } else {
        alert("Error: " + res.message);
    }
}

function editarSeccion(id, nombre) {
    document.getElementById('seccion_id').value = id;
    document.getElementById('seccion_nombre').value = nombre;
    const modalEl = document.getElementById('modalFormSeccion');
    if (modalEl) new bootstrap.Modal(modalEl).show();
}

function abrirModalNuevaSeccion() {
    document.getElementById('formSeccion').reset();
    document.getElementById('seccion_id').value = '';
    const modalEl = document.getElementById('modalFormSeccion');
    if (modalEl) new bootstrap.Modal(modalEl).show();
}

function confirmarBorrarSeccion(id) {
    seccionABorrarId = id;
    funcionarioAborrarId = null; // Nos aseguramos de limpiar la otra variable
    const modal = new bootstrap.Modal(document.getElementById('modalBorrar'));
    modal.show();
}
