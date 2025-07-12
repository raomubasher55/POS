import Sale from '../models/sale.model';
import Product from '../models/product.model';
import mongoose from 'mongoose';

export class SaleService {
  async createSale(saleData: any): Promise<any> {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();

      // Generate sale number
      const saleNumber = await (Sale as any).generateSaleNumber(saleData.shopId);
      
      // Validate and update inventory for each item
      for (const item of saleData.items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        // Find shop inventory
        const shopInventory = product.inventory.find(
          (inv: any) => inv.shopId.toString() === saleData.shopId.toString()
        );

        if (!shopInventory || shopInventory.quantity < item.quantity) {
          throw new Error(`Insufficient stock for product: ${product.name}`);
        }

        // Update inventory
        shopInventory.quantity -= item.quantity;
        await product.save({ session });

        // Set item details from product
        item.name = product.name;
        item.sku = product.sku;
        item.unitPrice = item.unitPrice || product.pricing.retailPrice;
        item.totalPrice = item.unitPrice * item.quantity;
      }

      // Calculate totals
      const subtotal = saleData.items.reduce((sum: number, item: any) => sum + item.totalPrice, 0);
      const tax = saleData.totals?.tax || (subtotal * 0.1); // 10% default tax
      const discount = saleData.totals?.discount || 0;
      const total = subtotal + tax - discount;

      // Create sale
      const sale = new Sale({
        ...saleData,
        saleNumber,
        totals: {
          subtotal,
          tax,
          discount,
          total
        },
        payment: {
          ...saleData.payment,
          changeAmount: saleData.payment.paidAmount - total
        }
      });

      await sale.save({ session });
      await session.commitTransaction();

      return await this.getSaleById(sale._id.toString());

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getSaleById(saleId: string): Promise<any> {
    return await Sale.findById(saleId)
      .populate('cashier', 'firstName lastName')
      .populate('items.productId', 'name sku')
      .populate('businessId', 'name')
      .populate('shopId', 'name');
  }

  async getSalesByBusiness(businessId: string, options: any): Promise<any> {
    const {
      page = 1,
      limit = 20,
      shopId,
      startDate,
      endDate
    } = options;

    const query: any = { businessId };

    // Add shop filter
    if (shopId) {
      query.shopId = shopId;
    }

    // Add date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [sales, total] = await Promise.all([
      Sale.find(query)
        .populate('cashier', 'firstName lastName')
        .populate('shopId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Sale.countDocuments(query)
    ]);

    return {
      sales,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }


  async refundSale(saleId: string, refundAmount: number, reason?: string): Promise<any> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const sale = await Sale.findById(saleId).session(session);
      if (!sale) {
        throw new Error('Sale not found');
      }

      if (refundAmount > sale.totals.total) {
        throw new Error('Invalid refund amount');
      }

      // Update sale status
      if (refundAmount === sale.totals.total) {
        sale.status = 'refunded';
      } else {
        sale.status = 'partial_refund';
      }

      // Add refund notes
      sale.notes = (sale.notes || '') + `\nRefund: $${refundAmount} - ${reason || 'No reason provided'}`;

      await sale.save({ session });

      // Restore inventory for full refunds
      if (refundAmount === sale.totals.total) {
        for (const item of sale.items) {
          const product = await Product.findById(item.productId).session(session);
          if (product) {
            const shopInventory = product.inventory.find(
              (inv: any) => inv.shopId.toString() === sale.shopId.toString()
            );
            if (shopInventory) {
              shopInventory.quantity += item.quantity;
              await product.save({ session });
            }
          }
        }
      }

      await session.commitTransaction();
      return sale;

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async voidSale(saleId: string, reason?: string): Promise<any> {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const sale = await Sale.findById(saleId).session(session);
      if (!sale) {
        throw new Error('Sale not found');
      }

      if (sale.status !== 'completed') {
        throw new Error('Cannot void this sale');
      }

      // Update sale status
      sale.status = 'voided';
      sale.notes = (sale.notes || '') + `\nVoided: ${reason || 'No reason provided'}`;

      // Restore inventory
      for (const item of sale.items) {
        const product = await Product.findById(item.productId).session(session);
        if (product) {
          const shopInventory = product.inventory.find(
            (inv: any) => inv.shopId.toString() === sale.shopId.toString()
          );
          if (shopInventory) {
            shopInventory.quantity += item.quantity;
            await product.save({ session });
          }
        }
      }

      await sale.save({ session });
      await session.commitTransaction();
      return sale;

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getDailySales(businessId: string, shopId?: string, date?: string): Promise<any> {
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const query: any = {
      businessId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['completed', 'partial_refund'] }
    };

    if (shopId) {
      query.shopId = shopId;
    }

    const [sales, totalSales, totalRevenue] = await Promise.all([
      Sale.find(query).populate('cashier', 'firstName lastName'),
      Sale.countDocuments(query),
      Sale.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: '$totals.total' } } }
      ])
    ]);

    return {
      date: targetDate.toISOString().split('T')[0],
      totalSales,
      totalRevenue: totalRevenue[0]?.total || 0,
      sales
    };
  }

  async getSalesAnalytics(businessId: string, shopId?: string, period: string = '7d'): Promise<any> {
    const days = period === '30d' ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const query: any = {
      businessId,
      createdAt: { $gte: startDate },
      status: { $in: ['completed', 'partial_refund'] }
    };

    if (shopId) {
      query.shopId = shopId;
    }

    const analytics = await Sale.aggregate([
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
          averageOrderValue: { $avg: '$totals.total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get top selling products
    const topProducts = await Sale.aggregate([
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
    ]);

    return {
      period,
      dailyAnalytics: analytics,
      topProducts
    };
  }
}

export const saleService = new SaleService();