import express from 'express';
import { body } from 'express-validator';
import * as saleController from '../controllers/sale.controller';
import { verifyToken, requirePermission } from '../middleware/auth.middleware';

const router = express.Router();

const createSaleValidation = [
  body('shopId').isMongoId().withMessage('Valid shop ID required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.productId').isMongoId().withMessage('Valid product ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity required'),
  body('payment.method').isIn(['cash', 'card', 'credit', 'mobile']).withMessage('Valid payment method required'),
  body('payment.paidAmount').isFloat({ min: 0 }).withMessage('Valid paid amount required'),
];

const refundValidation = [
  body('refundAmount').isFloat({ min: 0.01 }).withMessage('Valid refund amount required'),
  body('reason').optional().trim()
];

const voidValidation = [
  body('reason').optional().trim()
];

// Routes
router.post('/', verifyToken, requirePermission('manage_sales'), createSaleValidation, saleController.createSale);
router.get('/', verifyToken, saleController.getSales);
router.get('/daily', verifyToken, saleController.getDailySales);
router.get('/analytics', verifyToken, saleController.getSalesAnalytics);
router.get('/:saleId', verifyToken, saleController.getSale);
router.post('/:saleId/refund', verifyToken, requirePermission('manage_sales'), refundValidation, saleController.refundSale);
router.post('/:saleId/void', verifyToken, requirePermission('manage_sales'), voidValidation, saleController.voidSale);

export default router;