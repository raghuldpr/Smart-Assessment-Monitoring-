import { Router } from 'express';
import { AssessmentController } from '../controllers/assessmentController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', AssessmentController.getAssessments);
router.get('/:id', AssessmentController.getAssessmentById);
router.post('/', authorizeRoles('FACULTY', 'ADMIN'), AssessmentController.createAssessment);
router.put('/:id', authorizeRoles('FACULTY', 'ADMIN'), AssessmentController.updateAssessment);
router.delete('/:id', authorizeRoles('FACULTY', 'ADMIN'), AssessmentController.deleteAssessment);

export default router;
