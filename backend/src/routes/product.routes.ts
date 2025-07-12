import express from 'express';
import { body } from 'express-validator';
import * as productController from '../controllers/product.controller';
import { verifyToken, requirePermission } from '../middleware/auth.middleware';

const router = express.Router();

const createProductValidation = [
  body('name').notEmpty().trim(),
  body('price').isNumeric().isFloat({ min: 0 }),
  body('cost').optional().isNumeric().isFloat({ min: 0 }),
  body('stock').isNumeric().isInt({ min: 0 }),
  body('sku').optional().trim(),
  body('categoryId').optional().isMongoId(),
];

const updateProductValidation = [
  body('name').optional().trim().notEmpty(),
  body('price').optional().isNumeric().isFloat({ min: 0 }),
  body('cost').optional().isNumeric().isFloat({ min: 0 }),
  body('stock').optional().isNumeric().isInt({ min: 0 }),
  body('sku').optional().trim(),
  body('categoryId').optional().isMongoId(),
];

router.post('/', verifyToken, requirePermission('manage_products'), createProductValidation, productController.createProduct);
router.get('/', verifyToken, productController.getProducts);
router.get('/search', verifyToken, productController.searchProducts);
router.get('/:productId', verifyToken, productController.getProduct);
router.put('/:productId', verifyToken, requirePermission('manage_products'), updateProductValidation, productController.updateProduct);
router.delete('/:productId', verifyToken, requirePermission('manage_products'), productController.deleteProduct);
router.patch('/:productId/stock', verifyToken, requirePermission('manage_inventory'), productController.updateStock);

export default router;