import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { staffService } from '../services/staff.service';
import { AuthenticatedRequest } from '../types';

export const createStaff = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Only business owners and managers can create staff
    if (req.user.role !== 'business_owner' && !req.user.permissions?.includes('manage_staff')) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    const staffData = {
      ...req.body,
      businessId: req.user.businessId
    };

    const staff = await staffService.createStaff(staffData);
    res.status(201).json({ 
      message: 'Staff member created successfully',
      staff 
    });

  } catch (error: any) {
    console.error('Create staff error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'Email already exists' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStaff = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const businessId = req.user.businessId?.toString();
    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    const { page = 1, limit = 20, role, isActive } = req.query;
    const options = {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      role: role as string,
      isActive: isActive === 'false' ? false : true
    };

    const result = await staffService.getStaffByBusiness(businessId, options);
    res.json(result);

  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStaffMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { staffId } = req.params;
    const staff = await staffService.getStaffById(staffId);

    if (!staff) {
      res.status(404).json({ message: 'Staff member not found' });
      return;
    }

    res.json({ staff });

  } catch (error) {
    console.error('Get staff member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStaff = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Only business owners and managers can update staff
    if (req.user.role !== 'business_owner' && !req.user.permissions?.includes('manage_staff')) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    const { staffId } = req.params;
    const updateData = req.body;

    const staff = await staffService.updateStaff(staffId, updateData);

    if (!staff) {
      res.status(404).json({ message: 'Staff member not found' });
      return;
    }

    res.json({ 
      message: 'Staff member updated successfully',
      staff 
    });

  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteStaff = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Only business owners can delete staff
    if (req.user.role !== 'business_owner') {
      res.status(403).json({ message: 'Only business owners can delete staff' });
      return;
    }

    const { staffId } = req.params;
    const success = await staffService.deleteStaff(staffId);

    if (!success) {
      res.status(404).json({ message: 'Staff member not found' });
      return;
    }

    res.json({ message: 'Staff member deleted successfully' });

  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateStaffPermissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Only business owners and managers can update permissions
    if (req.user.role !== 'business_owner' && !req.user.permissions?.includes('manage_staff')) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    const { staffId } = req.params;
    const { permissions } = req.body;

    const staff = await staffService.updateStaffPermissions(staffId, permissions);
    res.json({ 
      message: 'Staff permissions updated successfully',
      staff 
    });

  } catch (error) {
    console.error('Update staff permissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetStaffPassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    // Only business owners can reset passwords
    if (req.user.role !== 'business_owner') {
      res.status(403).json({ message: 'Only business owners can reset passwords' });
      return;
    }

    const { staffId } = req.params;
    const { newPassword } = req.body;

    await staffService.resetStaffPassword(staffId, newPassword);
    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset staff password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAvailablePermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const permissions = await staffService.getAvailablePermissions();
    res.json({ permissions });

  } catch (error) {
    console.error('Get available permissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const searchStaff = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const businessId = req.user.businessId?.toString();
    const { q: searchTerm } = req.query;

    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    if (!searchTerm || typeof searchTerm !== 'string') {
      res.status(400).json({ message: 'Search term required' });
      return;
    }

    const staff = await staffService.searchStaff(businessId, searchTerm);
    res.json({ staff });

  } catch (error) {
    console.error('Search staff error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getStaffAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const businessId = req.user.businessId?.toString();
    if (!businessId) {
      res.status(400).json({ message: 'Business ID required' });
      return;
    }

    // Only business owners and managers can view analytics
    if (req.user.role !== 'business_owner' && !req.user.permissions?.includes('view_reports')) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    const analytics = await staffService.getStaffAnalytics(businessId);
    res.json(analytics);

  } catch (error) {
    console.error('Get staff analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};