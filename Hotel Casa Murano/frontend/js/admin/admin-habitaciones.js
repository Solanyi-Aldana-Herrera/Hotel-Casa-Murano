// ============================================================
// HABITACIONES
// ============================================================

async function cargarHabitaciones() {
  const tbody = document.getElementById('habitaciones-body');
  mostrarCargando(tbody);
  const res = await apiGet('habitaciones');
  if (!res.success) { tbody.innerHTML = '<tr><td colspan="6" class="vacio">Error al cargar</td></tr>'; return; }
  if (res.datos.length === 0) { tbody.innerHTML = '<tr><td colspan="6" class="vacio">Sin habitaciones</td></tr>'; return; }
  tbody.innerHTML = res.datos.map(h => `
    <tr>
      <td>${h.imagen ? `<img src="${h.imagen}" class="imagen-tabla">` : '—'}</td>
      <td>${h.nombre || '—'}</td>
      <td class="precio-tabla">${h.precio ? '$' + parseFloat(h.precio).toLocaleString('es-CO', {minimumFractionDigits:0}) : '—'}</td>
      <td>${h.capacidad || '—'} pers.</td>
      <td><span class="badge ${h.estado ? 'badge-activo' : 'badge-inactivo'}">${h.estado ? 'Disponible' : 'No disponible'}</span></td>
      <td class="td-acciones">
        <div class="acciones">
          <button class="btn-accion editar" onclick="editarHabitacion(${h.id})" title="Editar">
            <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          </button>
          <button class="btn-accion eliminar" onclick="eliminarHabitacion(${h.id})" title="Eliminar">
            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  configurarUpload('habitacion-img-input', 'habitacion-img-preview', 'habitacion-img-nombre', 'habitacion-imagen');
}

function abrirFormHabitacion(data) {
  document.getElementById('form-habitacion').style.display = 'block';
  if (data) {
    document.getElementById('habitacion-form-titulo').textContent = 'Editar Habitación';
    document.getElementById('habitacion-id').value = data.id;
    document.getElementById('habitacion-nombre').value = data.nombre || '';
    document.getElementById('habitacion-descripcion').value = data.descripcion || '';
    document.getElementById('habitacion-precio').value = data.precio || '';
    document.getElementById('habitacion-capacidad').value = data.capacidad || '';
    document.getElementById('habitacion-estado').value = data.estado !== undefined ? data.estado : 1;
    document.getElementById('habitacion-imagen').value = data.imagen || '';
    if (data.imagen) {
      document.getElementById('habitacion-img-preview').style.display = 'flex';
      document.getElementById('habitacion-img-preview').querySelector('img').src = data.imagen;
      document.getElementById('habitacion-img-nombre').textContent = data.imagen.split('/').pop();
    }
  } else {
    document.getElementById('habitacion-form-titulo').textContent = 'Nueva Habitación';
    document.getElementById('habitacion-id').value = '';
    document.getElementById('habitacion-nombre').value = '';
    document.getElementById('habitacion-descripcion').value = '';
    document.getElementById('habitacion-precio').value = '';
    document.getElementById('habitacion-capacidad').value = '';
    document.getElementById('habitacion-estado').value = '1';
    document.getElementById('habitacion-imagen').value = '';
    document.getElementById('habitacion-img-preview').style.display = 'none';
  }
  document.getElementById('form-habitacion').scrollIntoView({ behavior: 'smooth' });
}

function cerrarFormHabitacion() {
  document.getElementById('form-habitacion').style.display = 'none';
}

async function guardarHabitacion() {
  const id = document.getElementById('habitacion-id').value;
  const data = {
    nombre: document.getElementById('habitacion-nombre').value,
    descripcion: document.getElementById('habitacion-descripcion').value,
    precio: parseFloat(document.getElementById('habitacion-precio').value) || 0,
    capacidad: parseInt(document.getElementById('habitacion-capacidad').value) || 0,
    imagen: document.getElementById('habitacion-imagen').value,
    estado: parseInt(document.getElementById('habitacion-estado').value)
  };
  if (!data.nombre) { toast('El nombre es requerido', 'error'); return; }
  const r = id ? await apiPut('habitaciones', id, data) : await apiPost('habitaciones', data);
  if (r.success) { toast('Habitación guardada', 'exito'); cerrarFormHabitacion(); cargarHabitaciones(); }
  else toast('Error al guardar', 'error');
}

async function editarHabitacion(id) {
  const res = await apiGet('habitaciones', id);
  if (res.success) abrirFormHabitacion(res.dato);
}

function eliminarHabitacion(id) {
  abrirModalConfirmar('¿Eliminar esta habitación?', async () => {
    const r = await apiDelete('habitaciones', id);
    if (r.success) { toast('Habitación eliminada', 'exito'); cargarHabitaciones(); }
    else toast('Error al eliminar', 'error');
  });
}

// Init
cargarHabitaciones();
