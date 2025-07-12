import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { saleService } from '../services/sale.service';
import { AuthenticatedRequest } from '../types';

export const createSale = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const saleData = {
      ...req.body,
      businessId: req.user.businessId,
      cashier: req.user._id
    };

    const sale = await saleService.createSale(saleData);
    res.status(201).json({ 
      message: 'Sale created successfully',
      sale 
    });

  } catch (error: any) {
    console.error('Create sale error:', error);
    if (error.message === 'Insufficient stock' || error.message === 'Product not found') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSales = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { page = 1, limit = 20, shopId, startDate, endDate } = req.query;
    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      shopId: shopId as string,
      startDate: startDate as string,
      endDate: endDate as string
    };

    const result = await saleService.getSalesByBusiness(businessId, options);
    res.json(result);

  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const { saleId } = req.params;
    const sale = await saleService.getSaleById(saleId);

    if (!sale) {
      res.status(404).json({ message: 'Sale not found' });
      return;
    }

    res.json({ sale });

  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const refundSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const { saleId } = req.params;
    const { refundAmount, reason } = req.body;

    if (!refundAmount || refundAmount <= 0) {
      res.status(400).json({ message: 'Valid refund amount required' });
      return;
    }

    const sale = await saleService.refundSale(saleId, refundAmount, reason);
    res.json({ 
      message: 'Sale refunded successfully',
      sale 
    });

  } catch (error: any) {
    console.error('Refund sale error:', error);
    if (error.message === 'Sale not found' || error.message === 'Invalid refund amount') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const voidSale = async (req: Request, res: Response): Promise<void> => {
  try {
    const { saleId } = req.params;
    const { reason } = req.body;

    const sale = await saleService.voidSale(saleId, reason);
    res.json({ 
      message: 'Sale voided successfully',
      sale 
    });

  } catch (error: any) {
    console.error('Void sale error:', error);
    if (error.message === 'Sale not found' || error.message === 'Cannot void this sale') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDailySales = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
    const { shopId, date } = req.query;

    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    const salesData = await saleService.getDailySales(
      businessId, 
      shopId as string, 
      date as string
    );

    res.json(salesData);

  } catch (error) {
    console.error('Get daily sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSalesAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
    const { shopId, period = '7d' } = req.query;

    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    const analytics = await saleService.getSalesAnalytics(
      businessId,
      shopId as string,
      period as string
    );

    res.json(analytics);

  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};