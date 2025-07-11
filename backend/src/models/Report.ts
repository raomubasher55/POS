const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  },
  type: {
    type: String,
    enum: [
      'daily_sales',
      'weekly_sales',
      'monthly_sales',
      'inventory',
      'staff_performance',
      'product_performance',
      'financial_summary',
      'customer_analytics',
      'custom'
    ],
    required: true
  },
  dateRange: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  summary: {
    totalRevenue: Number,
    totalTransactions: Number,
    totalProducts: Number,
    totalCustomers: Number,
    averageTransactionValue: Number,
    topProducts: [{
      productId: mongoose.Schema.Types.ObjectId,
      productName: String,
      quantity: Number,
      revenue: Number
    }],
    topStaff: [{
      staffId: mongoose.Schema.Types.ObjectId,
      staffName: String,
      salesCount: Number,
      revenue: Number
    }]
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  format: {
    type: String,
    enum: ['json', 'pdf', 'excel', 'csv'],
    default: 'json'
  },
  fileUrl: {
    type: String
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    sendTo: [{
      type: String
    }],
    nextRun: Date
  }
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ businessId: 1, type: 1, createdAt: -1 });
reportSchema.index({ shopId: 1, type: 1, createdAt: -1 });
reportSchema.index({ generatedBy: 1, createdAt: -1 });

// Static method to generate sales report
reportSchema.statics.generateSalesReport = async function(businessId, shopId, startDate, endDate) {
  const Sale = mongoose.model('Sale');
  const Product = mongoose.model('Product');
  
  const matchQuery = {
    businessId,
    createdAt: { $gte: startDate, $lte: endDate },
    status: { $in: ['completed', 'partial_refund'] }
  };
  
  if (shopId) {
    matchQuery.shopId = shopId;
  }
  
  // Get sales data
  const salesData = await Sale.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        },
        totalRevenue: { $sum: '$totals.total' },
        totalTransactions: { $sum: 1 },
        totalItems: { $sum: { $size: '$items' } },
        avgTransactionValue: { $avg: '$totals.total' }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);
  
  // Get top products
  const topProducts = await Sale.aggregate([
    { $match: matchQuery },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        productName: { $first: '$items.name' },
        quantity: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.totalPrice' }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 10 }
  ]);
  
  // Get summary
  const summary = await Sale.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totals.total' },
        totalTransactions: { $sum: 1 },
        avgTransactionValue: { $avg: '$totals.total' },
        uniqueCustomers: { $addToSet: '$customer.phone' }
      }
    }
  ]);
  
  return {
    type: 'sales_report',
    dateRange: { start: startDate, end: endDate },
    dailyData: salesData,
    summary: {
      totalRevenue: summary[0]?.totalRevenue || 0,
      totalTransactions: summary[0]?.totalTransactions || 0,
      averageTransactionValue: summary[0]?.avgTransactionValue || 0,
      totalCustomers: summary[0]?.uniqueCustomers?.length || 0,
      topProducts
    }
  };
};

// Static method to generate inventory report
reportSchema.statics.generateInventoryReport = async function(businessId, shopId) {
  const Product = mongoose.model('Product');
  
  const matchQuery = { businessId, isActive: true };
  
  const inventoryData = await Product.aggregate([
    { $match: matchQuery },
    { $unwind: '$inventory' },
    {
      $match: shopId ? { 'inventory.shopId': mongoose.Types.ObjectId(shopId) } : {}
    },
    {
      $group: {
        _id: '$categoryId',
        totalProducts: { $sum: 1 },
        totalStock: { $sum: '$inventory.quantity' },
        totalValue: { $sum: { $multiply: ['$inventory.quantity', '$pricing.retailPrice'] } },
        lowStockItems: {
          $sum: {
            $cond: [
              { $lte: ['$inventory.quantity', '$inventory.minStock'] },
              1,
              0
            ]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category'
      }
    }
  ]);
  
  return {
    type: 'inventory_report',
    data: inventoryData,
    generatedAt: new Date()
  };
};

// Method to export report
reportSchema.methods.exportReport = async function(format) {
  // Implementation would depend on the format
  // This is a placeholder for the export logic
  switch (format) {
    case 'pdf':
      // Generate PDF
      break;
    case 'excel':
      // Generate Excel
      break;
    case 'csv':
      // Generate CSV
      break;
    default:
      return this.data;
  }
};

// Ensure virtual fields are serialized
reportSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Report', reportSchema);