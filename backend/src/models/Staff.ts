import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  permissions: [{
    type: String,
    enum: [
      'sales',
      'refunds',
      'inventory_view',
      'inventory_edit',
      'reports_view',
      'reports_full',
      'staff_view',
      'staff_manage',
      'settings_view',
      'settings_edit'
    ]
  }],
  salary: {
    type: Number,
    min: 0
  },
  commissionRate: {
    type: Number,
    min: 0,
    max: 100
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  terminationDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  workSchedule: {
    monday: { start: String, end: String },
    tuesday: { start: String, end: String },
    wednesday: { start: String, end: String },
    thursday: { start: String, end: String },
    friday: { start: String, end: String },
    saturday: { start: String, end: String },
    sunday: { start: String, end: String }
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  }
}, {
  timestamps: true
});

// Indexes
staffSchema.index({ businessId: 1, isActive: 1 });
staffSchema.index({ shopId: 1, isActive: 1 });
staffSchema.index({ userId: 1 }, { unique: true });

// Virtual for employment duration
staffSchema.virtual('employmentDuration').get(function() {
  const endDate = this.terminationDate || new Date();
  const duration = endDate.getTime() - this.hireDate.getTime();
  const days = Math.floor(duration / (1000 * 60 * 60 * 24));
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  
  return { years, months, days: days % 30 };
});

// Method to calculate commission
staffSchema.methods.calculateCommission = async function(startDate, endDate) {
  if (!this.commissionRate) return 0;
  
  const sales = await mongoose.model('Sale').find({
    cashier: this.userId,
    createdAt: { $gte: startDate, $lte: endDate },
    status: 'completed'
  });
  
  const totalSales = sales.reduce((sum, sale) => sum + sale.totals.total, 0);
  return (totalSales * this.commissionRate) / 100;
};

// Method to get performance metrics
staffSchema.methods.getPerformanceMetrics = async function(startDate, endDate) {
  const Sale = mongoose.model('Sale');
  
  const metrics = await Sale.aggregate([
    {
      $match: {
        cashier: this.userId,
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: '$totals.total' },
        averageTransaction: { $avg: '$totals.total' },
        totalItems: { $sum: { $size: '$items' } }
      }
    }
  ]);
  
  return metrics[0] || {
    totalSales: 0,
    totalRevenue: 0,
    averageTransaction: 0,
    totalItems: 0
  };
};

// Ensure virtual fields are serialized
staffSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Staff', staffSchema);