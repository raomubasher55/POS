import { Request, Response } from 'express';
import { reportsService } from '../services/reports.service';
import { AuthenticatedRequest } from '../types';

export const getSalesReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    // Check permissions
    if (!req.user.permissions?.includes('view_reports') && req.user.role !== 'business_owner') {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    const { shopId, period, startDate, endDate } = req.query;
    const options = {
      businessId,
      shopId: shopId as string,
      period: period as string,
      startDate: startDate as string,
      endDate: endDate as string
    };

    const report = await reportsService.getSalesReport(options);
    res.json({ report });

  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInventoryReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    // Check permissions
    if (!req.user.permissions?.includes('view_reports') && req.user.role !== 'business_owner') {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    const { shopId } = req.query;
    const options = {
      businessId,
      shopId: shopId as string
    };

    const report = await reportsService.getInventoryReport(options);
    res.json({ report });

  } catch (error) {
    console.error('Get inventory report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCustomerReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    // Check permissions
    if (!req.user.permissions?.includes('view_reports') && req.user.role !== 'business_owner') {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    const { period } = req.query;
    const options = {
      businessId,
      period: period as string
    };

    const report = await reportsService.getCustomerReport(options);
    res.json({ report });

  } catch (error) {
    console.error('Get customer report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStaffReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    // Only business owners and managers can view staff reports
    if (req.user.role !== 'business_owner' && !req.user.permissions?.includes('manage_staff')) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    const { period } = req.query;
    const options = {
      businessId,
      period: period as string
    };

    const report = await reportsService.getStaffReport(options);
    res.json({ report });

  } catch (error) {
    console.error('Get staff report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    const { shopId } = req.query;
    const options = {
      businessId,
      shopId: shopId as string
    };

    const stats = await reportsService.getDashboardStats(options);
    res.json({ stats });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const exportSalesData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    // Check permissions
    if (!req.user.permissions?.includes('view_reports') && req.user.role !== 'business_owner') {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    const { shopId, period, format = 'json' } = req.query;
    const options = {
      businessId,
      shopId: shopId as string,
      period: period as string
    };

    const salesData = await reportsService.exportSalesData(options);

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Sale Number,Date,Cashier,Shop,Customer,Items,Subtotal,Tax,Discount,Total,Payment Method,Status\n';
      const csvContent = salesData.map(sale => [
        sale.saleNumber,
        sale.date,
        sale.cashier,
        sale.shop,
        sale.customer,
        sale.items,
        sale.subtotal,
        sale.tax,
        sale.discount,
        sale.total,
        sale.paymentMethod,
        sale.status
      ].join(',')).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=sales-export-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvHeader + csvContent);
      return;
    }

    res.json({ 
      salesData,
      exportDate: new Date().toISOString(),
      totalRecords: salesData.length
    });

  } catch (error) {
    console.error('Export sales data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getReportSummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    // Check permissions
    if (!req.user.permissions?.includes('view_reports') && req.user.role !== 'business_owner') {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    const { shopId, period = 'week' } = req.query;
    const options = {
      businessId,
      shopId: shopId as string,
      period: period as string
    };

    const [salesReport, inventoryReport, customerReport] = await Promise.all([
      reportsService.getSalesReport(options),
      reportsService.getInventoryReport(options),
      reportsService.getCustomerReport(options)
    ]);

    res.json({
      summary: {
        sales: salesReport.summary,
        inventory: inventoryReport.summary,
        customers: customerReport.summary
      },
      period: salesReport.period,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get report summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};