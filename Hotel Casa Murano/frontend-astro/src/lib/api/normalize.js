export function normalizeResponse(raw) {
  if (!raw) return { success: false, datos: [], dato: null };
  if (raw.error) return { success: false, error: raw.error, datos: [], dato: null };
  if (raw.data !== undefined) {
    if (raw.data === null) return { success: false, datos: [], dato: null };
    if (Array.isArray(raw.data)) {
      return { success: true, datos: raw.data, dato: null, meta: raw.meta };
    }
    return { success: true, datos: [raw.data], dato: raw.data, meta: raw.meta };
  }
  return raw;
}

export function normalizeUploadResponse(raw) {
  if (!raw) return { success: false, ruta: '' };
  if (Array.isArray(raw) && raw.length > 0) {
    return { success: true, ruta: raw[0].url || raw[0].url, datos: raw };
  }
  return raw;
}
