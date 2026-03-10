/* =========================================================================
   1. VARIABLES GLOBALES Y UTILIDADES
   ========================================================================= */
let turnoABorrarId = null;
let seccionABorrarId = null;
let funcionarioAborrarId = null;
let tipoItemABorrar = ''; // 'turno' o 'seccion'
let nombreItemABorrar = '';

let modalFormTurnoInstance = null;
let fechaActualVisualizacion = new Date();

const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

// Objeto global seguro para guardar los datos del calendario y fotos
window.calendarioData = window.calendarioData || {};

/* =========================================================================
   2. FUNCIÓN GLOBAL: NOTIFICACIONES Y VALIDACIONES
   ========================================================================= */
function formatearRUT(rut) {
    if (!rut) return '';
    let valorLimpio = String(rut).replace(/[^0-9kK]/g, '').toUpperCase();
    if (valorLimpio.length <= 1) return valorLimpio;
    let cuerpo = valorLimpio.slice(0, -1);
    let dv = valorLimpio.slice(-1);
    cuerpo = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${cuerpo}-${dv}`;
}

function validarRutChileno(rutCompleto) {
    let rutLimpio = rutCompleto.replace(/[^0-9kK]/g, '').toUpperCase();
    if (rutLimpio.length < 2) return false;
    let cuerpo = rutLimpio.slice(0, -1);
    let dv = rutLimpio.slice(-1);
    let suma = 0;
    let multiplo = 2;
    for (let i = 1; i <= cuerpo.length; i++) {
        let index = multiplo * cuerpo.charAt(cuerpo.length - i);
        suma = suma + index;
        if (multiplo < 7) { multiplo = multiplo + 1; } else { multiplo = 2; }
    }
    let dvEsperado = 11 - (suma % 11);
    let dvCalculado = (dvEsperado === 11) ? "0" : (dvEsperado === 10) ? "K" : dvEsperado.toString();
    return dvCalculado === dv;
}

function mostrarNotificacion(mensaje, tipo = 'success') {
    let container = document.getElementById('toast-container-yb');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container-yb';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-4';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
    }
    const config = {
        success: { bg: 'bg-success', icon: 'bi-check-circle-fill', text: 'text-white', close: 'btn-close-white' },
        error: { bg: 'bg-danger', icon: 'bi-x-circle-fill', text: 'text-white', close: 'btn-close-white' },
        warning: { bg: 'bg-warning', icon: 'bi-exclamation-triangle-fill', text: 'text-dark', close: '' },
        info: { bg: 'bg-primary', icon: 'bi-info-circle-fill', text: 'text-white', close: 'btn-close-white' },
        delete: { bg: 'bg-danger', icon: 'bi-trash-fill', text: 'text-white', close: 'btn-close-white' }
    };
    const current = config[tipo] || config.success;
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center border-0 shadow-lg mb-3 rounded-3 ${current.bg} ${current.text}`;
    toastEl.setAttribute('role', 'alert');
    toastEl.innerHTML = `
        <div class="d-flex p-1">
            <div class="toast-body fw-bold fs-6 py-2">
                <i class="bi ${current.icon} me-2 fs-5 align-middle"></i> ${mensaje}
            </div>
            <button type="button" class="btn-close ${current.close} me-3 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    container.appendChild(toastEl);
    const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
    bsToast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}
/* =========================================================================
   3. INICIALIZACIÓN DEL DOCUMENTO
   ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {
    // MAGIA PARA LIBERAR MODALES
    document.querySelectorAll('.modal').forEach(modal => {
        document.body.appendChild(modal);
    });

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'success') {
        mostrarNotificacion("¡Inicio de sesión exitoso! Bienvenido.", "success");
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // INICIALIZAR BUSCADORES
    inicializarBuscadorUniversal('buscar-secciones', 'contenedor-secciones', '.col-12');
    inicializarBuscadorUniversal('buscar-turnos', 'contenedor-turnos', '.col-12');
    inicializarBuscadorUniversal('buscador-funcionarios', 'contenedor-funcionarios', '.list-group-item');

    if (document.getElementById('dash-total-func')) cargarEstadisticasDashboard();

    const formLogin = document.getElementById("form_login");
    if (formLogin) formLogin.addEventListener("submit", procesarLogin);

    if (document.getElementById('enrolar_turno')) cargarSelectTurnosEnrolar();
    if (document.getElementById('enrolar_seccion')) cargarSelectSeccionesEnrolar();

    const formEnrolar = document.getElementById('form-enrolar');
    if (formEnrolar) {
        formEnrolar.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); guardarNuevoFuncionario(); }
        });
    }

    if (document.getElementById('tabla-usuarios')) cargarListaUsuarios();

    const formModalEl = document.getElementById('modalFormTurno');
    if (formModalEl) modalFormTurnoInstance = new bootstrap.Modal(formModalEl);

    const inputEntrada = document.getElementById('turno_entrada');
    const inputSalida = document.getElementById('turno_salida');
    if (inputEntrada && inputSalida) {
        inputEntrada.addEventListener('change', calcularTiempoJornadaFormulario);
        inputSalida.addEventListener('change', calcularTiempoJornadaFormulario);
    }

    if (document.getElementById('contenedor-turnos')) cargarTarjetasTurnos();

    const formTurno = document.getElementById('formTurno');
    if (formTurno) {
        formTurno.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); guardarTurno(); }
        });
    }

    if (document.getElementById('contenedor-funcionarios')) cargarListaFuncionarios();
    if (document.getElementById('contenedor-secciones')) cargarListaSecciones();

    const formSeccion = document.getElementById('formSeccion');
    if (formSeccion) {
        formSeccion.addEventListener('keydown', e => {
            if (e.key === 'Enter') { e.preventDefault(); guardarSeccion(); }
        });
    }

    // =========================================================
    // NUEVO: MEJORAS UX PARA EL MODAL DE SEGURIDAD EXTREMA
    // =========================================================
    const modalBorrarSeguroEl = document.getElementById('modalBorrarSeguro');

    if (modalBorrarSeguroEl) {
        // 1. Auto-Focus: El cursor salta solo a la contraseña al abrir el modal
        modalBorrarSeguroEl.addEventListener('shown.bs.modal', function () {
            if (inputPasswordBorrado) inputPasswordBorrado.focus();
        });
    }

    if (inputPasswordBorrado) {
        // 2. Ejecutar con ENTER
        inputPasswordBorrado.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault(); // Evita que la página intente recargarse
                ejecutarBorradoSeguro();
            }
        });
    }

    const inputPasswordBorrado = document.getElementById('password-admin-borrado');
    if (inputPasswordBorrado) {
        // 2. Tecla Enter: Ejecutar borrado al presionar Enter sin usar el mouse
        inputPasswordBorrado.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                ejecutarBorradoSeguro();
            }
        });
    }
});
/* =========================================================================
   MÓDULO 1: LOGIN
   ========================================================================= */
async function procesarLogin(e) {
    e.preventDefault();
    const userVal = document.getElementById("usuario").value.trim();
    const passVal = document.getElementById("password").value;

    if (!userVal || !passVal) {
        mostrarNotificacion("Por favor, ingresa tu usuario y contraseña.", "warning");
        return;
    }

    try {
        const vuser = await validUser(userVal, passVal);
        if (vuser.status === 1 && vuser.data && vuser.data.status === 1) {
            const rolUsuario = String(vuser.data.rol || '').toLowerCase().trim();
            if (['superadmin', 'admin', 'administrador'].includes(rolUsuario)) {
                window.location.href = "VistaInicio.php?login=success";
            } else {
                window.location.href = "VistaEscaner.php?login=success";
            }
        } else {
            const mensajeFallo = vuser.data ? vuser.data.message : (vuser.message || "Credenciales incorrectas.");
            mostrarNotificacion(mensajeFallo, "error");
            document.getElementById("password").value = '';
        }
    } catch (error) {
        mostrarNotificacion("Error al conectar con el servidor.", "error");
    }
}
/* =========================================================================
   MÓDULO 2: TURNOS
   ========================================================================= */
async function cargarTarjetasTurnos() {
    const contenedor = document.getElementById('contenedor-turnos');
    if (!contenedor) return;

    const respuesta = await apiTurnos.getTurnos();
    contenedor.innerHTML = '';

    if (respuesta.status === 1 && respuesta.data && respuesta.data.length > 0) {
        respuesta.data.forEach(turno => {
            const total = calcularHorasUI(turno.hora_entrada, turno.hora_salida);
            contenedor.innerHTML += `
                <div class="col-12 col-md-6 col-xl-4">
                    <div class="card bg-white border-0 shadow-sm card-turno h-100">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div class="d-flex align-items-center">
                                    <div class="icon-turno me-3"><i class="bi bi-clock-fill text-primary fs-3"></i></div>
                                    <div>
                                        <h5 class="fw-bold text-black mb-0">${turno.nombre}</h5>
                                        <span class="badge bg-light text-dark border">ID: ${turno.IDturno}</span>
                                    </div>
                                </div>
                            </div>
                            <hr class="text-muted">
                            <div class="row mb-3">
                                <div class="col-6">
                                    <small class="text-muted fw-bold d-block">Entrada</small>
                                    <span class="fs-5 fw-bold" style="color: var(--yb-blue);">${turno.hora_entrada.substring(0, 5)} hrs</span>
                                </div>
                                <div class="col-6">
                                    <small class="text-muted fw-bold d-block">Salida</small>
                                    <span class="fs-5 fw-bold" style="color: var(--yb-blue);">${turno.hora_salida.substring(0, 5)} hrs</span>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center bg-light p-2 rounded mb-3">
                                <small class="text-muted fw-semibold"><i class="bi bi-stopwatch me-1"></i> Total:</small>
                                <span class="fw-bold text-black">${total.horas} hrs ${total.minutos} mins</span>
                            </div>
                        </div>
                        <div class="card-footer bg-white border-top-0 p-4 pt-0 d-flex gap-2">
                            <button type="button" class="btn btn-sm btn-outline-primary flex-grow-1 fw-bold" onclick="editarTurno(${turno.IDturno}, '${turno.nombre}', '${turno.hora_entrada}', '${turno.hora_salida}')">
                                <i class="bi bi-pencil-square me-1"></i> Editar
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-danger px-3" onclick="confirmarBorrarTurno(${turno.IDturno}, '${turno.nombre}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>`;
        });
    } else {
        contenedor.innerHTML = `<div class="col-12"><div class="alert alert-warning text-center fw-bold shadow-sm border-0"><i class="bi bi-exclamation-circle me-2"></i> No hay turnos registrados en la base de datos.</div></div>`;
    }
}

