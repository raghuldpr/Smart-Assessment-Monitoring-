import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN', 'FACULTY'), UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', authorizeRoles('ADMIN'), UserController.deleteUser);

export default router;
