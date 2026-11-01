import { Router } from 'express';
import { AssignmentController } from '../controllers/assignmentController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', AssignmentController.getAssignments);
router.get('/:id', AssignmentController.getAssignmentById);
router.post('/', authorizeRoles('FACULTY', 'ADMIN'), AssignmentController.createAssignment);
router.put('/:id', authorizeRoles('FACULTY', 'ADMIN'), AssignmentController.updateAssignment);
router.delete('/:id', authorizeRoles('FACULTY', 'ADMIN'), AssignmentController.deleteAssignment);

export default router;
