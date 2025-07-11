import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  category: {
    type: String,
    enum: [
      'rent',
      'utilities',
      'salaries',
      'supplies',
      'maintenance',
      'marketing',
      'transportation',
      'insurance',
      'taxes',
      'other'
    ],
    required: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'card', 'check', 'other'],
    default: 'cash'
  },
  receipt: {
    type: String
  },
  vendor: {
    name: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    }
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDetails: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    nextDue: Date,
    endDate: Date
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid'],
    default: 'paid'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
expenseSchema.index({ businessId: 1, date: -1 });
expenseSchema.index({ shopId: 1, date: -1 });
expenseSchema.index({ businessId: 1, category: 1 });
expenseSchema.index({ recordedBy: 1, createdAt: -1 });

// Static method to get expense summary
expenseSchema.statics.getExpenseSummary = async function(businessId, shopId, startDate, endDate) {
  const matchQuery: any = {
    businessId,
    date: { $gte: startDate, $lte: endDate },
    status: { $in: ['approved', 'paid'] }
  };
  
  if (shopId) {
    matchQuery.shopId = shopId;
  }
  
  const summary = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
  
  const totalExpenses = summary.reduce((sum, cat) => sum + cat.totalAmount, 0);
  
  return {
    byCategory: summary,
    total: totalExpenses,
    dateRange: { start: startDate, end: endDate }
  };
};

// Static method to get monthly expenses
expenseSchema.statics.getMonthlyExpenses = async function(businessId, year) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  
  const monthlyData = await this.aggregate([
    {
      $match: {
        businessId,
        date: { $gte: startDate, $lte: endDate },
        status: { $in: ['approved', 'paid'] }
      }
    },
    {
      $group: {
        _id: {
          month: { $month: '$date' },
          year: { $year: '$date' }
        },
        totalAmount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.month': 1 } }
  ]);
  
  return monthlyData;
};

// Method to create recurring expense
expenseSchema.methods.createNextRecurring = async function() {
  if (!this.isRecurring || !this.recurringDetails.nextDue) {
    return null;
  }
  
  if (this.recurringDetails.endDate && this.recurringDetails.nextDue > this.recurringDetails.endDate) {
    return null;
  }
  
  const nextExpense = new this.constructor({
    businessId: this.businessId,
    shopId: this.shopId,
    category: this.category,
    description: this.description,
    amount: this.amount,
    date: this.recurringDetails.nextDue,
    paymentMethod: this.paymentMethod,
    vendor: this.vendor,
    isRecurring: true,
    recurringDetails: {
      frequency: this.recurringDetails.frequency,
      nextDue: this.calculateNextDue(),
      endDate: this.recurringDetails.endDate
    },
    recordedBy: this.recordedBy,
    status: 'pending',
    notes: `Recurring expense from ${this._id}`
  });
  
  return nextExpense.save();
};

// Method to calculate next due date
expenseSchema.methods.calculateNextDue = function() {
  const current = new Date(this.recurringDetails.nextDue);
  
  switch (this.recurringDetails.frequency) {
    case 'daily':
      current.setDate(current.getDate() + 1);
      break;
    case 'weekly':
      current.setDate(current.getDate() + 7);
      break;
    case 'monthly':
      current.setMonth(current.getMonth() + 1);
      break;
    case 'yearly':
      current.setFullYear(current.getFullYear() + 1);
      break;
  }
  
  return current;
};

// Ensure virtual fields are serialized
expenseSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Expense', expenseSchema);