// ============================================================
// NOSOTROS
// ============================================================

async function cargarNosotros() {
  const res = await apiGet('nosotros');
  if (res.success && res.datos.length > 0) {
    const d = res.datos[0];
    document.getElementById('nosotros-titulo').value = d.titulo || '';
    document.getElementById('nosotros-descripcion').value = d.descripcion || '';
    document.getElementById('nosotros-imagen').value = d.imagen || '';
    if (d.imagen) {
      document.getElementById('nosotros-img-preview').style.display = 'flex';
      document.getElementById('nosotros-img-preview').querySelector('img').src = d.imagen;
      document.getElementById('nosotros-img-nombre').textContent = d.imagen.split('/').pop();
    }
  }
  configurarUpload('nosotros-img-input', 'nosotros-img-preview', 'nosotros-img-nombre', 'nosotros-imagen');
}

async function guardarNosotros() {
  const data = {
    titulo: document.getElementById('nosotros-titulo').value,
    descripcion: document.getElementById('nosotros-descripcion').value,
    imagen: document.getElementById('nosotros-imagen').value
  };
  const res = await apiGet('nosotros');
  let r;
  if (res.success && res.datos.length > 0) {
    r = await apiPut('nosotros', res.datos[0].id, data);
  } else {
    r = await apiPost('nosotros', data);
  }
  if (r.success) toast('Información guardada', 'exito');
  else toast('Error al guardar', 'error');
}

// ============================================================
// NOSOTROS — ICONOS
// ============================================================

async function cargarIconos() {
  const lista = document.getElementById('iconos-lista');
  mostrarCargando(lista);
  const res = await apiGet('iconos_nosotros');
  if (!res.success || res.datos.length === 0) {
    lista.innerHTML = '<div class="msj-vacio"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg><p>Sin iconos registrados</p></div>';
    return;
  }
  lista.innerHTML = res.datos.map(i => `
    <div class="admin-card">
      <div class="card-body">
        <h3>${i.nombre || '—'}</h3>
        <p><strong>Icono:</strong> ${i.icono || '—'}</p>
        <p>${i.descripcion || ''}</p>
      </div>
      <div class="card-acciones">
        <button class="btn-accion editar" onclick="editarIcono(${i.id})" title="Editar">
          <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        </button>
        <button class="btn-accion eliminar" onclick="eliminarIcono(${i.id})" title="Eliminar">
          <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>
    </div>
  `).join('');
}

function abrirFormIcono(data) {
  document.getElementById('form-icono').style.display = 'block';
  if (data) {
    document.getElementById('icono-form-titulo').textContent = 'Editar Icono';
    document.getElementById('icono-id').value = data.id;
    document.getElementById('icono-nombre').value = data.nombre || '';
    document.getElementById('icono-icono').value = data.icono || '';
    document.getElementById('icono-descripcion').value = data.descripcion || '';
  } else {
    document.getElementById('icono-form-titulo').textContent = 'Nuevo Icono';
    document.getElementById('icono-id').value = '';
    document.getElementById('icono-nombre').value = '';
    document.getElementById('icono-icono').value = '';
    document.getElementById('icono-descripcion').value = '';
  }
  document.getElementById('form-icono').scrollIntoView({ behavior: 'smooth' });
}

function cerrarFormIcono() {
  document.getElementById('form-icono').style.display = 'none';
}

async function guardarIcono() {
  const id = document.getElementById('icono-id').value;
  const data = {
    nombre: document.getElementById('icono-nombre').value,
    icono: document.getElementById('icono-icono').value,
    descripcion: document.getElementById('icono-descripcion').value
  };
  if (!data.nombre) { toast('El nombre es requerido', 'error'); return; }
  const r = id ? await apiPut('iconos_nosotros', id, data) : await apiPost('iconos_nosotros', data);
  if (r.success) { toast('Icono guardado', 'exito'); cerrarFormIcono(); cargarIconos(); }
  else toast('Error al guardar', 'error');
}

async function editarIcono(id) {
  const res = await apiGet('iconos_nosotros', id);
  if (res.success) abrirFormIcono(res.dato);
}

function eliminarIcono(id) {
  abrirModalConfirmar('¿Eliminar este icono?', async () => {
    const r = await apiDelete('iconos_nosotros', id);
    if (r.success) { toast('Icono eliminado', 'exito'); cargarIconos(); }
    else toast('Error al eliminar', 'error');
  });
}

// Init
cargarNosotros();
cargarIconos();
