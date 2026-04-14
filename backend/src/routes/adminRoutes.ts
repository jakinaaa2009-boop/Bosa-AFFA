import { Router } from 'express';
import { adminLogin } from '../controllers/adminController.js';

export const adminRouter = Router();

adminRouter.post('/login', adminLogin);

