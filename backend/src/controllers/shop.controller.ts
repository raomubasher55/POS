import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { shopService } from '../services/shop.service';
import { AuthenticatedRequest } from '../types';

export const getShops = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const shops = await shopService.getShopsByBusiness(businessId);
    res.json({ shops });

  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getShop = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { shopId } = req.params;
    const shop = await shopService.getShopById(shopId);
    
    if (!shop) {
      res.status(404).json({ message: 'Shop not found' });
      return;
    }

    res.json({ shop });

  } catch (error) {
    console.error('Get shop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};