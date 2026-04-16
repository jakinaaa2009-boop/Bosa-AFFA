import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { deleteUser, listUsers, usersStats } from '../controllers/userController.js';

export const usersRouter = Router();

usersRouter.get('/', requireAdmin, listUsers);
usersRouter.get('/stats', requireAdmin, usersStats);
usersRouter.delete('/:id', requireAdmin, deleteUser);