function abrirModalTurno() {
    const modalEl = document.getElementById('modalFormTurno');
    if (!modalEl) return;
    if (document.getElementById('formTurno')) document.getElementById('formTurno').reset();
    if (document.getElementById('turno_id')) document.getElementById('turno_id').value = '';
    if (document.getElementById('tituloModalTurno')) document.getElementById('tituloModalTurno').innerHTML = '<i class="bi bi-clock-history me-2"></i> Registrar Nuevo Turno';

    const alerta = document.getElementById('alerta-calculo');
    if (alerta) {
        alerta.innerHTML = '<i class="bi bi-info-circle-fill me-2 fs-5"></i><span>Complete las horas.</span>';
        alerta.className = "alert alert-info py-2 small d-flex align-items-center mb-0";
    }
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
}

function editarTurno(id, nombre, entrada, salida) {
    document.getElementById('turno_id').value = id;
    document.getElementById('turno_nombre').value = nombre;
    document.getElementById('turno_entrada').value = entrada.substring(0, 5);
    document.getElementById('turno_salida').value = salida.substring(0, 5);
    document.getElementById('tituloModalTurno').innerHTML = '<i class="bi bi-pencil-square me-2"></i> Editar Turno';
    calcularTiempoJornadaFormulario();
    
    // Llamado infalible del modal (evita el error si la variable global falla)
    const modalEl = document.getElementById('modalFormTurno');
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
    }
}

async function guardarTurno() {
    const id = document.getElementById('turno_id').value;
    const nombre = document.getElementById('turno_nombre').value;
    const hora_entrada = document.getElementById('turno_entrada').value;
    const hora_salida = document.getElementById('turno_salida').value;

    if (!nombre || !hora_entrada || !hora_salida) {
        mostrarNotificacion("Por favor completa todos los campos del turno.", "warning"); return;
    }

    const datos = { nombre, hora_entrada, hora_salida };
    let respuesta;

    if (id) {
        datos.id = id;
        respuesta = await apiTurnos.updateTurno(datos);
    } else {
        respuesta = await apiTurnos.createTurno(datos);
    }

    if (respuesta.status === 1) {
        mostrarNotificacion(id ? "Turno actualizado exitosamente." : "Turno creado exitosamente.", "success");
        modalFormTurnoInstance.hide();
        cargarTarjetasTurnos();
    } else {
        mostrarNotificacion("Error: " + respuesta.message, "error");
    }
}

function calcularTiempoJornadaFormulario() {
    const entradaVal = document.getElementById('turno_entrada').value;
    const salidaVal = document.getElementById('turno_salida').value;
    const alertaCalculo = document.getElementById('alerta-calculo');
    if (entradaVal && salidaVal) {
        const total = calcularHorasUI(entradaVal, salidaVal);
        alertaCalculo.innerHTML = `<strong>Total Jornada:</strong>&nbsp; ${total.horas} horas y ${total.minutos} minutos.`;
        alertaCalculo.className = "alert alert-success py-2 small d-flex align-items-center mb-0";
    }
}

function calcularHorasUI(entradaVal, salidaVal) {
    const fechaEntrada = new Date(`2000-01-01T${entradaVal}`);
    let fechaSalida = new Date(`2000-01-01T${salidaVal}`);
    if (fechaSalida < fechaEntrada) { fechaSalida.setDate(fechaSalida.getDate() + 1); }
    const diferenciaMs = fechaSalida - fechaEntrada;
    return { horas: Math.floor(diferenciaMs / (1000 * 60 * 60)), minutos: Math.floor((diferenciaMs % (1000 * 60 * 60)) / (1000 * 60)) };
}

/* =========================================================================
   MÓDULO 3: ENROLAMIENTO
   ========================================================================= */
function generarCodigoAutomatico() {
    const rutInput = document.getElementById('enrolar_rut');
    if (!rutInput) return;
    const inputCodigo = document.getElementById('enrolar_codigo');
    const svgBarcode = document.getElementById('barcode');
    const placeholder = document.getElementById('barcode-placeholder');
    const btnDescargar = document.getElementById('btn-descargar-png');

    if (rutInput.value.trim() === '') {
        inputCodigo.value = ''; inputCodigo.dataset.sufijo = '';
        svgBarcode.style.display = 'none'; 
        placeholder.style.display = 'block';
        if (btnDescargar) btnDescargar.style.display = 'none'; 
        return;
    }
    
    let rutLimpio = rutInput.value.replace(/[^0-9kK]/gi, '');
    if (rutLimpio.length > 2) {
        if (!inputCodigo.dataset.sufijo) { inputCodigo.dataset.sufijo = Math.floor(10000 + Math.random() * 90000); }
        let codigoFinal = rutLimpio + inputCodigo.dataset.sufijo;
        inputCodigo.value = codigoFinal;
        
        if (typeof JsBarcode !== 'undefined') { 
            JsBarcode("#barcode", codigoFinal, { 
                format: "CODE128", 
                lineColor: "#212529", 
                width: 2, 
                height: 70, 
                displayValue: true, 
                margin: 10 
            }); 
        }
        
        placeholder.style.display = 'none'; 
        svgBarcode.style.display = 'block';
        if (btnDescargar) btnDescargar.style.display = 'block'; 
    } else {
        if (btnDescargar) btnDescargar.style.display = 'none';
    }
}

function descargarCodigoDeBarrasPNG() {
    const svgElement = document.getElementById("barcode");
    if (!svgElement || svgElement.style.display === 'none') {
        mostrarNotificacion("No hay código de barras para descargar.", "warning");
        return;
    }

    const inputCodigo = document.getElementById('enrolar_codigo').value;
    const rutValue = document.getElementById('enrolar_rut').value.trim();
    const nombreArchivo = rutValue ? `credencial_${rutValue.replace(/[^0-9kK]/gi, '')}.png` : `codigo_${inputCodigo}.png`;

    const canvas = document.createElement("canvas");
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    
    img.onload = function() {
        canvas.width = img.width + 40;
        canvas.height = img.height + 40;
        const ctx = canvas.getContext("2d");
        
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = nombreArchivo;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        mostrarNotificacion("Código de barras descargado correctamente.", "success");
    };
}

