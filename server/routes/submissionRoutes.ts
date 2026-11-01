import { Router } from 'express';
import { SubmissionController } from '../controllers/submissionController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', SubmissionController.getSubmissions);
router.get('/:id', SubmissionController.getSubmissionById);
router.post('/', authorizeRoles('STUDENT'), SubmissionController.createSubmission);
router.put('/:id/grade', authorizeRoles('FACULTY', 'ADMIN'), SubmissionController.gradeSubmission);

export default router;
