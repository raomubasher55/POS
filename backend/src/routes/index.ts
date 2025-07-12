import express, { Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import categoryRoutes from './category.routes';
import shopRoutes from './shop.routes';
import saleRoutes from './sale.routes';
import customerRoutes from './customer.routes';
import receiptRoutes from './receipt.routes';
import staffRoutes from './staff.routes';
import reportsRoutes from './reports.routes';
import settingsRoutes from './settings.routes';

const router = express.Router();

// API version prefix
const API_PREFIX = '/api/v1';

// Mount routes
router.use(`${API_PREFIX}/auth`, authRoutes);
router.use(`${API_PREFIX}/users`, userRoutes);
router.use(`${API_PREFIX}/products`, productRoutes);
router.use(`${API_PREFIX}/categories`, categoryRoutes);
router.use(`${API_PREFIX}/sales`, saleRoutes);
router.use(`${API_PREFIX}/customers`, customerRoutes);
router.use(`${API_PREFIX}/receipts`, receiptRoutes);
router.use(`${API_PREFIX}/staff`, staffRoutes);
router.use(`${API_PREFIX}/reports`, reportsRoutes);
router.use(`${API_PREFIX}/settings`, settingsRoutes);

// API documentation endpoint
router.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'POS System API',
    version: '1.0.0',
    endpoints: {
      auth: `${API_PREFIX}/auth`,
      users: `${API_PREFIX}/users`,
      products: `${API_PREFIX}/products`,
      categories: `${API_PREFIX}/categories`,
      sales: `${API_PREFIX}/sales`,
      customers: `${API_PREFIX}/customers`,
      receipts: `${API_PREFIX}/receipts`,
      staff: `${API_PREFIX}/staff`,
      reports: `${API_PREFIX}/reports`,
      settings: `${API_PREFIX}/settings`,
    }
  });
});

export default router;