async function guardarNuevoFuncionario() {
    const rutCrudo = document.getElementById('enrolar_rut').value.trim();
    const rutLimpio = rutCrudo.replace(/[\.\-]/g, '');

    const nombres = document.getElementById('enrolar_nombres').value.trim();
    const ap_paterno = document.getElementById('enrolar_ap_paterno').value.trim();
    const ap_materno = document.getElementById('enrolar_ap_materno').value.trim();
    const seccion = document.getElementById('enrolar_seccion').value;
    const turno = document.getElementById('enrolar_turno').value;
    const codigo = document.getElementById('enrolar_codigo').value;

    if (!rutLimpio || !nombres || !ap_paterno || !seccion || !turno || !codigo) {
        mostrarNotificacion("Por favor, completa todos los campos obligatorios.", "warning"); 
        return;
    }

    if (!validarRutChileno(rutCrudo)) {
        mostrarNotificacion("El RUT ingresado no es válido. Verifique que esté correcto.", "error");
        document.getElementById('enrolar_rut').focus();
        return; 
    }

    const datos = { rut: rutLimpio, nombre: nombres, apellidoP: ap_paterno, apellidoM: ap_materno, seccion, turno, codigo_tarjeta: codigo };
    const respuesta = await apiFuncionarios.createFuncionario(datos);

    if (respuesta.status === 1) {
        mostrarNotificacion("¡Funcionario enrolado con éxito!", "success");
        document.getElementById('form-enrolar').reset();
        document.getElementById('enrolar_codigo').value = '';
        document.getElementById('enrolar_codigo').dataset.sufijo = '';
        document.getElementById('barcode-placeholder').style.display = 'block';
        document.getElementById('barcode').style.display = 'none';
    } else {
        mostrarNotificacion("Error al enrolar: " + respuesta.message, "error");
    }
}

async function cargarSelectTurnosEnrolar() {
    const select = document.getElementById('enrolar_turno');
    if (!select) return;
    const respuesta = await apiTurnos.getTurnos();
    if (respuesta.status === 1 && respuesta.data && respuesta.data.length > 0) {
        select.innerHTML = '<option value="" selected disabled>Seleccione un turno...</option>';
        respuesta.data.forEach(turno => {
            select.innerHTML += `<option value="${turno.IDturno}">${turno.nombre} (${turno.hora_entrada.substring(0, 5)} a ${turno.hora_salida.substring(0, 5)})</option>`;
        });
    } else {
        select.innerHTML = '<option value="" selected disabled>No hay turnos creados</option>';
    }
}

async function cargarSelectSeccionesEnrolar() {
    const select = document.getElementById('enrolar_seccion');
    if (!select) return;
    const respuesta = await apiSecciones.getSecciones();
    if (respuesta.status === 1 && respuesta.data && respuesta.data.length > 0) {
        select.innerHTML = '<option value="" selected disabled>Seleccione una sección...</option>';
        respuesta.data.forEach(sec => {
            select.innerHTML += `<option value="${sec.id}">${sec.nombre}</option>`;
        });
    } else {
        select.innerHTML = '<option value="" selected disabled>No hay secciones creadas</option>';
    }
}

/* =========================================================================
   MÓDULO 4: FUNCIONARIOS, CALENDARIO Y POPUP SEGURO
   ========================================================================= */
