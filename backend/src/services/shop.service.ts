import Shop from '../models/shop.model';

export class ShopService {
  async createShop(shopData: any): Promise<any> {
    const shop = new Shop(shopData);
    return await shop.save();
  }

  async getShopById(shopId: string): Promise<any> {
    return await Shop.findById(shopId)
      .populate('businessId', 'name')
      .populate('manager', 'firstName lastName');
  }

  async getShopsByBusiness(businessId: string): Promise<any[]> {
    return await Shop.find({ businessId, isActive: true })
      .populate('manager', 'firstName lastName')
      .sort({ name: 1 });
  }

  async updateShop(shopId: string, updateData: any): Promise<any> {
    return await Shop.findByIdAndUpdate(
      shopId,
      updateData,
      { new: true, runValidators: true }
    );
  }

  async deleteShop(shopId: string): Promise<boolean> {
    const result = await Shop.findByIdAndUpdate(
      shopId,
      { isActive: false },
      { new: true }
    );
    return !!result;
  }

  async getMainShop(businessId: string): Promise<any> {
    return await Shop.findOne({ businessId, isActive: true }).sort({ createdAt: 1 });
  }

  async createDefaultShop(businessId: string, businessData: any): Promise<any> {
    // Parse address string into structured format
    const addressParts = businessData.address.split(', ');
    const address = {
      street: addressParts[0] || 'Main Street',
      city: addressParts[1] || 'Main City',
      state: addressParts[2] || 'Main State',
      zipCode: addressParts[3] || '12345',
      country: addressParts[4] || 'Main Country'
    };

    const defaultShopData = {
      name: businessData.name,
      businessId,
      address,
      phone: businessData.phone,
      settings: {
        openingTime: '09:00',
        closingTime: '17:00',
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
      },
      isActive: true
    };

    return await this.createShop(defaultShopData);
  }
}

export const shopService = new ShopService();