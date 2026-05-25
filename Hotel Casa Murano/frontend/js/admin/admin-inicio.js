// ============================================================
// INICIO — BIENVENIDA
// ============================================================

async function cargarBienvenida() {
  const res = await apiGet('bienvenida');
  if (res.success && res.datos.length > 0) {
    const d = res.datos[0];
    document.getElementById('bienvenida-titulo').value = d.titulo || '';
    document.getElementById('bienvenida-descripcion').value = d.descripcion || '';
    document.getElementById('bienvenida-imagen').value = d.imagen || '';
    if (d.imagen) {
      const p = document.getElementById('bienvenida-img-preview');
      p.style.display = 'flex';
      p.querySelector('img').src = d.imagen;
      document.getElementById('bienvenida-img-nombre').textContent = d.imagen.split('/').pop();
    }
  }
  configurarUpload('bienvenida-img-input', 'bienvenida-img-preview', 'bienvenida-img-nombre', 'bienvenida-imagen');
}

async function guardarBienvenida() {
  const data = {
    titulo: document.getElementById('bienvenida-titulo').value,
    descripcion: document.getElementById('bienvenida-descripcion').value,
    imagen: document.getElementById('bienvenida-imagen').value
  };
  const res = await apiGet('bienvenida');
  let r;
  if (res.success && res.datos.length > 0) {
    r = await apiPut('bienvenida', res.datos[0].id, data);
  } else {
    r = await apiPost('bienvenida', data);
  }
  if (r.success) toast('Bienvenida guardada', 'exito');
  else toast('Error al guardar', 'error');
}

// ============================================================
// INICIO — SLIDER
// ============================================================

async function cargarSlider() {
  const tbody = document.getElementById('slider-body');
  mostrarCargando(tbody);
  const res = await apiGet('slider_inicio');
  if (!res.success) { tbody.innerHTML = '<tr><td colspan="5" class="vacio">Error al cargar</td></tr>'; return; }
  if (res.datos.length === 0) { tbody.innerHTML = '<tr><td colspan="5" class="vacio">Sin slides</td></tr>'; return; }
  tbody.innerHTML = res.datos.map(s => `
    <tr>
      <td>${s.imagen ? `<img src="${s.imagen}" class="imagen-tabla">` : '—'}</td>
      <td>${s.titulo || '—'}</td>
      <td>${s.orden_slider || '—'}</td>
      <td><span class="badge ${s.activo ? 'badge-activo' : 'badge-inactivo'}">${s.activo ? 'Activo' : 'Inactivo'}</span></td>
      <td class="td-acciones">
        <div class="acciones">
          <button class="btn-accion editar" onclick="editarSlider(${s.id})" title="Editar">
            <svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
          </button>
          <button class="btn-accion eliminar" onclick="eliminarSlider(${s.id})" title="Eliminar">
            <svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  configurarUpload('slider-img-input', 'slider-img-preview', 'slider-img-nombre', 'slider-imagen');
}

function abrirFormSlider(data) {
  document.getElementById('form-slider').style.display = 'block';
  if (data) {
    document.getElementById('slider-form-titulo').textContent = 'Editar Slide';
    document.getElementById('slider-id').value = data.id;
    document.getElementById('slider-titulo').value = data.titulo || '';
    document.getElementById('slider-descripcion').value = data.descripcion || '';
    document.getElementById('slider-orden').value = data.orden_slider || 1;
    document.getElementById('slider-activo').value = data.activo !== undefined ? data.activo : 1;
    document.getElementById('slider-imagen').value = data.imagen || '';
    if (data.imagen) {
      document.getElementById('slider-img-preview').style.display = 'flex';
      document.getElementById('slider-img-preview').querySelector('img').src = data.imagen;
      document.getElementById('slider-img-nombre').textContent = data.imagen.split('/').pop();
    }
  } else {
    document.getElementById('slider-form-titulo').textContent = 'Nuevo Slide';
    document.getElementById('slider-id').value = '';
    document.getElementById('slider-titulo').value = '';
    document.getElementById('slider-descripcion').value = '';
    document.getElementById('slider-orden').value = '1';
    document.getElementById('slider-activo').value = '1';
    document.getElementById('slider-imagen').value = '';
    document.getElementById('slider-img-preview').style.display = 'none';
  }
  document.getElementById('form-slider').scrollIntoView({ behavior: 'smooth' });
}

function cerrarFormSlider() {
  document.getElementById('form-slider').style.display = 'none';
}

async function guardarSlider() {
  const id = document.getElementById('slider-id').value;
  const data = {
    titulo: document.getElementById('slider-titulo').value,
    descripcion: document.getElementById('slider-descripcion').value,
    imagen: document.getElementById('slider-imagen').value,
    orden_slider: parseInt(document.getElementById('slider-orden').value) || 1,
    activo: parseInt(document.getElementById('slider-activo').value)
  };
  if (!data.titulo || !data.imagen) { toast('Título e imagen son requeridos', 'error'); return; }
  const r = id ? await apiPut('slider_inicio', id, data) : await apiPost('slider_inicio', data);
  if (r.success) { toast('Slide guardado', 'exito'); cerrarFormSlider(); cargarSlider(); }
  else toast('Error al guardar slide', 'error');
}

async function editarSlider(id) {
  const res = await apiGet('slider_inicio', id);
  if (res.success) abrirFormSlider(res.dato);
}

function eliminarSlider(id) {
  abrirModalConfirmar('¿Eliminar este slide del banner?', async () => {
    const r = await apiDelete('slider_inicio', id);
    if (r.success) { toast('Slide eliminado', 'exito'); cargarSlider(); }
    else toast('Error al eliminar', 'error');
  });
}

// Init
cargarBienvenida();
cargarSlider();