async function cargarListaFuncionarios() {
    const contenedorActivos = document.getElementById('contenedor-funcionarios');
    const contenedorPendientes = document.getElementById('contenedor-no-enrolados');
    
    if (!contenedorActivos) return;

    try {
        const res = await apiFuncionarios.getFuncionarios();
        const resSecciones = await apiSecciones.getSecciones();
        const resTurnos = await apiTurnos.getTurnos();
        
        contenedorActivos.innerHTML = '';
        if (contenedorPendientes) contenedorPendientes.innerHTML = '';

        if (res.status === 1 && res.data && res.data.length > 0) {
            
            let htmlActivos = '';
            let htmlPendientes = '';

            res.data.forEach(f => {
                const safeId = f.rut.replace(/[^a-zA-Z0-9]/g, '');
                const colId = `edit-func-${safeId}`;
                const textoSeccion = f.nombre_seccion || 'Sin Sección';
                const textoTurno = f.nombre_turno || 'Sin Turno';

                let opcionesSecciones = `<option value="">Seleccione...</option>`;
                if (resSecciones.status === 1) {
                    resSecciones.data.forEach(s => {
                        const sel = (s.id == f.IDseccion) ? 'selected' : '';
                        opcionesSecciones += `<option value="${s.id}" ${sel}>${s.nombre}</option>`;
                    });
                }

                let opcionesTurnos = `<option value="">Seleccione...</option>`;
                if (resTurnos.status === 1) {
                    resTurnos.data.forEach(t => {
                        const sel = (t.IDturno == f.IDturno) ? 'selected' : '';
                        opcionesTurnos += `<option value="${t.IDturno}" ${sel}>${t.nombre}</option>`;
                    });
                }

                const esPendiente = (f.nombre.toLowerCase().includes('por enrolar') || f.apellidoP.toLowerCase().includes('por enrolar') || f.nombre.toLowerCase().includes('funcionario'));

                const colorBorde = esPendiente ? 'border-start-warning border-warning' : 'border-start-danger';
                const colorFondo = esPendiente ? 'bg-warning-light' : 'bg-white';
                const iconoAlerta = esPendiente ? `<i class="bi bi-exclamation-triangle-fill text-warning me-2" title="Requiere enrolamiento"></i>` : `<i class="bi bi-person-circle me-2 text-secondary"></i>`;

                let filaHTML = `
                <div class="list-group-item p-0 funcionario-item ${colorBorde} shadow-sm mb-2 rounded">
                    <div class="row m-0 align-items-center py-3 px-3 ${colorFondo} fila-visible cursor-pointer" onclick="abrirPanelFuncionario('${safeId}', '${f.rut}', 'calendario', event)">
                        <div class="col-12 col-lg-2 ps-lg-3 mb-2 mb-lg-0 fw-semibold text-muted font-monospace">${formatearRUT(f.rut)}</div>
                        <div class="col-12 col-lg-3 mb-2 mb-lg-0 text-black fw-bold text-truncate">${iconoAlerta}${f.nombre} ${f.apellidoP}</div>
                        <div class="col-6 col-lg-3 text-truncate text-muted d-none d-md-block">${textoSeccion}</div>
                        <div class="col-6 col-lg-2 d-none d-md-block"><span class="badge bg-light text-dark border px-2 py-1"><i class="bi bi-clock me-1"></i>${textoTurno}</span></div>
                        <div class="col-12 col-lg-2 text-end mt-3 mt-lg-0 pe-lg-3">
                            <button class="btn btn-sm btn-outline-primary shadow-sm py-1 px-2 me-2 fw-bold" title="Editar" onclick="abrirPanelFuncionario('${safeId}', '${f.rut}', 'editar', event)">
                                <i class="bi bi-pencil-square"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-outline-danger shadow-sm py-1 px-2" title="Eliminar" onclick="event.stopPropagation(); confirmarBorradoFuncionario('${f.rut}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div id="${colId}" class="collapse panel-desplegado border-top border-bottom border-2 border-danger" data-bs-parent="#contenedor-funcionarios">
                        <div class="p-3 p-md-4 p-xl-5 bg-white">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <h4 class="fw-bold text-black mb-0 fs-5 fs-md-4"><i class="bi bi-person-vcard me-2 text-danger-yb"></i> Panel del Funcionario</h4>
                                <button type="button" class="btn-close" aria-label="Close" onclick="cerrarPanelFuncionario('${safeId}', event)"></button>
                            </div>
                            <div class="row g-4 align-items-stretch">
                                <div id="col-form-${safeId}" class="col-12 col-xl-4">
                                    <div class="card border-0 shadow-sm rounded-4 h-100">
                                        <div class="card-body p-4 d-flex flex-column h-100">
                                            <h5 class="fw-bold mb-4 text-blue-yb border-bottom pb-3"><i class="bi bi-pencil-square me-2"></i> Editar Información</h5>
                                            <form class="d-flex flex-column flex-grow-1">
                                                
                                                <div class="mb-3">
                                                    <label class="form-label small fw-bold text-muted text-uppercase">RUT (Sin puntos ni guión)</label>
                                                    <input type="text" class="form-control fw-bold text-primary bg-light" id="edit_rut_nuevo_${f.rut}" value="${f.rut}">
                                                </div>

                                                <div class="mb-3">
                                                    <label class="form-label small fw-bold text-muted text-uppercase">Nombres</label>
                                                    <input type="text" class="form-control" id="edit_nom_${f.rut}" value="${f.nombre}">
                                                </div>
                                                <div class="row mb-3 g-2">
                                                    <div class="col-6">
                                                        <label class="form-label small fw-bold text-muted text-uppercase">Ap. Paterno</label>
                                                        <input type="text" class="form-control" id="edit_ap_${f.rut}" value="${f.apellidoP}">
                                                    </div>
                                                    <div class="col-6">
                                                        <label class="form-label small fw-bold text-muted text-uppercase">Ap. Materno</label>
                                                        <input type="text" class="form-control" id="edit_am_${f.rut}" value="${f.apellidoM || ''}">
                                                    </div>
                                                </div>
                                                <div class="mb-3">
                                                    <label class="form-label small fw-bold text-muted text-uppercase">Sección</label>
                                                    <select class="form-select" id="edit_depto_${f.rut}">${opcionesSecciones}</select>
                                                </div>
                                                <div class="mb-4">
                                                    <label class="form-label small fw-bold text-muted text-uppercase">Turno</label>
                                                    <select class="form-select" id="edit_turno_${f.rut}">${opcionesTurnos}</select>
                                                </div>
                                                <div class="mt-auto pt-3">
                                                    <button type="button" class="btn btn-primary fw-bold w-100 py-3 shadow-sm" style="background-color: var(--yb-blue); border-color: var(--yb-blue);" onclick="guardarEdicionFuncionario('${f.rut}')">
                                                        <i class="bi bi-save me-2"></i> Guardar Cambios
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div id="col-cal-${safeId}" class="col-12 col-xl-8">
                                    <div class="card border-0 shadow-sm rounded-4 h-100">
                                        <div class="card-body p-4 d-flex flex-column h-100">
                                            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom pb-3 mb-4 gap-3">
                                                <h5 class="fw-bold mb-0 text-blue-yb"><i class="bi bi-calendar-check me-2"></i> Registro de Asistencia</h5>
                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="bg-light rounded p-1 d-flex align-items-center border me-2">
                                                        <button class="btn btn-sm btn-white border-0 fw-bold" onclick="cambiarMes(-1, '${safeId}', '${f.rut}')"><i class="bi bi-chevron-left"></i></button>
                                                        <span id="mes-anio-${safeId}" class="fw-bold text-uppercase px-3 text-center" style="min-width: 140px;"></span>
                                                        <button class="btn btn-sm btn-white border-0 fw-bold" onclick="cambiarMes(1, '${safeId}', '${f.rut}')"><i class="bi bi-chevron-right"></i></button>
                                                    </div>
                                                    
                                                    <button class="btn btn-outline-primary fw-bold shadow-sm px-3 py-1" style="height: 36px;" title="Registrar Ausencia" onclick="abrirModalAusencia('${f.rut}')">
                                                        <i class="bi bi-file-medical fs-5"></i>
                                                    </button>
                                                    
                                                    <button class="btn btn-outline-danger fw-bold shadow-sm px-3 py-1 ms-1" style="height: 36px;" title="Descargar Reporte" onclick="generarReporteMensual('${f.rut}')">
                                                        <i class="bi bi-file-pdf-fill fs-5"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <div id="calendario-simple-${safeId}" class="flex-grow-1 d-flex flex-column justify-content-center"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

                if (esPendiente) {
                    htmlPendientes += filaHTML;
                } else {
                    htmlActivos += filaHTML;
                }
            });

            contenedorActivos.innerHTML = htmlActivos || '<div class="p-4 text-center text-muted fw-bold">No hay personal activo registrado.</div>';
            if (contenedorPendientes) {
                contenedorPendientes.innerHTML = htmlPendientes || '<div class="p-4 text-center text-muted fw-bold">No hay funcionarios pendientes de enrolamiento.</div>';
            }

        } else {
            contenedorActivos.innerHTML = '<div class="alert alert-warning text-center fw-bold shadow-sm p-4 m-3 fs-5">No hay funcionarios registrados.</div>';
            if (contenedorPendientes) contenedorPendientes.innerHTML = '';
        }
    } catch (error) {
        console.error("Error cargando lista:", error);
    }
}

async function abrirPanelFuncionario(safeId, rutReal, modo, event) {
    if (event) event.stopPropagation();
    const collapseEl = document.getElementById(`edit-func-${safeId}`);
    const formCol = document.getElementById(`col-form-${safeId}`);
    const calCol = document.getElementById(`col-cal-${safeId}`);

    if (!formCol || !calCol) return;

    if (modo === 'calendario') {
        formCol.style.display = 'none';
        calCol.className = 'col-12';
    } else {
        formCol.style.display = 'block';
        calCol.className = 'col-12 col-xl-8';
    }

    await cargarDatosYDibujarCalendario(safeId, rutReal, fechaActualVisualizacion);
    const bsCollapse = bootstrap.Collapse.getInstance(collapseEl) || new bootstrap.Collapse(collapseEl, { toggle: false });
    const modoActual = collapseEl.getAttribute('data-modo-actual');

    if (collapseEl.classList.contains('show') && modoActual === modo) {
        bsCollapse.hide();
        collapseEl.removeAttribute('data-modo-actual');
    } else {
        bsCollapse.show();
        collapseEl.setAttribute('data-modo-actual', modo);
    }
}

function cerrarPanelFuncionario(safeId, event) {
    if (event) event.stopPropagation();
    const bsCollapse = bootstrap.Collapse.getInstance(document.getElementById(`edit-func-${safeId}`));
    if (bsCollapse) {
        bsCollapse.hide();
        document.getElementById(`edit-func-${safeId}`).removeAttribute('data-modo-actual');
    }
}

async function cambiarMes(direccion, safeId, rutReal) {
    fechaActualVisualizacion.setMonth(fechaActualVisualizacion.getMonth() + direccion);
    await cargarDatosYDibujarCalendario(safeId, rutReal, fechaActualVisualizacion);
}

async function cargarDatosYDibujarCalendario(safeId, rutReal, fecha) {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth() + 1;
    const contenedor = document.getElementById(`calendario-simple-${safeId}`);

    if (contenedor) contenedor.innerHTML = '<div class="text-center py-5 my-5"><div class="spinner-border text-danger-yb" role="status"></div></div>';

    try {
        const req = await fetch(`../../controller/asistencia_controller.php?action=getAsistencia&rut=${rutReal}&mes=${mes}&anio=${año}`);
        const res = await req.json();
        const datosMes = res.status === 1 ? res.data : {};
        
        window.calendarioData = window.calendarioData || {};
        window.calendarioData[safeId] = datosMes;
        
        dibujarCalendarioSimple(safeId, rutReal, fecha, datosMes);
    } catch (e) {
        window.calendarioData = window.calendarioData || {};
        window.calendarioData[safeId] = {};
        dibujarCalendarioSimple(safeId, rutReal, fecha, {});
    }
}

function dibujarCalendarioSimple(safeId, rutReal, fecha, datosMes) {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const mesAnioElemento = document.getElementById(`mes-anio-${safeId}`);
    if (mesAnioElemento) mesAnioElemento.innerText = `${nombresMeses[mes]} ${año}`;

    const contenedor = document.getElementById(`calendario-simple-${safeId}`);
    if (!contenedor) return;

    const totalDiasMes = new Date(año, mes + 1, 0).getDate();
    const primerDiaSemana = new Date(año, mes, 1).getDay();
    let totalMinutosMes = 0;

    let htmlCalendario = `
        <div class="d-grid mb-1 text-center small" style="grid-template-columns: repeat(7, 1fr); gap: 6px;">
            <div class="fw-bolder text-danger">Do</div><div class="fw-bolder text-secondary">Lu</div>
            <div class="fw-bolder text-secondary">Ma</div><div class="fw-bolder text-secondary">Mi</div>
            <div class="fw-bolder text-secondary">Ju</div><div class="fw-bolder text-secondary">Vi</div>
            <div class="fw-bolder text-danger">Sá</div>
        </div>
        <div class="d-grid" style="grid-template-columns: repeat(7, 1fr); gap: 6px;">
    `;

    for (let i = 0; i < primerDiaSemana; i++) {
        htmlCalendario += `<div class="cal-day-box border-0" style="background: transparent; cursor: default;"></div>`;
    }

    for (let dia = 1; dia <= totalDiasMes; dia++) {
        const infoDia = datosMes[dia];
        let bgClass = 'cal-day-empty'; 
        let contenidoCelda = `<div class="fw-bold text-center w-100 h-100 d-flex justify-content-center align-items-center numero-calendario">${dia}</div>`;

        const diaDeLaSemana = new Date(año, mes, dia).getDay();

        if (infoDia) {
            if (infoDia.estado === 'licencia') {
                bgClass = 'cal-day-licencia';
                contenidoCelda = `<div class="p-1 w-100 d-flex flex-column h-100 text-center justify-content-center"><div class="fw-bold fs-6 mb-1">${dia}</div><div class="fw-bold" style="font-size: 0.7rem;"><i class="bi bi-bandaid"></i><br>Licencia</div></div>`;
                if (diaDeLaSemana >= 1 && diaDeLaSemana <= 5) totalMinutosMes += 480; 

            } else if (infoDia.estado === 'vacaciones') {
                bgClass = 'cal-day-vacaciones';
                contenidoCelda = `<div class="p-1 w-100 d-flex flex-column h-100 text-center justify-content-center"><div class="fw-bold fs-6 mb-1">${dia}</div><div class="fw-bold" style="font-size: 0.7rem;"><i class="bi bi-airplane"></i><br>Feriado</div></div>`;
                if (diaDeLaSemana >= 1 && diaDeLaSemana <= 5) totalMinutosMes += 480; 

            } else if (infoDia.estado === 'falta') {
                bgClass = 'dia-danger'; 
                contenidoCelda = `<div class="p-1 w-100 d-flex flex-column h-100 text-center justify-content-center"><div class="fw-bold fs-6 mb-1">${dia}</div><div class="fw-bold text-danger" style="font-size: 0.7rem;"><i class="bi bi-x-circle"></i><br>Ausente</div></div>`;
            } else {
                bgClass = infoDia.estado === 'verde' ? 'cal-day-success' : 'cal-day-warning';
                
                totalMinutosMes += infoDia.minutos_totales || 0;
                let badgeExtra = '';

                if (infoDia.extra !== '00:00') {
                    let colorExtra = infoDia.tipo_extra === 'Nocturna' ? 'bg-dark' : 'bg-primary';
                    badgeExtra = `<div class="mt-1"><span class="badge ${colorExtra} w-100" style="font-size:0.6rem;">+${infoDia.extra}</span></div>`;
                }

                contenidoCelda = `
                    <div class="p-1 p-md-2 w-100 d-flex flex-column h-100 text-start texto-calendario" style="font-size: 0.75rem;">
                        <div class="fw-bold text-end mb-1 numero-calendario fs-6">${dia}</div>
                        <div class="d-flex justify-content-between align-items-center text-muted fw-semibold">
                            <span>E:</span> <span class="text-dark">${infoDia.entrada}</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center text-muted fw-semibold mb-1">
                            <span>S:</span> <span class="text-dark">${infoDia.salida}</span>
                        </div>
                        ${badgeExtra}
                    </div>
                `;
            }
        }
        
        htmlCalendario += `<div class="cal-day-box rounded-3 ${bgClass}" style="min-height: 85px; cursor: pointer; transition: transform 0.2s;" title="Ver detalle del día" onclick="verDetalleAsistencia('${safeId}', ${dia}, ${mes}, ${año})" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">${contenidoCelda}</div>`;
    }
    htmlCalendario += `</div>`;

    let totalHrs = Math.floor(totalMinutosMes / 60);
    let totalMins = totalMinutosMes % 60;

    htmlCalendario += `
        <div class="alert alert-secondary mt-auto mb-0 py-2 d-flex flex-column flex-md-row justify-content-between align-items-md-center fw-bold shadow-sm border-0 mt-4">
            <span class="mb-2 mb-md-0"><i class="bi bi-clock-history me-2"></i>Total Horas ${nombresMeses[mes]}:</span>
            <span class="text-danger-yb fs-5 bg-white px-3 py-1 rounded shadow-sm">${totalHrs}h ${totalMins}m</span>
        </div>
    `;
    contenedor.innerHTML = htmlCalendario;
}

function verDetalleAsistencia(safeId, dia, mes, año) {
    const modalEl = document.getElementById('modalDetalleDia');
    if (!modalEl) return;

    let datosDelMes = {};
    if (window.calendarioData && window.calendarioData[safeId]) {
        datosDelMes = window.calendarioData[safeId];
    }
    const infoDia = datosDelMes[dia] || {};

    const estado = (infoDia.estado && String(infoDia.estado) !== "undefined") ? infoDia.estado : 'vacio';
    const entrada = (infoDia.entrada && String(infoDia.entrada) !== "undefined") ? infoDia.entrada : '--:--';
    const salida = (infoDia.salida && String(infoDia.salida) !== "undefined") ? infoDia.salida : '--:--';
    const extra = (infoDia.extra && String(infoDia.extra) !== "undefined") ? infoDia.extra : '00:00';
    const fotoEntrada = (infoDia.foto_entrada && String(infoDia.foto_entrada) !== "undefined") ? infoDia.foto_entrada : '';
    const fotoSalida = (infoDia.foto_salida && String(infoDia.foto_salida) !== "undefined") ? infoDia.foto_salida : '';

    document.getElementById('detalle_fecha').innerText = `${dia} de ${nombresMeses[mes]}, ${año}`;
    
    const badge = document.getElementById('detalle_estado_badge');
    if (estado === 'verde') {
        badge.className = 'badge bg-success rounded-pill px-3 py-1 fs-6 text-white';
        badge.innerText = 'Asistencia Completa';
    } else if (estado === 'amarillo') {
        badge.className = 'badge bg-warning text-dark rounded-pill px-3 py-1 fs-6';
        badge.innerText = 'Asistencia Incompleta';
    } else if (estado === 'falta') {
        badge.className = 'badge bg-danger rounded-pill px-3 py-1 fs-6 text-white';
        badge.innerText = 'Ausente (Falta)';
    } else if (estado === 'licencia') {
        badge.className = 'badge rounded-pill px-3 py-1 fs-6 text-white';
        badge.style.backgroundColor = '#6f42c1';
        badge.innerText = 'Licencia Médica';
    } else if (estado === 'vacaciones') {
        badge.className = 'badge rounded-pill px-3 py-1 fs-6 text-white';
        badge.style.backgroundColor = '#087990';
        badge.innerText = 'Feriado Legal';
    } else {
        badge.className = 'badge bg-secondary rounded-pill px-3 py-1 fs-6 text-white';
        badge.innerText = 'Sin Registro';
    }

    const cajaFotos = document.getElementById('detalle_caja_fotos');
    const imgE = document.getElementById('detalle_img_entrada');
    const imgS = document.getElementById('detalle_img_salida');
    const colE = document.getElementById('col_foto_entrada');
    const colS = document.getElementById('col_foto_salida');

    if (fotoEntrada.length > 50 || fotoSalida.length > 50) {
        cajaFotos.classList.remove('d-none'); 
        if (fotoEntrada.length > 50) {
            imgE.src = fotoEntrada;
            colE.classList.remove('d-none');
        } else { colE.classList.add('d-none'); }

        if (fotoSalida.length > 50) {
            imgS.src = fotoSalida;
            colS.classList.remove('d-none');
        } else { colS.classList.add('d-none'); }
    } else {
        cajaFotos.classList.add('d-none');
    }

    document.getElementById('detalle_entrada').innerText = entrada;
    document.getElementById('detalle_salida').innerText = salida;

    const filaExtra = document.getElementById('fila_extra');
    if (extra !== '00:00') {
        filaExtra.style.setProperty('display', 'flex', 'important');
        document.getElementById('detalle_extra').innerText = `+${extra} hrs`;
    } else {
        filaExtra.style.setProperty('display', 'none', 'important');
    }

    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
}

async function guardarEdicionFuncionario(rutOriginal) {
    const rutNuevoLimpio = document.getElementById(`edit_rut_nuevo_${rutOriginal}`).value.replace(/[\.\-]/g, '').trim();
    const datos = {
        rut_original: rutOriginal,
        rut_nuevo: rutNuevoLimpio,
        nombre: document.getElementById(`edit_nom_${rutOriginal}`).value,
        apellidoP: document.getElementById(`edit_ap_${rutOriginal}`).value,
        apellidoM: document.getElementById(`edit_am_${rutOriginal}`).value,
        departamento: document.getElementById(`edit_depto_${rutOriginal}`).value,
        turno: document.getElementById(`edit_turno_${rutOriginal}`).value
    };
    const res = await apiFuncionarios.updateFuncionario(datos);
    if (res.status === 1) {
        mostrarNotificacion("Funcionario actualizado con éxito", "success");
        cerrarPanelFuncionario(rutOriginal.replace(/[^a-zA-Z0-9]/g, ''));
        cargarListaFuncionarios();
    } else {
        mostrarNotificacion("Error: " + res.message, "error");
    }
}

function confirmarBorradoFuncionario(rut) {
    funcionarioAborrarId = rut;
    const modal = new bootstrap.Modal(document.getElementById('modalBorrar'));
    modal.show();
}

function generarReporteMensual(rutFuncionario) {
    const mesActual = fechaActualVisualizacion.getMonth() + 1;
    const anioActual = fechaActualVisualizacion.getFullYear();
    const url = `../../controller/reporte_controller.php?rut=${rutFuncionario}&mes=${mesActual}&anio=${anioActual}`;
    window.open(url, '_blank');
}

function abrirModalAusencia(rut) {
    const modalEl = document.getElementById('modalAusencia');
    if (!modalEl) return;
    document.getElementById('formAusencia').reset();
    document.getElementById('ausencia_rut').value = rut;
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
}

async function guardarAusencia() {
    const rut = document.getElementById('ausencia_rut').value;
    const tipo = document.getElementById('ausencia_tipo').value;
    const inicio = document.getElementById('ausencia_inicio').value;
    const fin = document.getElementById('ausencia_fin').value;
    const obs = document.getElementById('ausencia_obs').value;

    if (!tipo || !inicio || !fin) { mostrarNotificacion("Debe seleccionar el tipo y las fechas.", "warning"); return; }
    if (inicio > fin) { mostrarNotificacion("La fecha de inicio no puede ser posterior al término.", "warning"); return; }

    try {
        const formData = new FormData();
        formData.append('action', 'registrarAusencia');
        formData.append('rut', rut);
        formData.append('tipo', tipo);
        formData.append('fecha_inicio', inicio);
        formData.append('fecha_fin', fin);
        formData.append('observacion', obs);

        const req = await fetch('../../controller/asistencia_controller.php', { method: 'POST', body: formData });
        const res = await req.json();

        if (res.status === 1) {
            mostrarNotificacion("Ausencia registrada correctamente.", "success");
            bootstrap.Modal.getInstance(document.getElementById('modalAusencia')).hide();
            const safeId = rut.replace(/[^a-zA-Z0-9]/g, '');
            await cargarDatosYDibujarCalendario(safeId, rut, fechaActualVisualizacion);
        } else { mostrarNotificacion("Error: " + res.message, "error"); }
    } catch (error) { mostrarNotificacion("Error de conexión al registrar.", "error"); }
}
/* =========================================================================
   MÓDULO 5: SECCIONES
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
                            <div class="icon-depto me-3 text-primary fs-3"><i class="bi bi-building"></i></div>
                            <div>
                                <h5 class="fw-bold text-black mb-0">${sec.nombre}</h5>
                                <small class="text-muted">ID: ${sec.id}</small>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer bg-white border-top-0 p-4 pt-0 d-flex gap-2">
                        <button type="button" class="btn btn-sm btn-outline-dark flex-grow-1 fw-bold" onclick="editarSeccion(${sec.id}, '${sec.nombre}')">
                            <i class="bi bi-pencil-square me-1"></i> Editar
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger px-3" onclick="confirmarBorrarSeccion(${sec.id}, '${sec.nombre}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        });
    } else {
        contenedor.innerHTML = `<div class="col-12"><div class="alert alert-warning text-center fw-bold shadow-sm border-0"><i class="bi bi-exclamation-circle me-2"></i> No hay secciones registradas.</div></div>`;
    }
}

function abrirModalNuevaSeccion() {
    const modalEl = document.getElementById('modalFormSeccion');
    if (!modalEl) return;
    if (document.getElementById('formSeccion')) document.getElementById('formSeccion').reset();
    if (document.getElementById('seccion_id')) document.getElementById('seccion_id').value = '';
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
}

async function guardarSeccion() {
    const id = document.getElementById('seccion_id').value;
    const nombre = document.getElementById('seccion_nombre').value.trim();
    if (!nombre) { mostrarNotificacion("El nombre de la sección no puede estar vacío.", "warning"); return; }
    let res;
    if (id) { res = await apiSecciones.updateSeccion(id, nombre); } 
    else { res = await apiSecciones.createSeccion(nombre); }

    if (res.status === 1) {
        mostrarNotificacion(id ? "Sección actualizada." : "Sección creada exitosamente.", "success");
        const modalEl = document.getElementById('modalFormSeccion');
        if (modalEl) bootstrap.Modal.getInstance(modalEl).hide();
        cargarListaSecciones();
    } else { mostrarNotificacion("Error: " + res.message, "error"); }
}

function editarSeccion(id, nombre) {
    document.getElementById('seccion_id').value = id;
    document.getElementById('seccion_nombre').value = nombre;
    
    // Llamado infalible del modal
    const modalEl = document.getElementById('modalFormSeccion');
    if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.show();
    }
}

/* =========================================================================
   MÓDULO 6: TERMINAL DE ESCÁNER (CON AUDIOS)
   ========================================================================= */
function actualizarRelojYFecha() {
    const reloj = document.getElementById('reloj-digital');
    const fechaDiv = document.getElementById('fecha-actual');
    if (!reloj || !fechaDiv) return;
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');
    reloj.textContent = `${horas}:${minutos}:${segundos}`;
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let fechaFormateada = ahora.toLocaleDateString('es-ES', opcionesFecha);
    fechaDiv.textContent = fechaFormateada;
}

if (document.getElementById('reloj-digital')) {
    actualizarRelojYFecha();
    setInterval(actualizarRelojYFecha, 1000);
    document.addEventListener('click', function () {
        const inputScanner = document.getElementById('codigo_tarjeta');
        if (inputScanner) inputScanner.focus();
    });
}

let html5QrcodeScanner = null;
function toggleCamaraEscaner() {
    const container = document.getElementById('reader-container');
    const btn = document.getElementById('btnToggleCamara');
    if (container.style.display === 'none') {
        container.style.display = 'block';
        btn.innerHTML = '<i class="bi bi-camera-video-off me-2"></i> Apagar Cámara';
        btn.classList.replace('btn-outline-secondary', 'btn-outline-danger');
        html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 350, height: 150 }, formatsToSupport: [Html5QrcodeSupportedFormats.CODE_128] }, false);
        html5QrcodeScanner.render(onScanSuccess, onScanFailure);
    } else {
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear().then(() => {
                container.style.display = 'none';
                btn.innerHTML = '<i class="bi bi-camera-video me-2"></i> Usar Cámara del PC';
                btn.classList.replace('btn-outline-danger', 'btn-outline-secondary');
            });
        }
    }
}

