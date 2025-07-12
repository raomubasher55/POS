import Sale from '../models/sale.model';
import Product from '../models/product.model';

export class SaleService {
  async createSale(saleData: any): Promise<any> {
    const sale = new Sale(saleData);
    
    // Update product stock for each item
    for (const item of saleData.items || []) {
      const product = await Product.findById(item.productId);
      if (product) {
        const shopInventory = product.inventory.find((inv: any) => 
          inv.shopId.toString() === saleData.shopId.toString()
        );
        if (shopInventory) {
          shopInventory.quantity -= item.quantity;
          await product.save();
        }
      }
    }

    return await sale.save();
  }

  async getSaleById(saleId: string): Promise<any> {
    return await Sale.findById(saleId)
      .populate('items.productId', 'name sku pricing')
      .populate('customerId', 'firstName lastName email')
      .populate('staffId', 'firstName lastName');
  }

  async getSalesByBusiness(businessId: string, page: number = 1, limit: number = 20): Promise<{
    sales: any[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [sales, total] = await Promise.all([
      Sale.find({ businessId })
        .populate('items.productId', 'name sku')
        .populate('customerId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Sale.countDocuments({ businessId })
    ]);

    return {
      sales,
      total,
      pages: Math.ceil(total / limit)
    };
  }

  async getDailySales(businessId: string, date: Date): Promise<any[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await Sale.find({
      businessId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    }).populate('items.productId', 'name sku');
  }

  async getSalesAnalytics(businessId: string, startDate: Date, endDate: Date) {
    const sales = await Sale.find({
      businessId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const totalRevenue = sales.reduce((sum, sale: any) => sum + sale.total, 0);
    const totalSales = sales.length;
    const averageSale = totalSales > 0 ? totalRevenue / totalSales : 0;

    return {
      totalRevenue,
      totalSales,
      averageSale,
      salesByDay: this.groupSalesByDay(sales)
    };
  }

  private groupSalesByDay(sales: any[]) {
    const salesByDay: { [key: string]: { count: number; revenue: number } } = {};
    
    sales.forEach((sale: any) => {
      const day = sale.createdAt.toISOString().split('T')[0];
      if (!salesByDay[day]) {
        salesByDay[day] = { count: 0, revenue: 0 };
      }
      salesByDay[day].count++;
      salesByDay[day].revenue += sale.total;
    });

    return salesByDay;
  }

  async refundSale(saleId: string, reason: string): Promise<any> {
    const sale = await Sale.findById(saleId);
    if (!sale) {
      throw new Error('Sale not found');
    }

    if (sale.status === 'refunded') {
      throw new Error('Sale already refunded');
    }

    // Restore product stock
    for (const item of (sale as any).items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const shopInventory = product.inventory.find((inv: any) => 
          inv.shopId.toString() === (sale as any).shopId.toString()
        );
        if (shopInventory) {
          shopInventory.quantity += item.quantity;
          await product.save();
        }
      }
    }

    (sale as any).status = 'refunded';
    (sale as any).metadata = { 
      ...(sale as any).metadata, 
      refundReason: reason, 
      refundDate: new Date() 
    };

    return await sale.save();
  }
}

export const saleService = new SaleService();