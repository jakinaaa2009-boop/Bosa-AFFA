import { Router } from 'express';
import { deleteWinner, listWinners, updateWinnerPrizeName } from '../controllers/winnerController.js';
import { requireAdmin } from '../middleware/auth.js';

export const winnersRouter = Router();

winnersRouter.get('/', listWinners);
winnersRouter.patch('/:id/prize', requireAdmin, updateWinnerPrizeName);
winnersRouter.delete('/:id', requireAdmin, deleteWinner);

