import { Router } from 'express';
import { deleteWinner, listWinners } from '../controllers/winnerController.js';
import { requireAdmin } from '../middleware/auth.js';

export const winnersRouter = Router();

winnersRouter.get('/', listWinners);
winnersRouter.delete('/:id', requireAdmin, deleteWinner);

