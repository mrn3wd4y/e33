// Helper toi gian goi Directus REST API bang fetch (Node 18+).
// Khong dung SDK de giu script gon va it phu thuoc.

const DIRECTUS_URL = (process.env.DIRECTUS_URL || 'http://localhost:8055').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_TOKEN = process.env.DIRECTUS_TOKEN;

let cachedToken = null;

async function login() {
  if (ADMIN_TOKEN) return ADMIN_TOKEN;
  if (cachedToken) return cachedToken;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('Thieu DIRECTUS_TOKEN hoac ADMIN_EMAIL/ADMIN_PASSWORD trong env.');
  }
  const res = await fetch(`${DIRECTUS_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) {
    throw new Error(`Login that bai: ${res.status} ${await res.text()}`);
  }
  const body = await res.json();
  cachedToken = body.data.access_token;
  return cachedToken;
}

async function api(method, path, payload) {
  const token = await login();
  const res = await fetch(`${DIRECTUS_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }
  if (!res.ok) {
    const err = new Error(`${method} ${path} -> ${res.status}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return json;
}

module.exports = { DIRECTUS_URL, api, login };
