import { Router } from 'express';
import {
  createSubmission,
  createSubmissionForUser,
  deleteSubmission,
  getSubmissionReceiptImage,
  listEligibleForDraw,
  listMySubmissions,
  listMySubmissionsAuthed,
  listSubmissions,
  patchSubmissionStatus
} from '../controllers/submissionController.js';
import { requireAdmin, requireUser } from '../middleware/auth.js';
import { receiptUpload } from '../middleware/upload.js';

export const submissionsRouter = Router();

// Public: create submission with receipt upload
submissionsRouter.post('/', receiptUpload.single('receiptImage'), createSubmission);

// User-auth: create submission
submissionsRouter.post('/me', requireUser, receiptUpload.single('receiptImage'), createSubmissionForUser);

// Public: list own submissions by phone (for receipt page history)
submissionsRouter.get('/public', listMySubmissions);

// User-auth: list own submissions
submissionsRouter.get('/me', requireUser, listMySubmissionsAuthed);

// Public: serve receipt image from MongoDB
submissionsRouter.get('/:id/receipt', getSubmissionReceiptImage);

// Admin: list/filter/search
submissionsRouter.get('/', requireAdmin, listSubmissions);
submissionsRouter.get('/eligible-draw', requireAdmin, listEligibleForDraw);
submissionsRouter.patch('/:id/status', requireAdmin, patchSubmissionStatus);
submissionsRouter.delete('/:id', requireAdmin, deleteSubmission);

