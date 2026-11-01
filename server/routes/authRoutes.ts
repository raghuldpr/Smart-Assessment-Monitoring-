import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/demo-login', AuthController.demoLogin);
router.get('/demo-accounts', AuthController.getDemoAccounts);
router.get('/me', authenticateToken, AuthController.getMe);

export default router;
