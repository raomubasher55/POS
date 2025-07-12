import express from 'express';
import { body } from 'express-validator';
import * as settingsController from '../controllers/settings.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

const updateSettingsValidation = [
  body('taxRate').optional().isFloat({ min: 0, max: 1 }).withMessage('Tax rate must be between 0 and 1'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters'),
  body('loyaltyPointsRate').optional().isInt({ min: 0 }).withMessage('Loyalty points rate must be positive'),
];

// Routes
router.get('/', verifyToken, settingsController.getBusinessSettings);
router.put('/', verifyToken, updateSettingsValidation, settingsController.updateBusinessSettings);
router.get('/payment-methods', verifyToken, settingsController.getPaymentMethods);
router.put('/payment-methods', verifyToken, settingsController.updatePaymentMethods);

export default router;