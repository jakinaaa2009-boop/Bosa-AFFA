import { Router } from 'express';
import { forceLogin, forceLogout, getForcedReceipt, setForcedReceipt } from '../controllers/forceController.js';
import { requireForceAuth } from '../middleware/forceAuth.js';

export const forceRouter = Router();

forceRouter.post('/login', forceLogin);
forceRouter.post('/logout', forceLogout);

forceRouter.get('/receipt', requireForceAuth, getForcedReceipt);
forceRouter.put('/receipt', requireForceAuth, setForcedReceipt);

