import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { customerService } from '../services/customer.service';
import { AuthenticatedRequest } from '../types';

export const createCustomer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const customerData = {
      ...req.body,
      businessId: req.user.businessId
    };

    const customer = await customerService.createCustomer(customerData);
    res.status(201).json({ 
      message: 'Customer created successfully',
      customer 
    });

  } catch (error: any) {
    console.error('Create customer error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Phone number already exists for this business' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCustomers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const { page = 1, limit = 20, search } = req.query;
    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string
    };

    const result = await customerService.getCustomersByBusiness(businessId, options);
    res.json(result);

  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const customer = await customerService.getCustomerById(customerId);

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    res.json({ customer });

  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { customerId } = req.params;
    const updateData = req.body;

    const customer = await customerService.updateCustomer(customerId, updateData);

    if (!customer) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    res.json({ 
      message: 'Customer updated successfully',
      customer 
    });

  } catch (error: any) {
    console.error('Update customer error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Phone number already exists for this business' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const success = await customerService.deleteCustomer(customerId);

    if (!success) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }

    res.json({ message: 'Customer deleted successfully' });

  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const searchCustomers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const businessId = (req.user.businessId as any)?._id?.toString() || req.user.businessId?.toString();
    const { q: searchTerm } = req.query;

    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    if (!searchTerm || typeof searchTerm !== 'string') {
      res.status(400).json({ message: 'Search term required' });
      return;
    }

    const customers = await customerService.searchCustomers(businessId, searchTerm);
    res.json({ customers });

  } catch (error) {
    console.error('Search customers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCustomerPurchaseHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const result = await customerService.getCustomerPurchaseHistory(customerId, options);
    res.json(result);

  } catch (error) {
    console.error('Get customer purchase history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateLoyaltyPoints = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerId } = req.params;
    const { points, operation } = req.body;

    if (!points || !operation || !['add', 'redeem'].includes(operation)) {
      res.status(400).json({ message: 'Valid points and operation (add/redeem) required' });
      return;
    }

    const customer = await customerService.updateLoyaltyPoints(customerId, points, operation);
    res.json({ 
      message: `Loyalty points ${operation === 'add' ? 'added' : 'redeemed'} successfully`,
      customer 
    });

  } catch (error: any) {
    console.error('Update loyalty points error:', error);
    if (error.message === 'Customer not found' || error.message === 'Insufficient loyalty points') {
      res.status(400).json({ message: error.message });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};