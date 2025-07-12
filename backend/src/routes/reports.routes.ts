import express from 'express';
import * as reportsController from '../controllers/reports.controller';
import { verifyToken, requirePermission } from '../middleware/auth.middleware';

const router = express.Router();

// Routes
router.get('/dashboard', verifyToken, reportsController.getDashboardStats);
router.get('/summary', verifyToken, requirePermission('view_reports'), reportsController.getReportSummary);
router.get('/sales', verifyToken, requirePermission('view_reports'), reportsController.getSalesReport);
router.get('/inventory', verifyToken, requirePermission('view_reports'), reportsController.getInventoryReport);
router.get('/customers', verifyToken, requirePermission('view_reports'), reportsController.getCustomerReport);
router.get('/staff', verifyToken, requirePermission('manage_staff'), reportsController.getStaffReport);
router.get('/export/sales', verifyToken, requirePermission('view_reports'), reportsController.exportSalesData);

export default router;