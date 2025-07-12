import express from 'express';
import { body } from 'express-validator';
import * as staffController from '../controllers/staff.controller';
import { verifyToken, requirePermission } from '../middleware/auth.middleware';

const router = express.Router();

const createStaffValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().trim().withMessage('First name is required'),
  body('lastName').notEmpty().trim().withMessage('Last name is required'),
  body('role').isIn(['manager', 'cashier', 'inventory_manager']).withMessage('Valid role required'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array'),
];

const updateStaffValidation = [
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('firstName').optional().notEmpty().trim().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().trim().withMessage('Last name cannot be empty'),
  body('role').optional().isIn(['manager', 'cashier', 'inventory_manager']).withMessage('Valid role required'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
];

const updatePermissionsValidation = [
  body('permissions').isArray({ min: 0 }).withMessage('Permissions must be an array'),
];

const resetPasswordValidation = [
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Routes
router.post('/', verifyToken, requirePermission('manage_staff'), createStaffValidation, staffController.createStaff);
router.get('/', verifyToken, staffController.getStaff);
router.get('/search', verifyToken, staffController.searchStaff);
router.get('/permissions', verifyToken, staffController.getAvailablePermissions);
router.get('/analytics', verifyToken, requirePermission('view_reports'), staffController.getStaffAnalytics);
router.get('/:staffId', verifyToken, staffController.getStaffMember);
router.put('/:staffId', verifyToken, requirePermission('manage_staff'), updateStaffValidation, staffController.updateStaff);
router.delete('/:staffId', verifyToken, requirePermission('manage_staff'), staffController.deleteStaff);
router.patch('/:staffId/permissions', verifyToken, requirePermission('manage_staff'), updatePermissionsValidation, staffController.updateStaffPermissions);
router.patch('/:staffId/reset-password', verifyToken, requirePermission('manage_staff'), resetPasswordValidation, staffController.resetStaffPassword);

export default router;