import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import Business from '../models/Business';
import { generateTokens, verifyRefreshToken } from '../middleware/auth';
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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Create business first
    const business = new Business({
      name: businessName,
      email: businessEmail,
      phone: businessPhone,
      address: businessAddress,
      owner: null // Will be set after user creation
    });

    const savedBusiness = await business.save();

    // Create user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: 'business_owner',
      businessId: savedBusiness._id,
      permissions: ['all'] // Business owner gets all permissions
    });

    const savedUser = await user.save();

    // Update business with owner reference
    savedBusiness.owner = savedUser._id;
    await savedBusiness.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(savedUser._id.toString());

    // Save refresh token
    savedUser.refreshToken = refreshToken;
    await savedUser.save();

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: savedUser._id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        businessId: savedUser.businessId
      },
      business: {
        id: savedBusiness._id,
        name: savedBusiness.name,
        subscriptionStatus: savedBusiness.subscriptionStatus
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
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

    // Find user and populate business
    const user = await User.findOne({ email, isActive: true })
      .populate('businessId');

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Check business subscription (except for admins)
    if (user.role !== 'admin' && user.businessId) {
      if (!(user.businessId as any).isSubscriptionActive) {
        res.status(403).json({ 
          message: 'Business subscription is inactive',
          code: 'SUBSCRIPTION_INACTIVE'
        });
        return;
      }
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id.toString());

    // Save refresh token and update last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions,
        businessId: (user.businessId as any)?._id
      },
      business: user.businessId ? {
        id: (user.businessId as any)._id,
        name: (user.businessId as any).name,
        subscriptionStatus: (user.businessId as any).subscriptionStatus
      } : null,
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
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

    const user = await verifyRefreshToken(refreshToken);
    
    // Generate new tokens
    const tokens = generateTokens(user._id.toString());

    // Update refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

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
    
    // Clear refresh token
    user.refreshToken = undefined;
    await user.save();

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

    const user = await User.findById(req.user._id)
      .populate('businessId')
      .select('-password -refreshToken');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
        businessId: (user.businessId as any)?._id
      },
      business: user.businessId ? {
        id: (user.businessId as any)._id,
        name: (user.businessId as any).name,
        email: (user.businessId as any).email,
        subscriptionStatus: (user.businessId as any).subscriptionStatus,
        subscriptionPlan: (user.businessId as any).subscriptionPlan,
        subscriptionExpiry: (user.businessId as any).subscriptionExpiry
      } : null
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};