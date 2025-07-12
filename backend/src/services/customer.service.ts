import Customer from '../models/customer.model';
import Sale from '../models/sale.model';

export class CustomerService {
  async createCustomer(customerData: any): Promise<any> {
    const customer = new Customer(customerData);
    return await customer.save();
  }

  async getCustomerById(customerId: string): Promise<any> {
    return await Customer.findById(customerId);
  }

  async getCustomersByBusiness(businessId: string, options: any): Promise<any> {
    const { page = 1, limit = 20, search } = options;
    const skip = (page - 1) * limit;

    let query: any = { businessId, isActive: true };

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    const [customers, total] = await Promise.all([
      Customer.find(query)
        .sort({ lastName: 1, firstName: 1 })
        .skip(skip)
        .limit(limit),
      Customer.countDocuments(query)
    ]);

    return {
      customers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateCustomer(customerId: string, updateData: any): Promise<any> {
    return await Customer.findByIdAndUpdate(
      customerId,
      updateData,
      { new: true, runValidators: true }
    );
  }

  async deleteCustomer(customerId: string): Promise<boolean> {
    const result = await Customer.findByIdAndUpdate(
      customerId,
      { isActive: false },
      { new: true }
    );
    return !!result;
  }

  async searchCustomers(businessId: string, searchTerm: string): Promise<any[]> {
    const searchRegex = new RegExp(searchTerm, 'i');
    
    return await Customer.find({
      businessId,
      isActive: true,
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ]
    })
    .sort({ lastName: 1, firstName: 1 })
    .limit(10);
  }

  async getCustomerPurchaseHistory(customerId: string, options: any): Promise<any> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    // Find customer first
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Find sales where customer phone matches
    const query = {
      'customer.phone': customer.phone,
      status: { $in: ['completed', 'partial_refund'] }
    };

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate('cashier', 'firstName lastName')
        .populate('shopId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Sale.countDocuments(query)
    ]);

    // Calculate summary stats
    const totalSpent = await Sale.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$totals.total' } } }
    ]);

    return {
      customer,
      purchaseHistory: sales,
      summary: {
        totalOrders: total,
        totalSpent: totalSpent[0]?.total || 0,
        averageOrderValue: total > 0 ? (totalSpent[0]?.total || 0) / total : 0
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async updateLoyaltyPoints(customerId: string, points: number, operation: 'add' | 'redeem'): Promise<any> {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    if (operation === 'add') {
      return await (customer as any).addLoyaltyPoints(points);
    } else {
      return await (customer as any).redeemLoyaltyPoints(points);
    }
  }

  async getTopCustomers(businessId: string, limit: number = 10): Promise<any[]> {
    return await Customer.find({ businessId, isActive: true })
      .sort({ totalSpent: -1 })
      .limit(limit);
  }

  async getCustomerAnalytics(businessId: string): Promise<any> {
    const [
      totalCustomers,
      newCustomersThisMonth,
      topCustomers,
      loyaltyStats
    ] = await Promise.all([
      Customer.countDocuments({ businessId, isActive: true }),
      
      Customer.countDocuments({
        businessId,
        isActive: true,
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }),
      
      Customer.find({ businessId, isActive: true })
        .sort({ totalSpent: -1 })
        .limit(5),
      
      Customer.aggregate([
        { $match: { businessId, isActive: true } },
        {
          $group: {
            _id: null,
            avgLoyaltyPoints: { $avg: '$loyaltyPoints' },
            totalLoyaltyPoints: { $sum: '$loyaltyPoints' },
            avgTotalSpent: { $avg: '$totalSpent' },
            totalSpent: { $sum: '$totalSpent' }
          }
        }
      ])
    ]);

    return {
      totalCustomers,
      newCustomersThisMonth,
      topCustomers,
      averageStats: loyaltyStats[0] || {
        avgLoyaltyPoints: 0,
        totalLoyaltyPoints: 0,
        avgTotalSpent: 0,
        totalSpent: 0
      }
    };
  }
}

export const customerService = new CustomerService();