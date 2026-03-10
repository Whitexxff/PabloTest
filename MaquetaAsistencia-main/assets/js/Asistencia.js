/* =========================================================================
   MÓDULO 4: FUNCIONARIOS Y ASISTENCIA (CALENDARIO Y POPUP SEGURO)
   ========================================================================= */

// Objeto global seguro para guardar los datos y fotos sin romper el HTML
window.calendarioData = window.calendarioData || {};

async function cargarListaFuncionarios() {
    const contenedor = document.getElementById('contenedor-funcionarios');
    if (!contenedor) return;

    try {
        const res = await apiFuncionarios.getFuncionarios();
        const resSecciones = await apiSecciones.getSecciones();
        const resTurnos = await apiTurnos.getTurnos();
        contenedor.innerHTML = '';

        if (res.status === 1 && res.data && res.data.length > 0) {
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

                contenedor.innerHTML += `
                <div class="list-group-item p-0 funcionario-item border-start-danger shadow-sm mb-2 rounded">
                    <div class="row m-0 align-items-center py-3 px-3 bg-white fila-visible cursor-pointer" onclick="abrirPanelFuncionario('${safeId}', '${f.rut}', 'calendario', event)">
                        <div class="col-12 col-lg-2 ps-lg-3 mb-2 mb-lg-0 fw-semibold text-muted font-monospace">${formatearRUT(f.rut)}</div>
                        <div class="col-12 col-lg-3 mb-2 mb-lg-0 text-black fw-bold text-truncate"><i class="bi bi-person-circle me-2 text-secondary"></i>${f.nombre} ${f.apellidoP}</div>
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
                        <div class="p-3 p-md-4 p-xl-5">
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
            });
        } else {
            contenedor.innerHTML = '<div class="alert alert-warning text-center fw-bold shadow-sm p-4 m-3 fs-5">No hay funcionarios registrados.</div>';
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

    if (contenedor) contenedor.innerHTML = '<div class="text-center py-5 my-5"><div class="spinner-border text-danger-yb" role="status"></div><p class="mt-2 text-muted fw-bold">Consultando asistencia...</p></div>';

    try {
        const req = await fetch(`../../controller/asistencia_controller.php?action=getAsistencia&rut=${rutReal}&mes=${mes}&anio=${año}`);
        const res = await req.json();
        const datosMes = res.status === 1 ? res.data : {};
        
        // ¡LA MAGIA! Guardamos los datos en la memoria asociados a este trabajador específico
        window.calendarioData[safeId] = datosMes;
        
        dibujarCalendarioSimple(safeId, rutReal, fecha, datosMes);
    } catch (e) {
        console.error("Error al cargar Calendario:", e);
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

        if (infoDia) {
            if (infoDia.estado === 'licencia') {
                bgClass = 'cal-day-licencia';
                contenidoCelda = `
                    <div class="p-1 w-100 d-flex flex-column h-100 text-center justify-content-center">
                        <div class="fw-bold fs-6 mb-1">${dia}</div>
                        <div class="fw-bold" style="font-size: 0.7rem;"><i class="bi bi-bandaid"></i><br>Licencia</div>
                    </div>`;
            } else if (infoDia.estado === 'vacaciones') {
                bgClass = 'cal-day-vacaciones';
                contenidoCelda = `
                    <div class="p-1 w-100 d-flex flex-column h-100 text-center justify-content-center">
                        <div class="fw-bold fs-6 mb-1">${dia}</div>
                        <div class="fw-bold" style="font-size: 0.7rem;"><i class="bi bi-airplane"></i><br>Feriado</div>
                    </div>`;
            } else if (infoDia.estado === 'falta') {
                bgClass = 'dia-danger'; 
                contenidoCelda = `
                    <div class="p-1 w-100 d-flex flex-column h-100 text-center justify-content-center">
                        <div class="fw-bold fs-6 mb-1">${dia}</div>
                        <div class="fw-bold text-danger" style="font-size: 0.7rem;"><i class="bi bi-x-circle"></i><br>Ausente</div>
                    </div>`;
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
        
        // ENLACE CORREGIDO: Le enviamos el safeId para que busque los datos exactos en memoria
        htmlCalendario += `<div class="cal-day-box rounded-3 ${bgClass}" style="min-height: 85px; cursor: pointer; transition: transform 0.2s;" title="Ver detalle del día" onclick="abrirModalDetalleDia('${safeId}', ${dia}, ${mes}, ${año})" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">${contenidoCelda}</div>`;
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
    seccionABorrarId = null;
    const modal = new bootstrap.Modal(document.getElementById('modalBorrar'));
    modal.show();
}

function generarReporteMensual(rutFuncionario) {
    const mesActual = fechaActualVisualizacion.getMonth() + 1;
    const anioActual = fechaActualVisualizacion.getFullYear();
    const url = `../../controller/reporte_controller.php?rut=${rutFuncionario}&mes=${mesActual}&anio=${anioActual}`;
    window.open(url, '_blank');
}

/* =========================================================================
   FUNCIONES NUEVAS: LICENCIAS Y POPUP DE DETALLE DEL DÍA
   ========================================================================= */
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

function abrirModalDetalleDia(safeId, dia, mes, año) {
    const modalEl = document.getElementById('modalDetalleDia');
    if (!modalEl) return;

    // MAGIA: Recuperamos los datos exactos usando la memoria sin saturar el HTML
    const datosDelMes = window.calendarioData[safeId] || {};
    const infoDia = datosDelMes[dia] || {};

    const estado = infoDia.estado || 'vacio';
    const entrada = infoDia.entrada || '--:--';
    const salida = infoDia.salida || '--:--';
    const extra = infoDia.extra || '00:00';
    const fotoEntrada = infoDia.foto_entrada || '';
    const fotoSalida = infoDia.foto_salida || '';

    // 1. Colocar la fecha
    document.getElementById('detalle_fecha').innerText = `${dia} de ${nombresMeses[mes]}, ${año}`;
    
    // 2. Colocar el Badge (Etiqueta de estado)
    const badge = document.getElementById('detalle_estado_badge');
    if (estado === 'verde') {
        badge.className = 'badge bg-success rounded-pill px-3 py-1 fs-6';
        badge.innerText = 'Asistencia Completa';
    } else if (estado === 'warning') {
        badge.className = 'badge bg-warning text-dark rounded-pill px-3 py-1 fs-6';
        badge.innerText = 'Asistencia Incompleta';
    } else if (estado === 'falta') {
        badge.className = 'badge bg-danger rounded-pill px-3 py-1 fs-6';
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

    // 3. Encender/Apagar las cajas de fotos redondas gigantes
    const cajaFotos = document.getElementById('detalle_caja_fotos');
    const imgE = document.getElementById('detalle_img_entrada');
    const imgS = document.getElementById('detalle_img_salida');
    const colE = document.getElementById('col_foto_entrada');
    const colS = document.getElementById('col_foto_salida');

    // Si existe al menos una foto (Base64 tiene miles de caracteres, filtramos por >50)
    if ((fotoEntrada && fotoEntrada.length > 50) || (fotoSalida && fotoSalida.length > 50)) {
        cajaFotos.classList.remove('d-none'); 
        
        if (fotoEntrada && fotoEntrada.length > 50) {
            imgE.src = fotoEntrada;
            colE.classList.remove('d-none');
        } else { colE.classList.add('d-none'); }

        if (fotoSalida && fotoSalida.length > 50) {
            imgS.src = fotoSalida;
            colS.classList.remove('d-none');
        } else { colS.classList.add('d-none'); }
    } else {
        cajaFotos.classList.add('d-none'); // Ocultar bloque completo si no hay fotos
    }

    // 4. Colocar las horas de entrada y salida
    document.getElementById('detalle_entrada').innerText = entrada;
    document.getElementById('detalle_salida').innerText = salida;

    // 5. Mostrar horas extras si es que hay
    const filaExtra = document.getElementById('fila_extra');
    if (extra && extra !== '00:00') {
        filaExtra.style.setProperty('display', 'flex', 'important');
        document.getElementById('detalle_extra').innerText = `+${extra} hrs`;
    } else {
        filaExtra.style.setProperty('display', 'none', 'important');
    }

    // 6. Abrir la ventana centrada
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.show();
}