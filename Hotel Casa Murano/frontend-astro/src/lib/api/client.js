import { STRAPI_URL } from '../constants';
import { normalizeResponse, normalizeUploadResponse } from './normalize';

function getToken() {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('auth_token');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export async function apiGet(endpoint, params = {}) {
  const query = Object.keys(params).length
    ? '?' + new URLSearchParams(params).toString()
    : '';
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}${query}`);
  if (!res.ok) throw new Error(`Error GET /api/${endpoint}: ${res.status}`);
  return normalizeResponse(await res.json());
}

export async function apiPost(endpoint, data) {
  const token = getToken();
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error(`Error POST /api/${endpoint}: ${res.status}`);
  return normalizeResponse(await res.json());
}

export async function apiPut(endpoint, id, data) {
  const token = getToken();
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) throw new Error(`Error PUT /api/${endpoint}/${id}: ${res.status}`);
  return normalizeResponse(await res.json());
}

export async function apiDelete(endpoint, id) {
  const token = getToken();
  const res = await fetch(`${STRAPI_URL}/api/${endpoint}/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`Error DELETE /api/${endpoint}/${id}: ${res.status}`);
  return normalizeResponse(await res.json());
}

export async function uploadFile(file) {
  const token = getToken();
  const fd = new FormData();
  fd.append('files', file);
  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  if (!res.ok) throw new Error(`Error uploading file: ${res.status}`);
  return normalizeUploadResponse(await res.json());
}
