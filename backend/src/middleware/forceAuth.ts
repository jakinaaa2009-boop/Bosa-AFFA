import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthRequest } from '../types/express.js';

const COOKIE_NAME = 'force_token_v1';

function parseCookie(header: string | undefined) {
  if (!header) return {};
  const out: Record<string, string> = {};
  for (const part of header.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (!k) continue;
    out[k] = decodeURIComponent(rest.join('=') ?? '');
  }
  return out;
}

type ForceJwtPayload = { typ: 'force'; username: string };

export function requireForceAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const cookies = parseCookie(req.headers.cookie);
  const token = cookies[COOKIE_NAME];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & ForceJwtPayload;
    if (!decoded?.sub || decoded.typ !== 'force' || !decoded.username) return res.status(401).json({ message: 'Unauthorized' });
    // Store on req.admin to reuse AuthRequest shape, but this is separate auth.
    req.admin = { id: String(decoded.sub), username: String(decoded.username) };
    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export function setForceCookie(res: Response, token: string) {
  const secure = env.NODE_ENV === 'production';
  // httpOnly cookie so credentials aren't exposed to frontend JS
  res.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7};${
      secure ? ' Secure;' : ''
    }`
  );
}

export function clearForceCookie(res: Response) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
}

