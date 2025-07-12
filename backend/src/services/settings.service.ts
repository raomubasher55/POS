import Business from '../models/business.model';

interface BusinessSettings {
  taxRate?: number;
  currency?: string;
  receiptTemplate?: string;
  loyaltyPointsRate?: number;
  lowStockThreshold?: number;
  autoBackup?: boolean;
  businessHours?: {
    monday?: { open: string; close: string; closed?: boolean };
    tuesday?: { open: string; close: string; closed?: boolean };
    wednesday?: { open: string; close: string; closed?: boolean };
    thursday?: { open: string; close: string; closed?: boolean };
    friday?: { open: string; close: string; closed?: boolean };
    saturday?: { open: string; close: string; closed?: boolean };
    sunday?: { open: string; close: string; closed?: boolean };
  };
  paymentMethods?: {
    cash?: boolean;
    card?: boolean;
    mobile?: boolean;
    credit?: boolean;
  };
  notifications?: {
    lowStock?: boolean;
    dailySummary?: boolean;
    newCustomer?: boolean;
  };
}

export class SettingsService {
  async getBusinessSettings(businessId: string): Promise<any> {
    const business = await Business.findById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    return {
      businessInfo: {
        name: business.name,
        phone: business.phone,
        email: business.email,
        address: business.address
      },
      settings: business.settings || this.getDefaultSettings()
    };
  }

  async updateBusinessSettings(businessId: string, settings: BusinessSettings): Promise<any> {
    const business = await Business.findByIdAndUpdate(
      businessId,
      { 
        $set: { 
          'settings': { 
            ...this.getDefaultSettings(),
            ...settings 
          }
        }
      },
      { new: true, runValidators: true }
    );

    if (!business) {
      throw new Error('Business not found');
    }

    return business.settings;
  }

  async updateBusinessInfo(businessId: string, businessInfo: any): Promise<any> {
    const business = await Business.findByIdAndUpdate(
      businessId,
      businessInfo,
      { new: true, runValidators: true }
    );

    if (!business) {
      throw new Error('Business not found');
    }

    return {
      name: business.name,
      phone: business.phone,
      email: business.email,
      address: business.address
    };
  }

  async getPaymentMethods(businessId: string): Promise<any> {
    const business = await Business.findById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    return (business.settings as any)?.paymentMethods || this.getDefaultSettings().paymentMethods;
  }

  async updatePaymentMethods(businessId: string, paymentMethods: any): Promise<any> {
    const business = await Business.findByIdAndUpdate(
      businessId,
      { 
        $set: { 
          'settings.paymentMethods': paymentMethods
        }
      },
      { new: true }
    );

    if (!business) {
      throw new Error('Business not found');
    }

    return (business.settings as any)?.paymentMethods;
  }

  async getTaxSettings(businessId: string): Promise<any> {
    const business = await Business.findById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    return {
      taxRate: business.settings?.taxRate || 0.1,
      currency: business.settings?.currency || 'USD'
    };
  }

  async updateTaxSettings(businessId: string, taxSettings: any): Promise<any> {
    const business = await Business.findByIdAndUpdate(
      businessId,
      { 
        $set: { 
          'settings.taxRate': taxSettings.taxRate,
          'settings.currency': taxSettings.currency
        }
      },
      { new: true }
    );

    if (!business) {
      throw new Error('Business not found');
    }

    return {
      taxRate: business.settings?.taxRate,
      currency: business.settings?.currency
    };
  }

  async getNotificationSettings(businessId: string): Promise<any> {
    const business = await Business.findById(businessId);
    if (!business) {
      throw new Error('Business not found');
    }

    return (business.settings as any)?.notifications || this.getDefaultSettings().notifications;
  }

  async updateNotificationSettings(businessId: string, notifications: any): Promise<any> {
    const business = await Business.findByIdAndUpdate(
      businessId,
      { 
        $set: { 
          'settings.notifications': notifications
        }
      },
      { new: true }
    );

    if (!business) {
      throw new Error('Business not found');
    }

    return (business.settings as any)?.notifications;
  }

  private getDefaultSettings(): BusinessSettings {
    return {
      taxRate: 0.1,
      currency: 'USD',
      receiptTemplate: 'default',
      loyaltyPointsRate: 1,
      lowStockThreshold: 10,
      autoBackup: true,
      businessHours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: '12:00', close: '16:00', closed: true }
      },
      paymentMethods: {
        cash: true,
        card: true,
        mobile: false,
        credit: true
      },
      notifications: {
        lowStock: true,
        dailySummary: true,
        newCustomer: false
      }
    };
  }
}

export const settingsService = new SettingsService();