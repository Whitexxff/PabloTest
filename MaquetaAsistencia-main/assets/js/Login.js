
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
