import { api } from './api';

const TOKEN_KEY = 'user_token_v1';

export type User = { id: string; fullName: string; phone: string; age: number };

export function getUserToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setUserToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearUserToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function userAuthHeaders() {
  const token = getUserToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function registerUser(input: { fullName: string; phone: string; age: number; password: string }) {
  const res = await api.post<{ token: string; user: User }>('/api/auth/register', input);
  setUserToken(res.data.token);
  return res.data.user;
}

export async function loginUser(input: { phone: string; password: string }) {
  const res = await api.post<{ token: string; user: User }>('/api/auth/login', input);
  setUserToken(res.data.token);
  return res.data.user;
}

export async function fetchMe() {
  const res = await api.get<{ user: User }>('/api/auth/me', { headers: userAuthHeaders() });
  return res.data.user;
}

