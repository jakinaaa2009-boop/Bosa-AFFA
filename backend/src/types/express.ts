import type { Request } from 'express';

export type AuthRequest = Request & {
  admin?: { id: string; username: string };
  user?: { id: string; phone: string };
};

