// ============================================================
// GALERÍA
// ============================================================

async function cargarGaleria() {
  const grid = document.getElementById('galeria-grid');
  mostrarCargando(grid);
  const res = await apiGet('galeria');
  if (!res.success || res.datos.length === 0) {
    grid.innerHTML = '<div class="msj-vacio" style="grid-column:1/-1"><svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg><p>No hay imágenes en la galería</p></div>';
    return;
  }
  grid.innerHTML = res.datos.map(g => `
    <div class="admin-galeria-item">
      <img src="${g.imagen}" alt="${g.titulo || ''}">
      <div class="overlay">
        <span>${g.titulo || '—'}</span>
        <button class="btn-accion eliminar" onclick="eliminarGaleria(${g.id})" title="Eliminar" style="color:#fff">
          <svg viewBox="0 0 24 24" fill="white"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>
    </div>
  `).join('');
  configurarUploadGaleria();
}

function configurarUploadGaleria() {
  const input = document.getElementById('galeria-img-input');
  const preview = document.getElementById('galeria-img-preview');
  const nombreEl = document.getElementById('galeria-img-nombre');
  if (!input) return;

  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const res = await subirArchivo(file);
    if (res.success) {
      preview.style.display = 'flex';
      preview.querySelector('img').src = res.ruta;
      nombreEl.textContent = file.name;
    } else {
      toast('Error al subir la imagen', 'error');
    }
  });
}

async function subirGaleria() {
  const input = document.getElementById('galeria-img-input');
  const titulo = document.getElementById('galeria-titulo').value;
  const file = input.files[0];
  if (!file) { toast('Selecciona una imagen', 'error'); return; }
  const uploadRes = await subirArchivo(file);
  if (!uploadRes.success) { toast('Error al subir imagen', 'error'); return; }
  const r = await apiPost('galeria', { titulo: titulo || 'Sin título', imagen: uploadRes.ruta });
  if (r.success) {
    toast('Imagen subida', 'exito');
    document.getElementById('galeria-titulo').value = '';
    input.value = '';
    document.getElementById('galeria-img-preview').style.display = 'none';
    cargarGaleria();
  } else {
    toast('Error al guardar', 'error');
  }
}

function eliminarGaleria(id) {
  abrirModalConfirmar('¿Eliminar esta imagen de la galería?', async () => {
    const r = await apiDelete('galeria', id);
    if (r.success) { toast('Imagen eliminada', 'exito'); cargarGaleria(); }
    else toast('Error al eliminar', 'error');
  });
}

// Init
cargarGaleria();
