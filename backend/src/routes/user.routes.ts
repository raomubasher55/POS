import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/user.controller';
import { verifyToken, requireRole, requireBusinessAccess } from '../middleware/auth.middleware';

const router = express.Router();

const updateProfileValidation = [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('email').optional().isEmail().normalizeEmail(),
];

router.get('/', verifyToken, userController.getUsers);
router.get('/:userId', verifyToken, userController.getUserProfile);
router.put('/:userId', verifyToken, updateProfileValidation, userController.updateUserProfile);
router.delete('/:userId', verifyToken, requireRole(['admin', 'business_owner']), userController.deactivateUser);

export default router;