function onScanSuccess(decodedText, decodedResult) {
    const inputCodigo = document.getElementById('codigo_tarjeta');
    if (inputCodigo) {
        inputCodigo.value = decodedText;
        const formEscaner = document.getElementById('form_marcar_asistencia');
        if (formEscaner) { formEscaner.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); }
    }
}
function onScanFailure(error) {}

const videoSeguridad = document.getElementById('videoSeguridad');
const canvasSeguridad = document.getElementById('canvasSeguridad');
if (videoSeguridad) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => { videoSeguridad.srcObject = stream; videoSeguridad.play(); })
        .catch(err => console.log("Cámara de seguridad no disponible:", err));
}

const formEscanerGlobal = document.getElementById('form_marcar_asistencia');
if (formEscanerGlobal) {
    formEscanerGlobal.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputCodigo = document.getElementById('codigo_tarjeta');
        const radioSeleccionado = document.querySelector('input[name="tipo_marca"]:checked');

        if (!radioSeleccionado) {
            mostrarNotificacion("⚠️ ¡ALTO! Debe presionar obligatoriamente el botón de ENTRADA o SALIDA.", "warning");
            inputCodigo.value = ''; inputCodigo.focus(); return;
        }

        const tipoSeleccionado = radioSeleccionado.value;
        const codigo = inputCodigo.value.trim();

        if (!codigo || codigo.length < 8) {
            mostrarNotificacion("Código inválido. Verifique su credencial.", "warning");
            try { new Audio('../../assets/audio/error.mp3').play(); } catch(err){}
            inputCodigo.value = ''; return;
        }

        let fotoBase64 = "";
        if (videoSeguridad && videoSeguridad.srcObject && videoSeguridad.readyState === 4) {
            canvasSeguridad.width = videoSeguridad.videoWidth;
            canvasSeguridad.height = videoSeguridad.videoHeight;
            const ctx = canvasSeguridad.getContext('2d');
            ctx.drawImage(videoSeguridad, 0, 0, canvasSeguridad.width, canvasSeguridad.height);
            fotoBase64 = canvasSeguridad.toDataURL('image/jpeg', 0.7);
        }

        try {
            const req = await fetch('../../controller/asistencia_controller.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'registrarMarca', codigo: codigo, tipo: tipoSeleccionado, foto: fotoBase64 })
            });
            const res = await req.json();
            
            if (res.status === 1) {
                mostrarNotificacion(res.message || "Marca registrada con éxito", "success");
                radioSeleccionado.checked = false; 

                // Reproducir Audio de Éxito
                try {
                    let rutaAudio = (tipoSeleccionado === 'entrada') 
                        ? '../../assets/audio/entrada.mp3' 
                        : '../../assets/audio/salida.mp3';
                    let sonidoExito = new Audio(rutaAudio);
                    sonidoExito.play();
                } catch (audioErr) {}

            } else {
                mostrarNotificacion(res.message || "Error al registrar la marca", "error");
                try { new Audio('../../assets/audio/error.mp3').play(); } catch (audioErr) {}
            }
            
        } catch (error) {
            console.error("Error al registrar:", error);
            mostrarNotificacion("Error de conexión al servidor.", "error");
            try { new Audio('../../assets/audio/error.mp3').play(); } catch(err){}
        }
        
        inputCodigo.value = '';
        inputCodigo.focus();
    });
}

