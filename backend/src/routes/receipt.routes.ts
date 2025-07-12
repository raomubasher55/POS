import express from 'express';
import { body } from 'express-validator';
import * as receiptController from '../controllers/receipt.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

const emailReceiptValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email address required'),
  body('template').optional().isIn(['default', 'compact', 'detailed']).withMessage('Invalid template')
];

const printReceiptValidation = [
  body('template').optional().isIn(['default', 'compact', 'detailed']).withMessage('Invalid template')
];

// Routes
router.get('/:saleId', verifyToken, receiptController.generateReceipt);
router.get('/:saleId/data', verifyToken, receiptController.getReceiptData);
router.post('/:saleId/print', verifyToken, printReceiptValidation, receiptController.printReceipt);
router.post('/:saleId/email', verifyToken, emailReceiptValidation, receiptController.emailReceipt);

export default router;