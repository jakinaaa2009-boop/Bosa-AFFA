import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AuthRequest } from '../types/express.js';

type JwtPayload = { sub: string; username: string };
type UserJwtPayload = { sub: string; phone: string; typ: 'user' };

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & JwtPayload;
    if (!decoded?.sub || !decoded?.username) return res.status(401).json({ message: 'Unauthorized' });
    req.admin = { id: String(decoded.sub), username: String(decoded.username) };
    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export function requireUser(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & UserJwtPayload;
    if (!decoded?.sub || !decoded?.phone || decoded.typ !== 'user') return res.status(401).json({ message: 'Unauthorized' });
    req.user = { id: String(decoded.sub), phone: String(decoded.phone) };
    return next();
  } catch {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

