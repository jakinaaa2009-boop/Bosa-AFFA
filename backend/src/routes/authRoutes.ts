import { Router } from 'express';
import { loginUser, me, registerUser } from '../controllers/authController.js';
import { requireUser } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.get('/me', requireUser, me);

