import User from '../models/user.model';
import { IUser } from '../types';

export class UserService {
  async getUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId)
      .populate('businessId')
      .select('-password -refreshToken');
  }

  async getUserProfile(userId: string) {
    const user = await User.findById(userId)
      .populate('businessId')
      .select('-password -refreshToken');

    if (!user) {
      throw new Error('User not found');
    }

    return {
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
    };
  }

  async updateUserProfile(userId: string, updateData: Partial<IUser>) {
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getUsersByBusiness(businessId: string) {
    return await User.find({ businessId, isActive: true })
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });
  }

  async deactivateUser(userId: string) {
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

export const userService = new UserService();