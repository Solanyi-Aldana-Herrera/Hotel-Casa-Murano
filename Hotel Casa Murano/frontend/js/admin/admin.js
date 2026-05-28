const API = 'http://localhost:3000';

function salir() {
    window.location.replace('/frontend/index.html');
}

// ============================================================
// SCRIPTS CARGADOS (evita recargar)
// ============================================================
const scriptsCargados = new Set();

function cargarScript(url) {
    return new Promise((resolve, reject) => {
        if (scriptsCargados.has(url)) { resolve(); return; }
        const s = document.createElement('script');
        s.src = url;
        s.onload = () => { scriptsCargados.add(url); resolve(); };
        s.onerror = reject;
        document.body.appendChild(s);
    });
}

// ============================================================
// NAVEGACIÓN POR SECCIONES
// ============================================================

async function cargarSeccion(id) {

    document.querySelectorAll('.sidebar button').forEach(b => b.style.background = '');
    const btn = document.querySelector(`.sidebar button[data-sec="${id}"]`);
    if (btn) btn.style.background = 'var(--gold)';

    const panel = document.getElementById('panel-contenido');
    panel.innerHTML = '<div class="msj-cargando"><div class="spinner"></div><p>Cargando...</p></div>';

    window.location.hash = id;

    try {
        const htmlResp = await fetch(`/frontend/pages/admin/${id}.html`);
        panel.innerHTML = await htmlResp.text();
        await cargarScript(`/frontend/js/admin/admin-${id}.js`);
    } catch (e) {
        console.error(e);
        panel.innerHTML = '<div class="msj-vacio"><p>Error al cargar la sección</p></div>';
    }
}

// Cargar sección inicial según hash o por defecto
window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash.replace('#', '');
    const secciones = ['inicio','nosotros','habitaciones','servicios','galeria','contacto','reservas'];
    const seccion = secciones.includes(hash) ? hash : 'inicio';
    cargarSeccion(seccion);
});

// ============================================================
// TOAST / NOTIFICACIÓN
// ============================================================

function toast(msg, tipo) {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast ' + tipo;
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
}

// ============================================================
// MODAL CONFIRMAR
// ============================================================

let confirmCallback = null;

function abrirModalConfirmar(msg, cb) {
    document.getElementById('modal-confirmar-msg').textContent = msg;
    document.getElementById('modal-confirmar').classList.add('mostrar');
    confirmCallback = cb;
}

function cerrarModalConfirmar() {
    document.getElementById('modal-confirmar').classList.remove('mostrar');
    confirmCallback = null;
}

document.addEventListener('click', (e) => {
    if (e.target.closest('#modal-confirmar-btn') && confirmCallback) {
        confirmCallback();
        cerrarModalConfirmar();
    }
});

// ============================================================
// FETCH HELPERS
// ============================================================

async function apiGet(tabla, id) {
    const url = id ? `${API}/api/${tabla}/${id}` : `${API}/api/${tabla}`;
    const r = await fetch(url);
    return r.json();
}

async function apiPost(tabla, data) {
    const r = await fetch(`${API}/api/${tabla}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    return r.json();
}

async function apiPut(tabla, id, data) {
    const r = await fetch(`${API}/api/${tabla}/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    return r.json();
}

async function apiDelete(tabla, id) {
    const r = await fetch(`${API}/api/${tabla}/${id}`, { method: 'DELETE' });
    return r.json();
}

async function subirArchivo(file) {
    const fd = new FormData();
    fd.append('imagen', file);
    const r = await fetch(`${API}/api/upload`, { method: 'POST', body: fd });
    return r.json();
}

function configurarUpload(inputId, previewId, nombreId, hiddenId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    const nombreEl = document.getElementById(nombreId);
    const hidden = document.getElementById(hiddenId);
    if (!input) return;

    input.addEventListener('change', async () => {
        const file = input.files[0];
        if (!file) return;

        // Mostrar preview local inmediatamente
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.style.display = 'flex';
            preview.querySelector('img').src = e.target.result;
            nombreEl.textContent = file.name;
            hidden.value = '';
        };
        reader.readAsDataURL(file);

        // Subir al servidor en segundo plano
        const res = await subirArchivo(file);
        if (res.success) {
            preview.querySelector('img').src = res.ruta;
            hidden.value = res.ruta;
        } else {
            toast('Error al subir la imagen al servidor', 'error');
        }
    });
}

function mostrarCargando(el) {
    el.innerHTML = '<div class="msj-cargando"><div class="spinner"></div><p>Cargando...</p></div>';
}

function filtrarTabla(seccion) {
    const input = document.getElementById(seccion + '-buscar');
    if (!input) return;
    const filtro = input.value.toLowerCase();
    const tabla = document.getElementById('tabla-' + seccion);
    if (!tabla) return;
    const filas = tabla.querySelectorAll('tbody tr');
    filas.forEach(row => {
        if (row.querySelector('.vacio')) return;
        const texto = row.textContent.toLowerCase();
        row.style.display = texto.includes(filtro) ? '' : 'none';
    });
}
