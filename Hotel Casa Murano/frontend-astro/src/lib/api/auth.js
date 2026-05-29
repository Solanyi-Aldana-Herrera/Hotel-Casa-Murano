import { STRAPI_URL } from '../constants';

export async function login(usuario, contrasena) {
  const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: usuario, password: contrasena }),
  });
  return res.json();
}

export async function loginLegacy(usuario, contrasena) {
  const res = await fetch(`${STRAPI_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, contrasena }),
  });
  return res.json();
}

export async function recoverPassword(email) {
  const res = await fetch(`${STRAPI_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function resetPassword(code, password, passwordConfirmation) {
  const res = await fetch(`${STRAPI_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, password, passwordConfirmation }),
  });
  return res.json();
}