/* =========================================================================
   MÓDULO 7: GESTIÓN DE USUARIOS
   ========================================================================= */
async function cargarListaUsuarios() {
    const tbody = document.getElementById('tabla-usuarios');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4"><div class="spinner-border spinner-border-sm text-danger" role="status"></div></td></tr>`;
    const res = await apiUsuarios.getUsuarios();
    tbody.innerHTML = '';
    if (res.status === 1 && res.data && res.data.length > 0) {
        res.data.forEach(u => {
            let rolBadge = u.rol === 'superadmin' ? 'bg-danger-yb-light text-danger-yb' : 'bg-blue-yb-light text-blue-yb';
            let estadoBadge = u.estado === 'Activo' ? 'bg-success text-white' : 'bg-secondary text-white';
            tbody.innerHTML += `
            <tr>
                <td class="ps-4 py-3 fw-bold text-black"><i class="bi bi-person-circle text-muted me-2 fs-5 align-middle"></i> ${u.nombre}</td>
                <td class="py-3">${u.login}</td>
                <td class="py-3"><span class="badge ${rolBadge} border-0 px-2 py-1">${u.rol}</span></td>
                <td class="py-3"><span class="badge ${estadoBadge} rounded-pill">${u.estado}</span></td>
                <td class="text-end pe-4 py-3">
                    <button class="btn btn-sm btn-outline-primary" style="color: var(--yb-blue); border-color: var(--yb-blue);" onclick="editarUsuario(${u.id}, '${u.nombre}', '${u.login}', '${u.rol}', '${u.estado}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger ms-1" style="color: var(--yb-red); border-color: var(--yb-red);" onclick="abrirModalBorrarUsuario(${u.id})"><i class="bi bi-trash"></i></button>
                </td>
            </tr>`;
        });
    } else { tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4">No se encontraron usuarios.</td></tr>'; }
}

function abrirModalUsuario() {
    const modalEl = document.getElementById('modalFormUsuario');
    if (!modalEl) return;
    if (document.getElementById('formUsuario')) document.getElementById('formUsuario').reset();
    if (document.getElementById('usuario_id')) document.getElementById('usuario_id').value = '';
    if (document.getElementById('textoTituloModal')) document.getElementById('textoTituloModal').innerText = 'Registrar Nuevo Usuario';
    if (document.getElementById('hint-password')) document.getElementById('hint-password').style.display = 'none';
    if (document.getElementById('usuario_password')) document.getElementById('usuario_password').required = true;
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
}

function editarUsuario(id, nombre, login, rol, estado) {
    document.getElementById('usuario_id').value = id;
    document.getElementById('usuario_nombre').value = nombre;
    document.getElementById('usuario_login').value = login;
    document.getElementById('usuario_rol').value = rol;
    document.getElementById('usuario_estado').value = estado;
    document.getElementById('usuario_password').value = '';
    document.getElementById('usuario_password').required = false;
    document.getElementById('textoTituloModal').innerText = 'Editar Usuario';
    document.getElementById('hint-password').style.display = 'inline';
    new bootstrap.Modal(document.getElementById('modalFormUsuario')).show();
}

async function guardarUsuario() {
    const id = document.getElementById('usuario_id').value;
    const datos = {
        nombre: document.getElementById('usuario_nombre').value.trim(),
        login: document.getElementById('usuario_login').value.trim(),
        password: document.getElementById('usuario_password').value,
        rol: document.getElementById('usuario_rol').value,
        estado: document.getElementById('usuario_estado').value
    };
    if (!datos.nombre || !datos.login) { mostrarNotificacion("El nombre y el login son obligatorios.", "warning"); return; }
    let res;
    if (id) { datos.id = id; res = await apiUsuarios.updateUsuario(datos); } 
    else { res = await apiUsuarios.createUsuario(datos); }
    if (res.status === 1) {
        mostrarNotificacion("Usuario guardado exitosamente.", "success");
        bootstrap.Modal.getInstance(document.getElementById('modalFormUsuario')).hide();
        cargarListaUsuarios();
    } else { mostrarNotificacion("Error: " + res.message, "error"); }
}

function abrirModalBorrarUsuario(id) { document.getElementById('delete_usuario_id').value = id; new bootstrap.Modal(document.getElementById('modalBorrarUsuario')).show(); }

async function ejecutarBorrarUsuario() {
    const id = document.getElementById('delete_usuario_id').value;
    if (!id) return;
    const res = await apiUsuarios.deleteUsuario(id);
    if (res.status === 1) {
        mostrarNotificacion("Usuario eliminado con éxito.", "delete");
        bootstrap.Modal.getInstance(document.getElementById('modalBorrarUsuario')).hide();
        cargarListaUsuarios();
    } else { mostrarNotificacion("Error al eliminar: " + res.message, "error"); }
}

/* =========================================================================
   MÓDULO 8: DASHBOARD INICIO (CON AVISOS INTELIGENTES)
   ========================================================================= */
async function cargarEstadisticasDashboard() {
    try {
        const req = await fetch('../../controller/dashboard_controller.php?action=getStats');
        const res = await req.json();
        
        if (res.status === 1) {
            document.getElementById('dash-total-func').innerHTML = res.data.total_funcionarios || '0';
            document.getElementById('dash-presentes').innerHTML = res.data.presentes_hoy || '0';
            document.getElementById('dash-atrasos').innerHTML = res.data.atrasos_hoy || '0';
            document.getElementById('dash-licencias').innerHTML = res.data.licencias_activas || '0';

            const contenedorAvisos = document.getElementById('lista-avisos');
            if (contenedorAvisos) {
                let htmlAvisos = '';

                if (res.data.pendientes_enrolar && parseInt(res.data.pendientes_enrolar) > 0) {
                    htmlAvisos += `
                        <li class="list-group-item d-flex justify-content-between align-items-start border-0 px-0 text-black mb-3">
                            <i class="bi bi-exclamation-triangle-fill text-warning me-3 mt-1 fs-3"></i>
                            <div class="ms-2 me-auto">
                                <div class="fw-bold">Funcionarios sin credencial</div>
                                <span class="text-muted d-block mb-1">Tienes <b>${res.data.pendientes_enrolar}</b> funcionario(s) "Por Enrolar" en el sistema.</span>
                                <a href="VistaAsistencia.php" class="btn btn-sm btn-outline-warning fw-bold px-3 mt-2">Ir a enrolarlos</a>
                            </div>
                        </li>
                    `;
                }

                if (res.data.licencias_activas && parseInt(res.data.licencias_activas) > 0) {
                    htmlAvisos += `
                        <li class="list-group-item d-flex justify-content-between align-items-start border-0 px-0 text-black mb-3">
                            <i class="bi bi-file-medical-fill text-primary me-3 mt-1 fs-3"></i>
                            <div class="ms-2 me-auto">
                                <div class="fw-bold">Licencias y Feriados Activos</div>
                                <span class="text-muted">El día de hoy hay <b>${res.data.licencias_activas}</b> funcionario(s) con licencia médica o vacaciones.</span>
                            </div>
                        </li>
                    `;
                }

                if (res.data.atrasos_hoy && parseInt(res.data.atrasos_hoy) > 0) {
                    htmlAvisos += `
                        <li class="list-group-item d-flex justify-content-between align-items-start border-0 px-0 text-black mb-3">
                            <i class="bi bi-clock-history text-danger me-3 mt-1 fs-3"></i>
                            <div class="ms-2 me-auto">
                                <div class="fw-bold">Atrasos registrados</div>
                                <span class="text-muted">Se han detectado <b>${res.data.atrasos_hoy}</b> atraso(s) en la jornada de hoy.</span>
                            </div>
                        </li>
                    `;
                }

                if (htmlAvisos === '') {
                    htmlAvisos = `
                        <div class="alert alert-success text-center fw-bold shadow-sm border-0 d-flex flex-column align-items-center py-4">
                            <i class="bi bi-check-circle-fill text-success mb-2" style="font-size: 2.5rem;"></i>
                            ¡Todo en orden! No hay avisos pendientes en el sistema.
                        </div>
                    `;
                }

                contenedorAvisos.innerHTML = htmlAvisos;
            }
        } else {
            mostrarCerosDashboard();
            mostrarNotificacion("Error al cargar estadísticas: " + res.message, "warning");
        }
    } catch (error) {
        mostrarCerosDashboard();
        mostrarNotificacion("Error crítico al conectar con el servidor.", "error");
    }
}

function mostrarCerosDashboard() {
    document.getElementById('dash-total-func').innerHTML = '0';
    document.getElementById('dash-presentes').innerHTML = '0';
    document.getElementById('dash-atrasos').innerHTML = '0';
    document.getElementById('dash-licencias').innerHTML = '0';
    
    const contenedorAvisos = document.getElementById('lista-avisos');
    if (contenedorAvisos) {
        contenedorAvisos.innerHTML = '<div class="alert alert-secondary text-center">No se pudo cargar la información.</div>';
    }
}
/* =========================================================================
   MÓDULO 9: BORRADO GLOBAL (FUNCIONARIOS) E IMPORTACIÓN CSV
   ========================================================================= */
async function ejecutarBorradoSeguro() {
    const passwordInput = document.getElementById('password-admin-borrado').value;

    if (!passwordInput) {
        mostrarNotificacion("Debe ingresar la contraseña de autorización.", "warning");
        return;
    }

    const btnConfirmar = document.getElementById('btn-confirmar-borrado-seguro');
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Validando...';

    try {
        const formData = new FormData();
        formData.append('action', 'validarPassword');
        formData.append('password', passwordInput);

        // Envía la contraseña a validar al PHP
        const reqValidar = await fetch('../../controller/seguridad_controller.php', { method: 'POST', body: formData });
        const resValidar = await reqValidar.json();

        if (resValidar.status === 1) {
            // ¡CONTRASEÑA "admin1234" CORRECTA! PROCEDE A BORRAR
            if (tipoItemABorrar === 'turno' && turnoABorrarId) {
                const resBorrar = await apiTurnos.deleteTurno(turnoABorrarId);
                if (resBorrar.status === 1) {
                    mostrarNotificacion("Turno eliminado correctamente.", "success");
                    cargarTarjetasTurnos();
                } else { mostrarNotificacion(resBorrar.message, "error"); }
            } 
            else if (tipoItemABorrar === 'seccion' && seccionABorrarId) {
                const resBorrar = await apiSecciones.deleteSeccion(seccionABorrarId);
                if (resBorrar.status === 1) {
                    mostrarNotificacion("Sección eliminada correctamente.", "success");
                    cargarListaSecciones();
                } else { mostrarNotificacion(resBorrar.message, "error"); }
            }

            bootstrap.Modal.getInstance(document.getElementById('modalBorrarSeguro')).hide();
            turnoABorrarId = null;
            seccionABorrarId = null;

        } else {
            // CONTRASEÑA INCORRECTA
            mostrarNotificacion(resValidar.message, "error");
            document.getElementById('password-admin-borrado').value = '';
            document.getElementById('password-admin-borrado').focus();
        }
    } catch (error) {
        mostrarNotificacion("Error de conexión al validar la contraseña.", "error");
    } finally {
        btnConfirmar.disabled = false;
        btnConfirmar.innerHTML = '<i class="bi bi-trash-fill me-2"></i>Confirmar Eliminación';
    }
}
const formImportar = document.getElementById('form-importar-csv');
if (formImportar) {
    formImportar.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('btn-importar');
        const fileInput = document.getElementById('archivo_csv');
        btn.disabled = true; btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Procesando...';
        const formData = new FormData();
        formData.append('action', 'importar'); formData.append('archivo_csv', fileInput.files[0]);
        try {
            const req = await fetch('../../controller/migracion_controller.php', { method: 'POST', body: formData });
            const res = await req.json();
            if (res.status === 1) {
                mostrarNotificacion(res.message, "success");
                bootstrap.Modal.getInstance(document.getElementById('modalMigracion')).hide();
                if (typeof cargarListaFuncionarios === 'function') cargarListaFuncionarios();
            } else { mostrarNotificacion(res.message, "error"); }
        } catch (error) { mostrarNotificacion("Error de conexión.", "error"); } 
        finally { btn.disabled = false; btn.innerHTML = '<i class="bi bi-database-add me-2"></i> Procesar Archivo'; }
    });
}

