import { apiGet, apiPost, apiPut, apiDelete, uploadFile } from './client';

// Helper to wrap Strapi responses
function wrapResponse(data) {
  if (!data) return { success: false, datos: [] };
  if (data.data) {
    // Strapi 4 format: { data: [...] } or { data: { ... } }
    const items = Array.isArray(data.data) ? data.data : [data.data];
    const mapped = items.filter(Boolean).map(item => ({
      id: item.id,
      ...item.attributes,
    }));
    return { success: true, datos: mapped };
  }
  // Legacy format: { success: true, datos: [...] }
  return data;
}

function wrapSingle(data) {
  if (!data) return { success: false, dato: null };
  if (data.data) {
    const item = data.data;
    return {
      success: true,
      dato: { id: item.id, ...item.attributes },
    };
  }
  // Legacy format: return as-is
  return data;
}

export async function fetchCollection(collection, params = {}) {
  const res = await apiGet(collection, params);
  return wrapResponse(res);
}

export async function fetchSingle(collection, id, params = {}) {
  const res = await apiGet(`${collection}/${id}`, params);
  return wrapSingle(res);
}

export async function createItem(collection, data) {
  const res = await apiPost(collection, { data });
  return wrapSingle(res);
}

export async function updateItem(collection, id, data) {
  const res = await apiPut(collection, id, { data });
  return wrapSingle(res);
}

export async function deleteItem(collection, id) {
  const res = await apiDelete(collection, id);
  return { success: true };
}

export async function uploadImage(file) {
  const res = await uploadFile(file);
  if (Array.isArray(res) && res.length > 0) {
    return { success: true, url: res[0].url };
  }
  return { success: false };
}
