import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true,
    unique: true
  },
  plan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'past_due', 'trialing', 'paused'],
    default: 'trialing'
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  pricing: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    },
    interval: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly'
    }
  },
  stripeSubscriptionId: {
    type: String,
    sparse: true
  },
  stripeCustomerId: {
    type: String,
    sparse: true
  },
  features: {
    maxShops: {
      type: Number,
      default: 1
    },
    maxProducts: {
      type: Number,
      default: 100
    },
    maxStaff: {
      type: Number,
      default: 5
    },
    hasAdvancedReports: {
      type: Boolean,
      default: false
    },
    hasApiAccess: {
      type: Boolean,
      default: false
    },
    hasMultiCurrency: {
      type: Boolean,
      default: false
    },
    hasPrioritySupport: {
      type: Boolean,
      default: false
    }
  },
  paymentHistory: [{
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    status: {
      type: String,
      enum: ['succeeded', 'failed', 'pending', 'refunded'],
      required: true
    },
    paidAt: {
      type: Date,
      required: true
    },
    stripePaymentId: String,
    invoiceUrl: String,
    failureReason: String
  }],
  trialEndDate: {
    type: Date
  },
  cancelledAt: {
    type: Date
  },
  pausedAt: {
    type: Date
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Indexes
subscriptionSchema.index({ businessId: 1 }, { unique: true });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });

// Static method to get plan features
subscriptionSchema.statics.getPlanFeatures = function(plan) {
  const features = {
    basic: {
      maxShops: 1,
      maxProducts: 100,
      maxStaff: 5,
      hasAdvancedReports: false,
      hasApiAccess: false,
      hasMultiCurrency: false,
      hasPrioritySupport: false,
      price: { monthly: 29, yearly: 290 }
    },
    premium: {
      maxShops: 3,
      maxProducts: 1000,
      maxStaff: 20,
      hasAdvancedReports: true,
      hasApiAccess: false,
      hasMultiCurrency: true,
      hasPrioritySupport: true,
      price: { monthly: 79, yearly: 790 }
    },
    enterprise: {
      maxShops: -1, // unlimited
      maxProducts: -1, // unlimited
      maxStaff: -1, // unlimited
      hasAdvancedReports: true,
      hasApiAccess: true,
      hasMultiCurrency: true,
      hasPrioritySupport: true,
      price: { monthly: 199, yearly: 1990 }
    }
  };
  
  return features[plan];
};

// Virtual to check if subscription is active
subscriptionSchema.virtual('isActive').get(function() {
  return this.status === 'active' && this.currentPeriodEnd > new Date();
});

// Virtual to check if in trial
subscriptionSchema.virtual('isInTrial').get(function() {
  return this.status === 'trialing' && this.trialEndDate > new Date();
});

// Method to calculate days until renewal
subscriptionSchema.methods.daysUntilRenewal = function() {
  if (this.status !== 'active') return null;
  
  const now = new Date();
  const diffTime = this.currentPeriodEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
};

// Method to get subscription usage
subscriptionSchema.methods.getUsage = async function() {
  const Shop = mongoose.model('Shop');
  const Product = mongoose.model('Product');
  const Staff = mongoose.model('Staff');
  
  const [shopCount, productCount, staffCount] = await Promise.all([
    Shop.countDocuments({ businessId: this.businessId, isActive: true }),
    Product.countDocuments({ businessId: this.businessId, isActive: true }),
    Staff.countDocuments({ businessId: this.businessId, isActive: true })
  ]);
  
  return {
    shops: { used: shopCount, limit: this.features.maxShops },
    products: { used: productCount, limit: this.features.maxProducts },
    staff: { used: staffCount, limit: this.features.maxStaff }
  };
};

// Ensure virtual fields are serialized
subscriptionSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Subscription', subscriptionSchema);