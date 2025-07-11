import express, { Request, Response } from 'express';
import authRoutes from './auth.routes';

const router = express.Router();

// API version prefix
const API_PREFIX = '/api/v1';

// Mount routes
router.use(`${API_PREFIX}/auth`, authRoutes);

// API documentation endpoint
router.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'POS System API',
    version: '1.0.0',
    endpoints: {
      auth: `${API_PREFIX}/auth`,
    }
  });
});

export default router;