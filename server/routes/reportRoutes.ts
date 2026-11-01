import { Router } from 'express';
import { ReportController } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/performance', ReportController.getOverallPerformance);
router.get('/student/:id', ReportController.getStudentReport);
router.get('/subject/:subject', ReportController.getSubjectReport);

export default router;
