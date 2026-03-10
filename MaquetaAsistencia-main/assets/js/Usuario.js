// ==========================================
// MÓDULO: GESTIÓN DE USUARIOS
// ==========================================

// URL base de tu API (Ajusta la ruta según tu proyecto)
const API_USUARIOS_URL = '../../api/usuarios.php'; 

// 1. Cargar Usuarios al iniciar la vista
document.addEventListener("DOMContentLoaded", () => {
    // Verificamos si estamos en la vista de usuarios buscando la tabla
    if(document.getElementById('tabla-usuarios')) {
        cargarUsuarios();
    }
});

function cargarUsuarios() {
    const tabla = document.getElementById('tabla-usuarios');
    tabla.innerHTML = `<tr><td colspan="5" class="text-center py-4"><div class="spinner-border spinner-border-sm text-danger" role="status"></div></td></tr>`;

    fetch(API_USUARIOS_URL)
        .then(response => response.json())
        .then(data => {
            tabla.innerHTML = '';
            if (data.length === 0) {
                tabla.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No hay usuarios registrados.</td></tr>`;
                return;
            }

            data.forEach(user => {
                // Color del badge según rol y estado
                let rolBadge = user.rol === 'Administrador' ? 'bg-danger-yb-light text-danger-yb' : 'bg-blue-yb-light text-blue-yb';
                let estadoBadge = user.estado === 'Activo' ? 'bg-success text-white' : 'bg-secondary text-white';

                tabla.innerHTML += `
                    <tr>
                        <td class="ps-4 py-3 fw-bold text-black">
                            <i class="bi bi-person-circle text-muted me-2 fs-5 align-middle"></i> 
                            ${user.nombre}
                        </td>
                        <td class="py-3">${user.login}</td>
                        <td class="py-3"><span class="badge ${rolBadge} border-0 px-2 py-1">${user.rol}</span></td>
                        <td class="py-3"><span class="badge ${estadoBadge} rounded-pill">${user.estado}</span></td>
                        <td class="text-end pe-4 py-3">
                            <button class="btn btn-sm btn-outline-primary" style="color: var(--yb-blue); border-color: var(--yb-blue);" onclick='editarUsuario(${JSON.stringify(user)})'>
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger ms-1" style="color: var(--yb-red); border-color: var(--yb-red);" onclick="prepararBorrarUsuario(${user.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
            });
        })
        .catch(error => {
            console.error("Error al cargar usuarios:", error);
            tabla.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">Error al cargar los datos. Verifique la conexión a la API.</td></tr>`;
        });
}

// 2. Abrir Modal para NUEVO Usuario
function abrirModalUsuario() {
    document.getElementById('formUsuario').reset();
    document.getElementById('usuario_id').value = '';
    document.getElementById('textoTituloModal').innerText = 'Registrar Nuevo Usuario';
    
    // El campo contraseña es obligatorio al crear
    document.getElementById('usuario_password').required = true;
    document.getElementById('hint-password').style.display = 'none';

    var modal = new bootstrap.Modal(document.getElementById('modalFormUsuario'));
    modal.show();
}

// 3. Abrir Modal para EDITAR Usuario
function editarUsuario(user) {
    document.getElementById('usuario_id').value = user.id;
    document.getElementById('usuario_nombre').value = user.nombre;
    document.getElementById('usuario_login').value = user.login;
    document.getElementById('usuario_rol').value = user.rol;
    document.getElementById('usuario_estado').value = user.estado;
    
    // La contraseña está vacía y no es obligatoria (solo se actualiza si se escribe algo)
    document.getElementById('usuario_password').value = '';
    document.getElementById('usuario_password').required = false;
    document.getElementById('hint-password').style.display = 'inline';

    document.getElementById('textoTituloModal').innerText = 'Editar Usuario';

    var modal = new bootstrap.Modal(document.getElementById('modalFormUsuario'));
    modal.show();
}

// 4. Guardar (Crear o Actualizar) Usuario
function guardarUsuario() {
    const id = document.getElementById('usuario_id').value;
    const nombre = document.getElementById('usuario_nombre').value;
    const login = document.getElementById('usuario_login').value;
    const password = document.getElementById('usuario_password').value;
    const rol = document.getElementById('usuario_rol').value;
    const estado = document.getElementById('usuario_estado').value;

    // Validación básica
    if (!nombre || !login || (!id && !password)) {
        alert("Por favor complete los campos obligatorios.");
        return;
    }

    const payload = { nombre, login, rol, estado };
    // Solo enviamos la contraseña si el usuario escribió una
    if (password) payload.password = password;

    const method = id ? 'PUT' : 'POST';
    if (id) payload.id = id;

    fetch(API_USUARIOS_URL, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            bootstrap.Modal.getInstance(document.getElementById('modalFormUsuario')).hide();
            cargarUsuarios(); // Recargar la tabla
        } else {
            alert(data.message || "Error al guardar el usuario.");
        }
    })
    .catch(error => console.error("Error:", error));
}

// 5. Eliminar Usuario
function prepararBorrarUsuario(id) {
    document.getElementById('delete_usuario_id').value = id;
    var modal = new bootstrap.Modal(document.getElementById('modalBorrarUsuario'));
    modal.show();
}

function ejecutarBorrarUsuario() {
    const id = document.getElementById('delete_usuario_id').value;

    fetch(`${API_USUARIOS_URL}?id=${id}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            bootstrap.Modal.getInstance(document.getElementById('modalBorrarUsuario')).hide();
            cargarUsuarios();
        } else {
            alert(data.message || "Error al eliminar.");
        }
    })
    .catch(error => console.error("Error:", error));
}