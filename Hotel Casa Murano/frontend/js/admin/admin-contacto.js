// ============================================================
// CONTACTO — INFORMACIÓN
// ============================================================

async function cargarInfoContacto() {
  const res = await apiGet('informacion_contacto');
  if (res.success && res.datos.length > 0) {
    const d = res.datos[0];
    document.getElementById('contacto-direccion').value = d.direccion || '';
    document.getElementById('contacto-celular').value = d.celular || '';
    document.getElementById('contacto-email').value = d.email || '';
    document.getElementById('contacto-mapa').value = d.mapa_iframe || '';
  }
}

async function guardarInfoContacto() {
  const data = {
    direccion: document.getElementById('contacto-direccion').value,
    celular: document.getElementById('contacto-celular').value,
    email: document.getElementById('contacto-email').value,
    mapa_iframe: document.getElementById('contacto-mapa').value
  };
  const res = await apiGet('informacion_contacto');
  let r;
  if (res.success && res.datos.length > 0) {
    r = await apiPut('informacion_contacto', res.datos[0].id, data);
  } else {
    r = await apiPost('informacion_contacto', data);
  }
  if (r.success) toast('Información guardada', 'exito');
  else toast('Error al guardar', 'error');
}

// ============================================================
// CONTACTO — MENSAJES
// ============================================================

async function cargarMensajes() {
  const tbody = document.getElementById('mensajes-body');
  mostrarCargando(tbody);
  const res = await apiGet('mensajes_contacto');
  if (!res.success || res.datos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="vacio">Sin mensajes recibidos</td></tr>';
    return;
  }
  tbody.innerHTML = res.datos.map(m => `
    <tr>
      <td>${m.nombre || '—'}</td>
      <td>${m.correo || '—'}</td>
      <td>${m.asunto || '—'}</td>
      <td>${m.fecha_envio ? new Date(m.fecha_envio).toLocaleDateString('es-CO') : '—'}</td>
      <td><span class="badge ${m.leido ? 'badge-leido' : 'badge-nuevo'}">${m.leido ? 'Leído' : 'Nuevo'}</span></td>
      <td class="td-acciones">
        <div class="acciones">
          <button class="btn-accion editar" onclick="verMensaje(${m.id})" title="Ver">
            <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function verMensaje(id) {
  const res = await apiGet('mensajes_contacto', id);
  if (!res.success) return;
  const m = res.dato;
  const info = [
    `De: ${m.nombre} (${m.correo} - ${m.telefono || 'sin teléfono'})`,
    `Asunto: ${m.asunto || '—'}`,
    `Fecha: ${m.fecha_envio ? new Date(m.fecha_envio).toLocaleString('es-CO') : '—'}`,
    `\nMensaje:\n${m.mensaje}`
  ].join('\n');
  alert(info);
  if (!m.leido) {
    await apiPut('mensajes_contacto', id, { leido: 1 });
    cargarMensajes();
  }
}

// Init
cargarInfoContacto();
cargarMensajes();
