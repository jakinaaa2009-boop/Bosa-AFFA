import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { deleteUser, listUsers, setUserEligibilityByPhone, usersStats } from '../controllers/userController.js';

export const usersRouter = Router();

usersRouter.get('/', requireAdmin, listUsers);
usersRouter.get('/stats', requireAdmin, usersStats);
usersRouter.patch('/eligibility', requireAdmin, setUserEligibilityByPhone);
usersRouter.delete('/:id', requireAdmin, deleteUser);

