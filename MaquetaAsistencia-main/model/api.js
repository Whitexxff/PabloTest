/* =========================================================================
   CONSTANTES GLOBALES
   ========================================================================= */
const API_REQUEST_FAIL = 0;
const API_REQUEST_SUCCESS = 1;
/* =========================================================================
   API: LOGIN Y AUTENTICACIÓN
   ========================================================================= */
const validUser = async (username, password) => {
    if (username.trim().length > 0) {
        if (password.length > 0) { // CORRECCIÓN 3: Dejar pasar cualquier largo de clave al backend
            const request = await fetch("../../controller/login_controller.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username, // Sin encodeURIComponent, el JSON ya protege los datos
                    password: password
                })
            });

            if (!request.ok) return { status: API_REQUEST_FAIL, message: "Error en la solicitud" };
            return {
                status: API_REQUEST_SUCCESS,
                message: "Usuario válido",
                data: await request.json(),
            };
        } else {
            return { status: API_REQUEST_FAIL, message: "La contraseña no puede estar vacía" };
        }
    } else {
        return { status: API_REQUEST_FAIL, message: "El usuario está en blanco" };
    }
};  

/* =========================================================================
   FUNCIÓN CAZADORA DE ERRORES (Reutilizable para todos los módulos)
   ========================================================================= */
const procesarPeticion = async (url, opciones) => {
    try {
        const req = await fetch(url, opciones);
        const textoCrudo = await req.text(); // Atrapamos la respuesta cruda de PHP
        
        try {
            return JSON.parse(textoCrudo); // Intentamos convertirlo a JSON
        } catch (errorParseo) {
            // SI PHP DIO ERROR, CAEREMOS AQUÍ Y LO VEREMOS EN CONSOLA
            console.error("❌ ERROR EN PHP DETECTADO ❌");
            console.error("Lo que PHP devolvió realmente fue:", textoCrudo);
            return { status: 0, message: "Error interno del servidor. Revisa la consola (F12)." };
        }
    } catch (errorRed) {
        console.error("Error real de conexión:", errorRed);
        return { status: 0, message: "No se pudo conectar con el servidor." };
    }
};


/* =========================================================================
   API: GESTIÓN DE TURNOS
   ========================================================================= */
const apiTurnos = {
    baseUrl: '../../controller/turno_controller.php',

    getTurnos: async () => {
        return await procesarPeticion(`${apiTurnos.baseUrl}?action=getTurnos`, { method: 'GET' });
    },

    createTurno: async (datos) => {
        return await procesarPeticion(apiTurnos.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'createTurno', ...datos })
        });
    },

    updateTurno: async (datos) => {
        return await procesarPeticion(apiTurnos.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'updateTurno', ...datos })
        });
    },

    deleteTurno: async (id) => {
        return await procesarPeticion(apiTurnos.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteTurno', id: id })
        });
    }
};

/* =========================================================================
   API: GESTIÓN DE FUNCIONARIOS
   ========================================================================= */
const apiFuncionarios = {
    baseUrl: '../../controller/funcionario_controller.php',

    getFuncionarios: async () => {
        return await procesarPeticion(`${apiFuncionarios.baseUrl}?action=getFuncionarios`, { method: 'GET' });
    },

    createFuncionario: async (datos) => {
        return await procesarPeticion(apiFuncionarios.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'createFuncionario', ...datos })
        });
    },

    updateFuncionario: async (datos) => {
        return await procesarPeticion(apiFuncionarios.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'updateFuncionario', ...datos })
        });
    },

    deleteFuncionario: async (rut) => {
        return await procesarPeticion(apiFuncionarios.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteFuncionario', rut: rut })
        });
    }
};
/* =========================================================================
   API: ASISTENCIA (Para el Escáner y el Calendario)
   ========================================================================= */
const apiAsistencia = {
    baseUrl: '../../controller/asistencia_controller.php',

    // Para la VistaAsistencia.php (Cargar el mes de un funcionario en el calendario)
    obtenerAsistenciaMes: async (rut, mes, anio) => {
        const request = await procesarPeticion(`${apiAsistencia.baseUrl}?action=getAsistencia&rut=${rut}&mes=${mes}&anio=${anio}`, { method: 'GET' });
        return request; 
    },

    // Para la VistaEscaner.php (Cuando la pistola lee el código de barras y selecciona Entrada/Salida)
    registrarMarca: async (codigoLector, tipoSeleccionado) => {
        return await procesarPeticion(apiAsistencia.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                action: 'registrarMarca', 
                codigo: codigoLector, 
                tipo: tipoSeleccionado 
            })
        });
    }
};
/* =========================================================================
   API: GESTIÓN DE SECCIONES
   ========================================================================= */
const apiSecciones = {
    baseUrl: '../../controller/seccion_controller.php',

    getSecciones: async () => {
        return await procesarPeticion(`${apiSecciones.baseUrl}?action=getSecciones`, { method: 'GET' });
    },

    createSeccion: async (nombre) => {
        return await procesarPeticion(apiSecciones.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'createSeccion', nombre: nombre })
        });
    },

    updateSeccion: async (id, nombre) => {
        return await procesarPeticion(apiSecciones.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'updateSeccion', id: id, nombre: nombre })
        });
    },

    deleteSeccion: async (id) => {
        return await procesarPeticion(apiSecciones.baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteSeccion', id: id })
        });
    }
};
/* 
-------------------------------------------------------------
        api Gestion Usuarios
------------------------------------------------------------- */
const apiUsuarios = {
    baseUrl: '../../controller/usuario_controller.php',

    getUsuarios: async () => await procesarPeticion(`${apiUsuarios.baseUrl}?action=getUsuarios`, { method: 'GET' }),
    
    createUsuario: async (datos) => await procesarPeticion(apiUsuarios.baseUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'createUsuario', ...datos })
    }),
    
    updateUsuario: async (datos) => await procesarPeticion(apiUsuarios.baseUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateUsuario', ...datos })
    }),
    
    deleteUsuario: async (id) => await procesarPeticion(apiUsuarios.baseUrl, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteUsuario', id: id })
    })
};
/* =========================================================================
   API: DASHBOARD (Panel de Inicio)
   ========================================================================= */
const apiDashboard = {
    baseUrl: '../../controller/dashboard_controller.php',

    getStats: async () => {
        return await procesarPeticion(`${apiDashboard.baseUrl}?action=getStats`, { method: 'GET' });
    }
};
