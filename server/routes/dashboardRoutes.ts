import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);
router.get('/', DashboardController.getDashboardStats);
router.post('/seed-sample-data', DashboardController.seedData);

export default router;
