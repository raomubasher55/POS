import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { settingsService } from '../services/settings.service';
import { AuthenticatedRequest } from '../types';

export const getBusinessSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const settings = await settingsService.getBusinessSettings(businessId);
    res.json({ settings });

  } catch (error: any) {
    console.error('Get business settings error:', error);
    if (error.message === 'Business not found') {
      res.status(404).json({ message: 'Business not found' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBusinessSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Only business owners can update settings
    if (req.user.role !== 'business_owner') {
      res.status(403).json({ message: 'Only business owners can update settings' });
      return;
    }

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    const settings = await settingsService.updateBusinessSettings(businessId, req.body);
    res.json({ 
      message: 'Settings updated successfully',
      settings 
    });

  } catch (error: any) {
    console.error('Update business settings error:', error);
    if (error.message === 'Business not found') {
      res.status(404).json({ message: 'Business not found' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPaymentMethods = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const paymentMethods = await settingsService.getPaymentMethods(businessId);
    res.json({ paymentMethods });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updatePaymentMethods = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (req.user.role !== 'business_owner') {
      res.status(403).json({ message: 'Only business owners can update payment methods' });
      return;
    }

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    const paymentMethods = await settingsService.updatePaymentMethods(businessId, req.body);
    res.json({ 
      message: 'Payment methods updated successfully',
      paymentMethods 
    });

  } catch (error) {
    console.error('Update payment methods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};