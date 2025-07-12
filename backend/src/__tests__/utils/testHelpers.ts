import jwt from 'jsonwebtoken';
import User from '../../models/user.model';
import Business from '../../models/business.model';
import Shop from '../../models/shop.model';
import Category from '../../models/category.model';

export const createTestUser = async (data?: Partial<any>) => {
  const business = new Business({
    name: 'Test Business',
    email: 'test@business.com',
    phone: '123-456-7890',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'Test Country'
    },
    subscriptionStatus: 'active',
    ...data?.business
  });
  
  const savedBusiness = await business.save();

  const user = new User({
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: 'business_owner',
    businessId: savedBusiness._id,
    permissions: ['all'],
    isActive: true,
    ...data?.user
  });

  const savedUser = await user.save();
  
  savedBusiness.owner = savedUser._id as any;
  await savedBusiness.save();

  return { user: savedUser, business: savedBusiness };
};

export const createTestShop = async (businessId: string, data?: Partial<any>) => {
  const shop = new Shop({
    name: 'Test Shop',
    businessId,
    address: {
      street: '123 Shop St',
      city: 'Shop City',
      state: 'Shop State',
      zipCode: '12345',
      country: 'Shop Country'
    },
    phone: '123-456-7890',
    settings: {
      openingTime: '09:00',
      closingTime: '17:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    },
    isActive: true,
    ...data
  });

  return await shop.save();
};

export const createTestCategory = async (businessId: string, data?: Partial<any>) => {
  const category = new Category({
    name: 'Test Category',
    businessId,
    isActive: true,
    ...data
  });

  return await category.save();
};

export const generateTestToken = (userId: string): string => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

export const mockAuthenticatedRequest = (user: any) => ({
  user: {
    _id: user._id,
    email: user.email,
    role: user.role,
    businessId: user.businessId,
    permissions: user.permissions
  }
});