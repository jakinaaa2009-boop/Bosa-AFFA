import axios from 'axios';

export const api = axios.create({
  // Use same-origin requests. In production, Next.js rewrites `/api/*` to backend.
  baseURL: '',
  timeout: 20_000
});

