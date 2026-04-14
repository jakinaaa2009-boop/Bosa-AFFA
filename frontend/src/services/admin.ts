import { api } from './api';

const TOKEN_KEY = 'admin_token';

export function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function adminLogin(input: { username: string; password: string }) {
  const res = await api.post<{ token: string }>('/api/admin/login', input);
  setAdminToken(res.data.token);
  return res.data;
}

export function withAdminAuth() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

