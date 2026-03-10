
/* =========================================================================
   MÓDULO 7: TERMINAL DE ESCÁNER (RELOJ Y LECTURA) - POR COMPAÑERO
   ========================================================================= */

// --- 1. RELOJ EN TIEMPO REAL ---
function actualizarRelojYFecha() {
    const reloj = document.getElementById('reloj-digital');
    const fechaDiv = document.getElementById('fecha-actual');
    
    // Seguro para que no de error en otras páginas
    if (!reloj || !fechaDiv) return; 

    const ahora = new Date();
    
    // FORMATO DE HORA (24H)
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');
    
    reloj.textContent = `${horas}:${minutos}:${segundos}`;
    
    // FORMATO DE FECHA EN ESPAÑOL
    const opcionesFecha = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    let fechaFormateada = ahora.toLocaleDateString('es-ES', opcionesFecha);
    
    // Mostrar fecha
    fechaDiv.textContent = fechaFormateada;
}

if (document.getElementById('reloj-digital')) {
    // Ejecutar inmediatamente al cargar y luego cada 1 segundo (1000ms)
    actualizarRelojYFecha();
    setInterval(actualizarRelojYFecha, 1000);

    // Asegurar que el input del escáner siempre tenga el foco
    document.addEventListener('click', function() {
        const inputScanner = document.getElementById('codigo_tarjeta');
        if (inputScanner) inputScanner.focus();
    });
}

// --- 2. LECTURA POR CÁMARA WEB ---
let html5QrcodeScanner = null;

function toggleCamaraEscaner() {
    const container = document.getElementById('reader-container');
    const btn = document.getElementById('btnToggleCamara');

    if (container.style.display === 'none') {
        container.style.display = 'block';
        btn.innerHTML = '<i class="bi bi-camera-video-off me-2"></i> Apagar Cámara';
        btn.classList.replace('btn-outline-secondary', 'btn-outline-danger');

        html5QrcodeScanner = new Html5QrcodeScanner(
            "reader", 
            { fps: 10, qrbox: {width: 350, height: 150}, formatsToSupport: [ Html5QrcodeSupportedFormats.CODE_128 ] }, 
            false
        );

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
    inputCodigo.value = decodedText;
    
    const formEscaner = document.getElementById('form_marcar_asistencia');
    formEscaner.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

    html5QrcodeScanner.pause();
    setTimeout(() => {
        if(html5QrcodeScanner && html5QrcodeScanner.getState() === Html5QrcodeScannerState.PAUSED){
            html5QrcodeScanner.resume();
        }
    }, 3000);
}

function onScanFailure(error) {
    // Ignoramos los errores de frame vacío
}

// --- 3. GATILLO DEL FORMULARIO (Pistola Física y Webcam) ---
const formEscaner = document.getElementById('form_marcar_asistencia');
if (formEscaner) {
    formEscaner.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const inputCodigo = document.getElementById('codigo_tarjeta');
        const tipoSeleccionado = document.querySelector('input[name="tipo_marca"]:checked').value;
        const alerta = document.getElementById('alertaAsistencia');

        const codigo = inputCodigo.value.trim();
        if(!codigo) return;

        alerta.style.display = 'none';
        
        const res = await apiAsistencia.registrarMarca(codigo, tipoSeleccionado);

        alerta.style.display = 'block';
        if (res.status === 1) {
            alerta.className = 'alert alert-success fw-bold p-3 mt-4 text-start fs-5 shadow-sm border-0';
            alerta.innerHTML = `<i class="bi bi-check-circle-fill me-2 fs-3 align-middle"></i> ${res.message}`;
        } else {
            alerta.className = 'alert alert-danger fw-bold p-3 mt-4 text-start fs-5 shadow-sm border-0';
            alerta.innerHTML = `<i class="bi bi-x-circle-fill me-2 fs-3 align-middle"></i> ${res.message}`;
        }

        inputCodigo.value = '';
        inputCodigo.focus();

        setTimeout(() => { alerta.style.display = 'none'; }, 4000);
    });
}
