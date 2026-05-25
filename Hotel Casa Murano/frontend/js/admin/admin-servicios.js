// ============================================================
// SERVICIOS
// ============================================================

async function cargarServicios() {
  const lista = document.getElementById('servicios-lista');
  mostrarCargando(lista);
  const res = await apiGet('servicios');
  if (!res.success || res.datos.length === 0) {
    lista.innerHTML = '<div class="msj-vacio"><svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg><p>Sin servicios registrados</p></div>';
    return;
  }
  lista.innerHTML = res.datos.map(s => `
    <div class="admin-card">
      ${s.imagen ? `<img src="${s.imagen}" alt="${s.nombre}">` : ''}
      <div class="card-body">
        <h3>${s.nombre || '—'}</h3>
        <p>${s.descripcion || ''}</p>
      </div>
      <div class="card-acciones">
        <button class="btn-accion editar" onclick="editarServicio(${s.id})" title="Editar">
          <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        </button>
        <button class="btn-accion eliminar" onclick="eliminarServicio(${s.id})" title="Eliminar">
          <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>
    </div>
  `).join('');
  configurarUpload('servicio-img-input', 'servicio-img-preview', 'servicio-img-nombre', 'servicio-imagen');
}

function abrirFormServicio(data) {
  document.getElementById('form-servicio').style.display = 'block';
  if (data) {
    document.getElementById('servicio-form-titulo').textContent = 'Editar Servicio';
    document.getElementById('servicio-id').value = data.id;
    document.getElementById('servicio-nombre').value = data.nombre || '';
    document.getElementById('servicio-descripcion').value = data.descripcion || '';
    document.getElementById('servicio-imagen').value = data.imagen || '';
    if (data.imagen) {
      document.getElementById('servicio-img-preview').style.display = 'flex';
      document.getElementById('servicio-img-preview').querySelector('img').src = data.imagen;
      document.getElementById('servicio-img-nombre').textContent = data.imagen.split('/').pop();
    }
  } else {
    document.getElementById('servicio-form-titulo').textContent = 'Nuevo Servicio';
    document.getElementById('servicio-id').value = '';
    document.getElementById('servicio-nombre').value = '';
    document.getElementById('servicio-descripcion').value = '';
    document.getElementById('servicio-imagen').value = '';
    document.getElementById('servicio-img-preview').style.display = 'none';
  }
  document.getElementById('form-servicio').scrollIntoView({ behavior: 'smooth' });
}

function cerrarFormServicio() {
  document.getElementById('form-servicio').style.display = 'none';
}

async function guardarServicio() {
  const id = document.getElementById('servicio-id').value;
  const data = {
    nombre: document.getElementById('servicio-nombre').value,
    descripcion: document.getElementById('servicio-descripcion').value,
    imagen: document.getElementById('servicio-imagen').value
  };
  if (!data.nombre) { toast('El nombre es requerido', 'error'); return; }
  const r = id ? await apiPut('servicios', id, data) : await apiPost('servicios', data);
  if (r.success) { toast('Servicio guardado', 'exito'); cerrarFormServicio(); cargarServicios(); }
  else toast('Error al guardar', 'error');
}

async function editarServicio(id) {
  const res = await apiGet('servicios', id);
  if (res.success) abrirFormServicio(res.dato);
}

function eliminarServicio(id) {
  abrirModalConfirmar('¿Eliminar este servicio?', async () => {
    const r = await apiDelete('servicios', id);
    if (r.success) { toast('Servicio eliminado', 'exito'); cargarServicios(); }
    else toast('Error al eliminar', 'error');
  });
}

// Init
cargarServicios();
