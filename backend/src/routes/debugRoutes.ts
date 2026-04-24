import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { debugDb } from '../controllers/debugController.js';

export const debugRouter = Router();

// Temporary debugging endpoint (admin only)
debugRouter.get('/debug-db', requireAdmin, debugDb);