function inicializarBuscadorUniversal(idInput, idContenedor, selectorFila) {
    const input = document.getElementById(idInput);
    const contenedor = document.getElementById(idContenedor);
    if (!input || !contenedor) return;

    // Limpieza agresiva en 3 tiempos para ganarle al autocompletado del navegador
    input.value = '';
    setTimeout(() => input.value = '', 100);
    setTimeout(() => input.value = '', 500);

    input.addEventListener('input', function () {
        const termino = this.value.toLowerCase().trim();
        const filas = contenedor.querySelectorAll(selectorFila);
        filas.forEach(fila => {
            const contenido = fila.textContent.toLowerCase();
            if (contenido.includes(termino)) { 
                fila.style.display = ''; 
            } else { 
                fila.style.setProperty('display', 'none', 'important'); 
            }
        });
    });
}
/* =========================================================================
   MÓDULO 10: SEGURIDAD DE BORRADO EXTREMA (TURNOS Y SECCIONES)
   ========================================================================= */
async function confirmarBorrarTurno(id, nombre) {
    turnoABorrarId = id;
    tipoItemABorrar = 'turno';
    nombreItemABorrar = nombre;
    prepararModalSeguroBorrado('turno', id, nombre);
}

async function confirmarBorrarSeccion(id, nombre) {
    seccionABorrarId = id;
    tipoItemABorrar = 'seccion';
    nombreItemABorrar = nombre;
    prepararModalSeguroBorrado('seccion', id, nombre);
}
async function prepararModalSeguroBorrado(tipo, id, nombre) {
    const modalEl = document.getElementById('modalBorrarSeguro');
    if (!modalEl) return;

    document.getElementById('password-admin-borrado').value = '';
    document.getElementById('nombre-item-borrar').innerText = `el registro "${nombre}"`;

    const alertaUso = document.getElementById('alerta-uso-dependencias');
    const textoUso = document.getElementById('texto-uso-dependencias');
    alertaUso.classList.add('d-none');
    
    const btnConfirmar = document.getElementById('btn-confirmar-borrado-seguro');
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Verificando...';

    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();

    try {
        const req = await fetch(`../../controller/seguridad_controller.php?action=verificarUso&tipo=${tipo}&id=${id}`);
        
        // Verificamos si el archivo PHP realmente existe y no dio error 404/500
        if (!req.ok) throw new Error("Error HTTP: " + req.status);

        const res = await req.json();

        if (res.status === 1 && res.cantidad > 0) {
            let palabra = res.cantidad === 1 ? 'funcionario' : 'funcionarios';
            textoUso.innerHTML = `Actualmente hay <b>${res.cantidad} ${palabra}</b> utilizando este ${tipo}. Si lo eliminas, estos funcionarios quedarán "Sin ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}".`;
            alertaUso.classList.remove('d-none');
        } else if (res.status === 0) {
            mostrarNotificacion("Error del servidor: " + res.message, "warning");
        }

    } catch (error) {
        console.error("Error al verificar dependencias", error);
        mostrarNotificacion("No se pudo contactar al servidor de seguridad.", "error");
    } finally {
        // ¡ESTO ES CLAVE! Desbloquea el botón pase lo que pase
        btnConfirmar.disabled = false;
        btnConfirmar.innerHTML = '<i class="bi bi-trash-fill me-2"></i>Confirmar Eliminación';
    }
}
async function ejecutarBorradoSeguro() {
    const passwordInput = document.getElementById('password-admin-borrado').value;

    if (!passwordInput) {
        mostrarNotificacion("Debe ingresar su contraseña de administrador para continuar.", "warning");
        return;
    }

    const btnConfirmar = document.getElementById('btn-confirmar-borrado-seguro');
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Validando...';

    try {
        const formData = new FormData();
        formData.append('action', 'validarPassword');
        formData.append('password', passwordInput);

        const reqValidar = await fetch('../../controller/seguridad_controller.php', { method: 'POST', body: formData });
        const resValidar = await reqValidar.json();

        if (resValidar.status === 1) {
            if (tipoItemABorrar === 'turno' && turnoABorrarId) {
                const resBorrar = await apiTurnos.deleteTurno(turnoABorrarId);
                if (resBorrar.status === 1) {
                    mostrarNotificacion("Turno eliminado correctamente. Los funcionarios han sido desvinculados.", "success");
                    cargarTarjetasTurnos();
                } else {
                    mostrarNotificacion(resBorrar.message, "error");
                }
            } 
            else if (tipoItemABorrar === 'seccion' && seccionABorrarId) {
                const resBorrar = await apiSecciones.deleteSeccion(seccionABorrarId);
                if (resBorrar.status === 1) {
                    mostrarNotificacion("Sección eliminada correctamente. Los funcionarios han sido desvinculados.", "success");
                    cargarListaSecciones();
                } else {
                    mostrarNotificacion(resBorrar.message, "error");
                }
            }

            bootstrap.Modal.getInstance(document.getElementById('modalBorrarSeguro')).hide();
            turnoABorrarId = null;
            seccionABorrarId = null;

        } else {
            mostrarNotificacion("Contraseña incorrecta. Operación denegada.", "error");
            document.getElementById('password-admin-borrado').value = '';
            document.getElementById('password-admin-borrado').focus();
        }
    } catch (error) {
        mostrarNotificacion("Error de conexión al validar la seguridad.", "error");
    } finally {
        btnConfirmar.disabled = false;
        btnConfirmar.innerHTML = '<i class="bi bi-trash-fill me-2"></i>Confirmar Eliminación';
    }
}