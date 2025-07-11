import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sku: {
    type: String,
    required: true,
    trim: true
  },
  barcode: {
    type: String,
    trim: true,
    sparse: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  pricing: {
    retailPrice: {
      type: Number,
      required: true,
      min: 0
    },
    wholesalePrice: {
      type: Number,
      min: 0
    },
    cost: {
      type: Number,
      min: 0
    }
  },
  inventory: [{
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0
    },
    minStock: {
      type: Number,
      default: 0,
      min: 0
    },
    maxStock: {
      type: Number,
      min: 0
    }
  }],
  images: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound indexes
productSchema.index({ businessId: 1, sku: 1 }, { unique: true });
productSchema.index({ businessId: 1, categoryId: 1 });
productSchema.index({ barcode: 1 }, { sparse: true });
productSchema.index({ businessId: 1, isActive: 1 });

// Virtual for total inventory across all shops
productSchema.virtual('totalInventory').get(function() {
  return this.inventory.reduce((total, inv) => total + inv.quantity, 0);
});

// Method to get inventory for specific shop
productSchema.methods.getShopInventory = function(shopId) {
  return this.inventory.find(inv => inv.shopId.toString() === shopId.toString());
};

// Method to update shop inventory
productSchema.methods.updateShopInventory = function(shopId, quantity) {
  const shopInventory = this.inventory.find(inv => inv.shopId.toString() === shopId.toString());
  if (shopInventory) {
    shopInventory.quantity = quantity;
  } else {
    this.inventory.push({ shopId, quantity });
  }
};

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Product', productSchema);