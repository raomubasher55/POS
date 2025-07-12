import express from 'express';
import { body } from 'express-validator';
import * as categoryController from '../controllers/category.controller';
import { verifyToken, requirePermission } from '../middleware/auth.middleware';

const router = express.Router();

const createCategoryValidation = [
  body('name').notEmpty().trim(),
  body('description').optional().trim(),
  body('parentCategory').optional().isMongoId(),
];

const updateCategoryValidation = [
  body('name').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('parentCategory').optional().isMongoId(),
];

router.post('/', verifyToken, requirePermission('manage_products'), createCategoryValidation, categoryController.createCategory);
router.get('/', verifyToken, categoryController.getCategories);
router.get('/:categoryId', verifyToken, categoryController.getCategory);
router.put('/:categoryId', verifyToken, requirePermission('manage_products'), updateCategoryValidation, categoryController.updateCategory);
router.delete('/:categoryId', verifyToken, requirePermission('manage_products'), categoryController.deleteCategory);

export default router;