// ============================================================
// INICIO — BIENVENIDA
// ============================================================

async function cargarBienvenida() {
  const res = await apiGet('bienvenida');
  if (res.success && res.datos.length > 0) {
    const d = res.datos[0];
    document.getElementById('bienvenida-titulo').value = d.titulo || '';
    document.getElementById('bienvenida-subtitulo').value = d.subtitulo || '';
    document.getElementById('bienvenida-descripcion').value = d.descripcion || '';
    document.getElementById('bienvenida-despedida').value = d.despedida || '';
    document.getElementById('bienvenida-imagen').value = d.imagen || '';
    if (d.imagen) {
      const p = document.getElementById('bienvenida-img-preview');
      p.style.display = 'flex';
      p.querySelector('img').src = d.imagen;
      document.getElementById('bienvenida-img-nombre').textContent = d.imagen.split('/').pop();
    }
  }
  configurarUpload('bienvenida-img-input', 'bienvenida-img-preview', 'bienvenida-img-nombre', 'bienvenida-imagen');
  configurarCarrusel();

  // Cargar imágenes existentes del carrusel
  const slidesRes = await apiGet('slider_inicio');
  if (slidesRes.success && slidesRes.datos.length > 0) {
    const activos = slidesRes.datos
      .filter(s => s.activo)
      .sort((a, b) => (a.orden_slider || 0) - (b.orden_slider || 0));
    activos.forEach(s => {
      const pos = s.orden_slider;
      if (pos >= 1 && pos <= 5) {
        const preview = document.getElementById('carrusel-preview-' + pos);
        const nombreEl = document.getElementById('carrusel-nombre-' + pos);
        const hidden = document.getElementById('carrusel-imagen-' + pos);
        if (preview && s.imagen) {
          preview.style.display = 'flex';
          preview.querySelector('img').src = s.imagen;
          nombreEl.textContent = s.imagen.split('/').pop();
          hidden.value = s.imagen;
        }
      }
    });
  }
}

async function guardarBienvenida() {
  const data = {
    titulo: document.getElementById('bienvenida-titulo').value,
    subtitulo: document.getElementById('bienvenida-subtitulo').value,
    descripcion: document.getElementById('bienvenida-descripcion').value,
    despedida: document.getElementById('bienvenida-despedida').value,
    imagen: document.getElementById('bienvenida-imagen').value
  };

  const res = await apiGet('bienvenida');
  let r;
  if (res.success && res.datos.length > 0) {
    r = await apiPut('bienvenida', res.datos[0].id, data);
  } else {
    r = await apiPost('bienvenida', data);
  }
  if (!r.success) { toast('Error al guardar bienvenida', 'error'); return; }

  // Eliminar todos los registros existentes del slider
  const slidesRes = await apiGet('slider_inicio');
  const existingSlides = slidesRes.success ? slidesRes.datos : [];

  if (existingSlides.length > 0) {
    for (const slide of existingSlides) {
      await apiDelete('slider_inicio', slide.id);
    }
  }

  // Procesar cada slot del carrusel (1-5)
  const slidesToSave = [];
  for (let i = 1; i <= 5; i++) {
    const fileInput = document.getElementById('carrusel-input-' + i);
    const hiddenInput = document.getElementById('carrusel-imagen-' + i);
    const file = fileInput ? fileInput.files[0] : null;

    if (file) {
      // Nueva imagen seleccionada — subir al servidor
      const uploadRes = await subirArchivo(file);
      if (uploadRes.success) {
        slidesToSave.push({ imagen: uploadRes.ruta, orden_slider: i });
      }
    } else if (hiddenInput && hiddenInput.value) {
      // Imagen existente conservada
      slidesToSave.push({ imagen: hiddenInput.value, orden_slider: i });
    }
    // Si no hay ni archivo ni valor oculto, no se guarda nada para esta posición
  }

  // Crear nuevos registros solo para las posiciones con imagen
  for (const slide of slidesToSave) {
    await apiPost('slider_inicio', {
      titulo: '',
      descripcion: '',
      imagen: slide.imagen,
      orden_slider: slide.orden_slider,
      activo: 1
    });
  }

  toast('Bienvenida guardada', 'exito');
}

// ============================================================
// CARRUSEL — CONFIGURACIÓN INDIVIDUAL POR SLOT
// ============================================================

function configurarCarrusel() {
  for (let i = 1; i <= 5; i++) {
    const input = document.getElementById('carrusel-input-' + i);
    if (!input) continue;

    const nuevoInput = input.cloneNode(true);
    input.parentNode.replaceChild(nuevoInput, input);

    // Usar closure para capturar el índice correcto
    nuevoInput.addEventListener('change', function(idx) {
      return function () {
        const file = this.files[0];
        if (!file) return;

        const preview = document.getElementById('carrusel-preview-' + idx);
        const nombreEl = document.getElementById('carrusel-nombre-' + idx);
        const hidden = document.getElementById('carrusel-imagen-' + idx);

        const reader = new FileReader();
        reader.onload = function (e) {
          preview.style.display = 'flex';
          preview.querySelector('img').src = e.target.result;
          nombreEl.textContent = file.name;
          // Limpiar el hidden al seleccionar una nueva imagen
          hidden.value = '';
        };
        reader.readAsDataURL(file);
      };
    }(i));
  }
}

// ============================================================
// CARRUSEL — QUITAR IMAGEN
// ============================================================

function removerCarruselImg(pos) {
  const preview = document.getElementById('carrusel-preview-' + pos);
  const nombreEl = document.getElementById('carrusel-nombre-' + pos);
  const hidden = document.getElementById('carrusel-imagen-' + pos);
  const input = document.getElementById('carrusel-input-' + pos);

  if (preview) {
    preview.style.display = 'none';
    preview.querySelector('img').src = '';
  }
  if (nombreEl) nombreEl.textContent = '';
  if (hidden) hidden.value = '';
  if (input) input.value = '';
}

// ============================================================
// BIENVENIDA — QUITAR IMAGEN
// ============================================================

function removerBienvenidaImg() {
  const preview = document.getElementById('bienvenida-img-preview');
  const nombreEl = document.getElementById('bienvenida-img-nombre');
  const hidden = document.getElementById('bienvenida-imagen');
  const input = document.getElementById('bienvenida-img-input');

  if (preview) {
    preview.style.display = 'none';
    preview.querySelector('img').src = '';
  }
  if (nombreEl) nombreEl.textContent = '';
  if (hidden) hidden.value = '';
  if (input) input.value = '';
}

// Init
cargarBienvenida();
