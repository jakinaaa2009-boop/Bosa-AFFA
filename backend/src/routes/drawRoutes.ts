import { Router } from 'express';
import { forcedReceiptStatus, spinDraw } from '../controllers/drawController.js';
import { requireAdmin } from '../middleware/auth.js';

export const drawRouter = Router();

drawRouter.post('/spin', requireAdmin, spinDraw);
drawRouter.get('/forced-receipt', requireAdmin, forcedReceiptStatus);

