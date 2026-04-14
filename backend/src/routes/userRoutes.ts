import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { deleteUser, listUsers } from '../controllers/userController.js';

export const usersRouter = Router();

usersRouter.get('/', requireAdmin, listUsers);
usersRouter.delete('/:id', requireAdmin, deleteUser);

