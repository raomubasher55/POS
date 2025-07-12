import express from 'express';
import { body } from 'express-validator';
import * as productController from '../controllers/product.controller';
import { verifyToken, requirePermission } from '../middleware/auth.middleware';
import multer from 'multer';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

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

// Bulk import/export routes
router.post('/bulk-import', verifyToken, requirePermission('manage_products'), upload.single('csvFile'), productController.bulkImportProducts);
router.get('/export/csv', verifyToken, productController.exportProductsCSV);

export default router;