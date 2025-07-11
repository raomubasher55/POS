import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  saleNumber: {
    type: String,
    required: true,
    unique: true
  },
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
  cashier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customer: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  totals: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['cash', 'card', 'credit', 'mobile'],
      required: true
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'partial'],
      default: 'paid'
    },
    paidAmount: {
      type: Number,
      required: true,
      min: 0
    },
    changeAmount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  status: {
    type: String,
    enum: ['completed', 'refunded', 'voided', 'partial_refund'],
    default: 'completed'
  },
  receiptPrinted: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
saleSchema.index({ businessId: 1, createdAt: -1 });
saleSchema.index({ shopId: 1, createdAt: -1 });
saleSchema.index({ cashier: 1, createdAt: -1 });
saleSchema.index({ saleNumber: 1 }, { unique: true });
saleSchema.index({ 'customer.phone': 1 });

// Static method to generate sale number
saleSchema.statics.generateSaleNumber = async function(shopId) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Find the last sale number for today
  const lastSale = await this.findOne({
    shopId,
    saleNumber: new RegExp(`^${dateStr}`)
  }).sort({ saleNumber: -1 });
  
  let sequence = 1;
  if (lastSale) {
    const lastSequence = parseInt(lastSale.saleNumber.slice(-4));
    sequence = lastSequence + 1;
  }
  
  return `${dateStr}-${sequence.toString().padStart(4, '0')}`;
};

// Method to calculate profit
saleSchema.methods.calculateProfit = async function() {
  let totalCost = 0;
  
  for (const item of this.items) {
    const product = await mongoose.model('Product').findById(item.productId);
    if (product && product.pricing.cost) {
      totalCost += product.pricing.cost * item.quantity;
    }
  }
  
  return this.totals.total - totalCost;
};

// Virtual for transaction date formatted
saleSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString();
});

// Ensure virtual fields are serialized
saleSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Sale', saleSchema);