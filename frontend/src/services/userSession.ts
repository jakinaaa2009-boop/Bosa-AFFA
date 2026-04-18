import { api } from './api';

const TOKEN_KEY = 'user_token_v1';

export type User = {
  id: string;
  fullName: string;
  phone: string;
  age: number;
  accountType?: 'user' | 'company';
};

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

export async function registerUser(input: {
  accountType: 'user' | 'company';
  phone: string;
  password: string;
  fullName?: string;
  age?: number;
  companyName?: string;
}) {
  const body =
    input.accountType === 'company'
      ? {
          accountType: 'company' as const,
          companyName: input.companyName,
          phone: input.phone,
          password: input.password
        }
      : {
          accountType: 'user' as const,
          fullName: input.fullName,
          age: input.age,
          phone: input.phone,
          password: input.password
        };
  const res = await api.post<{ token: string; user: User }>('/api/auth/register', body);
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

