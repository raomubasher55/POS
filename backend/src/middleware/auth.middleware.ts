import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import { AuthenticatedRequest, JwtPayload } from '../types';

export const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Access token required' });
      return;
    }

    const token = authHeader.substring(7);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    const user = await User.findById(decoded.userId)
      .populate('businessId')
      .select('-password -refreshToken');
    
    if (!user || !user.isActive) {
      res.status(401).json({ message: 'User not found or inactive' });
      return;
    }

    if (user.role !== 'admin' && user.businessId) {
      if (!(user.businessId as any).isSubscriptionActive) {
        res.status(403).json({ 
          message: 'Business subscription is inactive',
          code: 'SUBSCRIPTION_INACTIVE'
        });
        return;
      }
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
      return;
    }
    
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireRole = (roles: string | string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const userRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRoles.includes(req.user.role)) { 
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (req.user.role === 'admin' || req.user.role === 'business_owner') {
      return next();
    }

    if (!req.user.permissions.includes(permission)) {
      res.status(403).json({ 
        message: 'Permission denied',
        required: permission
      });
      return;
    }

    next();
  };
};

export const requireBusinessAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  if (req.user.role === 'admin') {
    return next();
  }

  const businessId = req.params.businessId || req.body.businessId || req.query.businessId;
  
  if (!businessId) {
    res.status(400).json({ message: 'Business ID required' });
    return;
  }

  if (req.user.businessId?.toString() !== businessId) {
    res.status(403).json({ message: 'Access denied to this business' });
    return;
  }

  next();
};