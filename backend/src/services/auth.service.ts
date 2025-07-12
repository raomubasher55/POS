import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import Business from '../models/business.model';
import { IUser } from '../types';

export class AuthService {
  generateTokens(userId: string): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  async verifyRefreshToken(refreshToken: string): Promise<IUser> {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      const user = await User.findById(decoded.userId);
      
      if (!user || user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      return user;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async registerUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    businessName: string;
    businessEmail: string;
    businessPhone: string;
    businessAddress: string;
  }) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    const business = new Business({
      name: userData.businessName,
      email: userData.businessEmail,
      phone: userData.businessPhone,
      address: userData.businessAddress,
      owner: null
    });

    const savedBusiness = await business.save();

    const user = new User({
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'business_owner',
      businessId: savedBusiness._id,
      permissions: ['all']
    });

    const savedUser = await user.save();

    savedBusiness.owner = savedUser._id as any;
    await savedBusiness.save();

    const tokens = this.generateTokens(savedUser._id.toString());

    savedUser.refreshToken = tokens.refreshToken;
    await savedUser.save();

    return { user: savedUser, business: savedBusiness, tokens };
  }

  async loginUser(email: string, password: string) {
    const user = await User.findOne({ email, isActive: true })
      .populate('businessId');

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    if (user.role !== 'admin' && user.businessId) {
      if (!(user.businessId as any).isSubscriptionActive) {
        throw new Error('Business subscription is inactive');
      }
    }

    const tokens = this.generateTokens(user._id.toString());

    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return { user, tokens };
  }

  async refreshUserToken(refreshToken: string) {
    const user = await this.verifyRefreshToken(refreshToken);
    const tokens = this.generateTokens(user._id.toString());

    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  }

  async logoutUser(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.refreshToken = undefined;
    await user.save();
  }
}

export const authService = new AuthService();