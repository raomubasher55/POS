import Sale from '../models/sale.model';
import Product from '../models/product.model';
import Customer from '../models/customer.model';
import User from '../models/user.model';
import mongoose from 'mongoose';

interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface ReportOptions {
  businessId: string;
  shopId?: string;
  period?: string;
  startDate?: string;
  endDate?: string;
}

export class ReportsService {
  private getDateRange(period: string): DateRange {
    const endDate = new Date();
    const startDate = new Date();

    switch (period) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7); // Default to week
    }

    return { startDate, endDate };
  }

  async getSalesReport(options: ReportOptions): Promise<any> {
    const { businessId, shopId, period = 'week', startDate: customStartDate, endDate: customEndDate } = options;
    
    let dateRange: DateRange;
    if (customStartDate && customEndDate) {
      dateRange = {
        startDate: new Date(customStartDate),
        endDate: new Date(customEndDate)
      };
    } else {
      dateRange = this.getDateRange(period);
    }

    const query: any = {
      businessId,
      createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
      status: { $in: ['completed', 'partial_refund'] }
    };

    if (shopId) {
      query.shopId = shopId;
    }

    const [
      totalSales,
      totalRevenue,
      avgOrderValue,
      topProducts,
      salesByDay,
      salesByPaymentMethod,
      hourlySales
    ] = await Promise.all([
      Sale.countDocuments(query),
      
      Sale.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$totals.total' } } }
      ]),
      
      Sale.aggregate([
        { $match: query },
        { $group: { _id: null, avg: { $avg: '$totals.total' } } }
      ]),
      
      Sale.aggregate([
        { $match: query },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.name' },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.totalPrice' }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 }
      ]),
      
      Sale.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            totalSales: { $sum: 1 },
            totalRevenue: { $sum: '$totals.total' },
            date: { $first: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]),
      
      Sale.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$payment.method',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totals.total' }
          }
        },
        { $sort: { count: -1 } }
      ]),
      
      Sale.aggregate([
        { $match: query },
        {
          $group: {
            _id: { $hour: '$createdAt' },
            count: { $sum: 1 },
            revenue: { $sum: '$totals.total' }
          }
        },
        { $sort: { '_id': 1 } }
      ])
    ]);

    return {
      period,
      dateRange,
      summary: {
        totalSales,
        totalRevenue: totalRevenue[0]?.total || 0,
        avgOrderValue: avgOrderValue[0]?.avg || 0
      },
      topProducts,
      salesByDay,
      salesByPaymentMethod,
      hourlySales
    };
  }

  async getInventoryReport(options: ReportOptions): Promise<any> {
    const { businessId, shopId } = options;

    const query: any = { businessId, isActive: true };
    if (shopId) {
      query['inventory.shopId'] = shopId;
    }

    const [
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      topSellingProducts,
      inventoryValue
    ] = await Promise.all([
      Product.countDocuments(query),
      
      Product.find(query).then(products => 
        products.filter(product => 
          product.inventory.some((inv: any) => 
            (!shopId || inv.shopId.toString() === shopId) && 
            inv.quantity <= inv.minStock
          )
        )
      ),
      
      Product.find(query).then(products => 
        products.filter(product => 
          product.inventory.some((inv: any) => 
            (!shopId || inv.shopId.toString() === shopId) && 
            inv.quantity === 0
          )
        )
      ),
      
      Sale.aggregate([
        { 
          $match: { 
            businessId,
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            status: { $in: ['completed', 'partial_refund'] }
          } 
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            name: { $first: '$items.name' },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: '$items.totalPrice' }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 }
      ]),
      
      Product.aggregate([
        { $match: query },
        { $unwind: '$inventory' },
        ...(shopId ? [{ $match: { 'inventory.shopId': new mongoose.Types.ObjectId(shopId) } }] : []),
        {
          $group: {
            _id: null,
            totalValue: {
              $sum: {
                $multiply: ['$inventory.quantity', '$pricing.cost']
              }
            }
          }
        }
      ])
    ]);

    return {
      summary: {
        totalProducts,
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        inventoryValue: inventoryValue[0]?.totalValue || 0
      },
      lowStockProducts: lowStockProducts.slice(0, 10),
      outOfStockProducts: outOfStockProducts.slice(0, 10),
      topSellingProducts
    };
  }

  async getCustomerReport(options: ReportOptions): Promise<any> {
    const { businessId, period = 'month' } = options;
    const dateRange = this.getDateRange(period);

    const [
      totalCustomers,
      newCustomers,
      topCustomers,
      customerGrowth,
      loyaltyStats
    ] = await Promise.all([
      Customer.countDocuments({ businessId, isActive: true }),
      
      Customer.countDocuments({
        businessId,
        isActive: true,
        createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate }
      }),
      
      Customer.find({ businessId, isActive: true })
        .sort({ totalSpent: -1 })
        .limit(10),
      
      Customer.aggregate([
        { $match: { businessId, isActive: true } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            date: { $first: { $dateToString: { format: '%Y-%m', date: '$createdAt' } } }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 }
      ]),
      
      Customer.aggregate([
        { $match: { businessId, isActive: true } },
        {
          $group: {
            _id: null,
            avgLoyaltyPoints: { $avg: '$loyaltyPoints' },
            totalLoyaltyPoints: { $sum: '$loyaltyPoints' },
            avgSpent: { $avg: '$totalSpent' }
          }
        }
      ])
    ]);

    return {
      period,
      summary: {
        totalCustomers,
        newCustomers,
        avgLoyaltyPoints: loyaltyStats[0]?.avgLoyaltyPoints || 0,
        avgSpent: loyaltyStats[0]?.avgSpent || 0
      },
      topCustomers,
      customerGrowth,
      loyaltyStats: loyaltyStats[0] || {}
    };
  }

  async getStaffReport(options: ReportOptions): Promise<any> {
    const { businessId, period = 'month' } = options;
    const dateRange = this.getDateRange(period);

    const [
      totalStaff,
      activeStaff,
      staffPerformance,
      staffSales
    ] = await Promise.all([
      User.countDocuments({ businessId, role: 'staff' }),
      
      User.countDocuments({ businessId, role: 'staff', isActive: true }),
      
      Sale.aggregate([
        {
          $match: {
            businessId,
            createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
            status: { $in: ['completed', 'partial_refund'] }
          }
        },
        {
          $group: {
            _id: '$cashier',
            totalSales: { $sum: 1 },
            totalRevenue: { $sum: '$totals.total' },
            avgOrderValue: { $avg: '$totals.total' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'cashier'
          }
        },
        { $unwind: '$cashier' },
        {
          $project: {
            cashierName: { $concat: ['$cashier.firstName', ' ', '$cashier.lastName'] },
            totalSales: 1,
            totalRevenue: 1,
            avgOrderValue: 1
          }
        },
        { $sort: { totalRevenue: -1 } }
      ]),
      
      Sale.aggregate([
        {
          $match: {
            businessId,
            createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
            status: { $in: ['completed', 'partial_refund'] }
          }
        },
        {
          $group: {
            _id: {
              cashier: '$cashier',
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
            },
            dailySales: { $sum: 1 },
            dailyRevenue: { $sum: '$totals.total' }
          }
        },
        { $sort: { '_id.date': 1 } }
      ])
    ]);

    return {
      period,
      summary: {
        totalStaff,
        activeStaff,
        inactiveStaff: totalStaff - activeStaff
      },
      staffPerformance,
      staffSales
    };
  }

  async getDashboardStats(options: ReportOptions): Promise<any> {
    const { businessId, shopId } = options;
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const todayEnd = new Date(today.setHours(23, 59, 59, 999));
    
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const query: any = { businessId };
    if (shopId) {
      query.shopId = shopId;
    }

    const [
      todayStats,
      monthStats,
      recentSales,
      lowStockCount,
      totalCustomers
    ] = await Promise.all([
      Sale.aggregate([
        {
          $match: {
            ...query,
            createdAt: { $gte: todayStart, $lte: todayEnd },
            status: { $in: ['completed', 'partial_refund'] }
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: 1 },
            totalRevenue: { $sum: '$totals.total' },
            avgOrderValue: { $avg: '$totals.total' }
          }
        }
      ]),
      
      Sale.aggregate([
        {
          $match: {
            ...query,
            createdAt: { $gte: thisMonth },
            status: { $in: ['completed', 'partial_refund'] }
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: 1 },
            totalRevenue: { $sum: '$totals.total' }
          }
        }
      ]),
      
      Sale.find({
        ...query,
        status: { $in: ['completed', 'partial_refund'] }
      })
        .populate('cashier', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(5),
      
      Product.find({ businessId, isActive: true }).then(products => 
        products.filter(product => 
          product.inventory.some((inv: any) => 
            (!shopId || inv.shopId.toString() === shopId) && 
            inv.quantity <= inv.minStock
          )
        ).length
      ),
      
      Customer.countDocuments({ businessId, isActive: true })
    ]);

    return {
      today: todayStats[0] || { totalSales: 0, totalRevenue: 0, avgOrderValue: 0 },
      thisMonth: monthStats[0] || { totalSales: 0, totalRevenue: 0 },
      recentSales,
      lowStockCount,
      totalCustomers
    };
  }

  async exportSalesData(options: ReportOptions): Promise<any[]> {
    const { businessId, shopId, period = 'month' } = options;
    const dateRange = this.getDateRange(period);

    const query: any = {
      businessId,
      createdAt: { $gte: dateRange.startDate, $lte: dateRange.endDate },
      status: { $in: ['completed', 'partial_refund'] }
    };

    if (shopId) {
      query.shopId = shopId;
    }

    const sales = await Sale.find(query)
      .populate('cashier', 'firstName lastName')
      .populate('shopId', 'name')
      .sort({ createdAt: -1 });

    return sales.map(sale => ({
      saleNumber: sale.saleNumber,
      date: sale.createdAt,
      cashier: `${(sale.cashier as any).firstName} ${(sale.cashier as any).lastName}`,
      shop: (sale.shopId as any)?.name || 'Main',
      customer: sale.customer?.name || 'Walk-in',
      items: sale.items.length,
      subtotal: sale.totals.subtotal,
      tax: sale.totals.tax,
      discount: sale.totals.discount,
      total: sale.totals.total,
      paymentMethod: sale.payment.method,
      status: sale.status
    }));
  }
}

export const reportsService = new ReportsService();