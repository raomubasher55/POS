import mongoose from 'mongoose';

const inventoryMovementSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  type: {
    type: String,
    enum: ['sale', 'purchase', 'adjustment', 'transfer', 'return', 'damage'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  previousStock: {
    type: Number,
    required: true,
    min: 0
  },
  newStock: {
    type: Number,
    required: true,
    min: 0
  },
  reference: {
    type: {
      type: String,
      enum: ['sale', 'purchase_order', 'manual', 'transfer', 'return'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'reference.model'
    },
    model: {
      type: String,
      enum: ['Sale', 'PurchaseOrder', 'Transfer', 'Return']
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
inventoryMovementSchema.index({ productId: 1, createdAt: -1 });
inventoryMovementSchema.index({ shopId: 1, createdAt: -1 });
inventoryMovementSchema.index({ businessId: 1, type: 1, createdAt: -1 });

// Static method to create movement record
inventoryMovementSchema.statics.createMovement = async function(data) {
  const { productId, shopId, businessId, type, quantity, referenceType, referenceId, userId, notes } = data;
  
  // Get current stock
  const product = await mongoose.model('Product').findById(productId);
  const shopInventory = product.inventory.find(inv => inv.shopId.toString() === shopId.toString());
  const currentStock = shopInventory ? shopInventory.quantity : 0;
  
  // Calculate new stock
  let newStock = currentStock;
  if (['sale', 'damage', 'transfer'].includes(type)) {
    newStock = currentStock - Math.abs(quantity);
  } else if (['purchase', 'return', 'adjustment'].includes(type)) {
    newStock = currentStock + Math.abs(quantity);
  }
  
  // Create movement record
  const movement = await this.create({
    productId,
    shopId,
    businessId,
    type,
    quantity: type === 'sale' || type === 'damage' || type === 'transfer' ? -Math.abs(quantity) : Math.abs(quantity),
    previousStock: currentStock,
    newStock,
    reference: {
      type: referenceType,
      id: referenceId,
      model: referenceType === 'sale' ? 'Sale' : referenceType === 'purchase_order' ? 'PurchaseOrder' : null
    },
    user: userId,
    notes
  });
  
  // Update product inventory
  if (shopInventory) {
    shopInventory.quantity = newStock;
  } else {
    product.inventory.push({ shopId, quantity: newStock });
  }
  await product.save();
  
  return movement;
};

// Method to get movement summary
inventoryMovementSchema.statics.getMovementSummary = async function(productId, shopId, startDate, endDate) {
  const match: any = { productId, shopId };
  if (startDate && endDate) {
    match.createdAt = { $gte: startDate, $lte: endDate };
  }
  
  const summary = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$type',
        totalQuantity: { $sum: '$quantity' },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return summary;
};

export default mongoose.model('InventoryMovement', inventoryMovementSchema);