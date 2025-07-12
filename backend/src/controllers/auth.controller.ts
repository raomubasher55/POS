import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { AuthenticatedRequest } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      businessName, 
      businessEmail, 
      businessPhone,
      businessAddress 
    } = req.body;

    const result = await authService.registerUser({
      email,
      password,
      firstName,
      lastName,
      businessName,
      businessEmail,
      businessPhone,
      businessAddress
    });

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: result.user._id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        businessId: result.user.businessId
      },
      business: {
        id: result.business._id,
        name: result.business.name,
        subscriptionStatus: result.business.subscriptionStatus
      },
      tokens: result.tokens
    });

  } catch (error: any) {
    if (error.message === 'User already exists') {
      res.status(400).json({ message: error.message });
      return;
    }
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { email, password } = req.body;

    const result = await authService.loginUser(email, password);

    res.json({
      message: 'Login successful',
      user: {
        id: result.user._id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        permissions: result.user.permissions,
        businessId: (result.user.businessId as any)?._id
      },
      business: result.user.businessId ? {
        id: (result.user.businessId as any)._id,
        name: (result.user.businessId as any).name,
        subscriptionStatus: (result.user.businessId as any).subscriptionStatus
      } : null,
      tokens: result.tokens
    });

  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      res.status(401).json({ message: error.message });
      return;
    }
    if (error.message === 'Business subscription is inactive') {
      res.status(403).json({ 
        message: error.message,
        code: 'SUBSCRIPTION_INACTIVE'
      });
      return;
    }
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token required' });
      return;
    }

    const tokens = await authService.refreshUserToken(refreshToken);

    res.json({
      message: 'Token refreshed successfully',
      tokens
    });

  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    
    if (!user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }
    
    await authService.logoutUser(user._id.toString());

    res.json({ message: 'Logout successful' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const profile = await userService.getUserProfile(req.user._id.toString());
    res.json(profile);

  } catch (error: any) {
    if (error.message === 'User not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};