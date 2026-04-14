import { Router } from 'express';
import { adminRouter } from './adminRoutes.js';
import { submissionsRouter } from './submissionRoutes.js';
import { drawRouter } from './drawRoutes.js';
import { winnersRouter } from './winnerRoutes.js';
import { usersRouter } from './userRoutes.js';
import { authRouter } from './authRoutes.js';

export const apiRouter = Router();

apiRouter.use('/admin', adminRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/submissions', submissionsRouter);
apiRouter.use('/draw', drawRouter);
apiRouter.use('/winners', winnersRouter);
apiRouter.use('/users', usersRouter);

