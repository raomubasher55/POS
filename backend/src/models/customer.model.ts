import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  address: {
    street: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true,
      default: 'US'
    }
  },
  dateOfBirth: {
    type: Date
  },
  loyaltyPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  },
  totalVisits: {
    type: Number,
    default: 0,
    min: 0
  },
  lastVisit: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
customerSchema.index({ businessId: 1, phone: 1 }, { unique: true });
customerSchema.index({ businessId: 1, email: 1 }, { sparse: true });
customerSchema.index({ businessId: 1, isActive: 1 });
customerSchema.index({ businessId: 1, lastName: 1, firstName: 1 });

// Virtual for full name
customerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for formatted address
customerSchema.virtual('formattedAddress').get(function() {
  const { street, city, state, zipCode } = this.address;
  const parts = [street, city, state, zipCode].filter(Boolean);
  return parts.join(', ');
});

// Method to add loyalty points
customerSchema.methods.addLoyaltyPoints = function(points: number) {
  this.loyaltyPoints += points;
  return this.save();
};

// Method to redeem loyalty points
customerSchema.methods.redeemLoyaltyPoints = function(points: number) {
  if (this.loyaltyPoints < points) {
    throw new Error('Insufficient loyalty points');
  }
  this.loyaltyPoints -= points;
  return this.save();
};

// Method to update purchase stats
customerSchema.methods.updatePurchaseStats = function(amount: number) {
  this.totalSpent += amount;
  this.totalVisits += 1;
  this.lastVisit = new Date();
  
  // Add loyalty points (1 point per dollar spent)
  const pointsEarned = Math.floor(amount);
  this.loyaltyPoints += pointsEarned;
  
  return this.save();
};

// Static method to search customers
customerSchema.statics.searchCustomers = function(businessId: string, searchTerm: string, options: any = {}) {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const searchRegex = new RegExp(searchTerm, 'i');
  
  return this.find({
    businessId,
    isActive: true,
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex }
    ]
  })
  .sort({ lastName: 1, firstName: 1 })
  .skip(skip)
  .limit(limit);
};

// Ensure virtual fields are serialized
customerSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Customer', customerSchema);