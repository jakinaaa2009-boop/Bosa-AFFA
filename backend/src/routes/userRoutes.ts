import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import {
  deleteUser,
  listUsers,
  resetAllUsersEligibility,
  setUserEligibilityByPhone,
  usersStats
} from '../controllers/userController.js';

export const usersRouter = Router();

usersRouter.get('/', requireAdmin, listUsers);
usersRouter.get('/stats', requireAdmin, usersStats);
usersRouter.patch('/eligibility', requireAdmin, setUserEligibilityByPhone);
usersRouter.post('/eligibility/reset-all', requireAdmin, resetAllUsersEligibility);
usersRouter.delete('/:id', requireAdmin, deleteUser);

