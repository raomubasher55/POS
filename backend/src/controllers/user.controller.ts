import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { userService } from '../services/user.service';
import { AuthenticatedRequest } from '../types';

export const getUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    const users = await userService.getUsersByBusiness(businessId);
    res.json({ users });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Check if user is trying to access their own profile or has admin rights
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    const profile = await userService.getUserProfile(userId);
    res.json(profile);

  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { userId } = req.params;
    const updateData = req.body;

    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Check if user is trying to update their own profile or has admin rights
    if (req.user._id.toString() !== userId && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied' });
      return;
    }

    // Remove sensitive fields that shouldn't be updated through this endpoint
    delete updateData.password;
    delete updateData.role;
    delete updateData.permissions;
    delete updateData.businessId;

    const updatedUser = await userService.updateUserProfile(userId, updateData);
    res.json({ 
      message: 'Profile updated successfully',
      user: updatedUser 
    });

  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    console.error('Update user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deactivateUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Only admins and business owners can deactivate users
    if (req.user.role !== 'admin' && req.user.role !== 'business_owner') {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    // Users cannot deactivate themselves
    if (req.user._id.toString() === userId) {
      res.status(400).json({ message: 'Cannot deactivate your own account' });
      return;
    }

    const deactivatedUser = await userService.deactivateUser(userId);
    res.json({ 
      message: 'User deactivated successfully',
      user: deactivatedUser 
    });

  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};