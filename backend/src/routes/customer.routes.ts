import express from 'express';
import { body } from 'express-validator';
import * as customerController from '../controllers/customer.controller';
import { verifyToken, requirePermission } from '../middleware/auth.middleware';

const router = express.Router();

const createCustomerValidation = [
  body('firstName').notEmpty().trim().withMessage('First name is required'),
  body('lastName').notEmpty().trim().withMessage('Last name is required'),
  body('phone').notEmpty().trim().withMessage('Phone number is required'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth required'),
];

const updateCustomerValidation = [
  body('firstName').optional().notEmpty().trim().withMessage('First name cannot be empty'),
  body('lastName').optional().notEmpty().trim().withMessage('Last name cannot be empty'),
  body('phone').optional().notEmpty().trim().withMessage('Phone number cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth required'),
  body('loyaltyPoints').optional().isInt({ min: 0 }).withMessage('Loyalty points must be non-negative'),
];

const loyaltyPointsValidation = [
  body('points').isInt({ min: 1 }).withMessage('Points must be a positive integer'),
  body('operation').isIn(['add', 'redeem']).withMessage('Operation must be add or redeem'),
];

// Routes
router.post('/', verifyToken, requirePermission('manage_customers'), createCustomerValidation, customerController.createCustomer);
router.get('/', verifyToken, customerController.getCustomers);
router.get('/search', verifyToken, customerController.searchCustomers);
router.get('/:customerId', verifyToken, customerController.getCustomer);
router.get('/:customerId/history', verifyToken, customerController.getCustomerPurchaseHistory);
router.put('/:customerId', verifyToken, requirePermission('manage_customers'), updateCustomerValidation, customerController.updateCustomer);
router.delete('/:customerId', verifyToken, requirePermission('manage_customers'), customerController.deleteCustomer);
router.patch('/:customerId/loyalty', verifyToken, requirePermission('manage_customers'), loyaltyPointsValidation, customerController.updateLoyaltyPoints);

export default router;