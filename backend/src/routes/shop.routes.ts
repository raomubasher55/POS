import express from 'express';
import * as shopController from '../controllers/shop.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', verifyToken, shopController.getShops);
router.get('/:shopId', verifyToken, shopController.getShop);

export default router;