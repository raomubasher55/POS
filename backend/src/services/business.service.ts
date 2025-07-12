import Business from '../models/business.model';
import { IBusiness } from '../types';

export class BusinessService {
  async getBusinessById(businessId: string): Promise<IBusiness | null> {
    return await Business.findById(businessId).populate('owner', 'firstName lastName email');
  }

  async updateBusiness(businessId: string, updateData: Partial<IBusiness>): Promise<IBusiness | null> {
    return await Business.findByIdAndUpdate(
      businessId,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'firstName lastName email');
  }

  async updateSubscription(businessId: string, subscriptionData: {
    subscriptionPlan: string;
    subscriptionStatus: string;
    subscriptionExpiry: Date;
  }): Promise<IBusiness | null> {
    return await Business.findByIdAndUpdate(
      businessId,
      subscriptionData,
      { new: true }
    );
  }

  async getBusinessSettings(businessId: string) {
    const business = await Business.findById(businessId).select('settings');
    return business?.settings || {};
  }

  async updateBusinessSettings(businessId: string, settings: any): Promise<IBusiness | null> {
    return await Business.findByIdAndUpdate(
      businessId,
      { $set: { settings } },
      { new: true }
    );
  }

  async checkSubscriptionStatus(businessId: string): Promise<{
    isActive: boolean;
    status: string;
    expiryDate: Date;
    daysRemaining: number;
  }> {
    const business = await Business.findById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    const now = new Date();
    const expiryDate = business.subscriptionExpiry;
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isActive = business.isSubscriptionActive;

    return {
      isActive,
      status: business.subscriptionStatus,
      expiryDate,
      daysRemaining: Math.max(0, daysRemaining)
    };
  }

  async getBusinessStats(businessId: string) {
    // This would typically aggregate data from various collections
    // For now, returning a basic structure
    return {
      totalProducts: 0,
      totalSales: 0,
      totalRevenue: 0,
      activeStaff: 0
    };
  }

  async deactivateBusiness(businessId: string): Promise<IBusiness | null> {
    return await Business.findByIdAndUpdate(
      businessId,
      { isActive: false },
      { new: true }
    );
  }
}

export const businessService = new BusinessService();