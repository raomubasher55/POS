import mongoose, { Schema } from 'mongoose';
import { IBusiness } from '../types';

const businessSchema = new Schema<IBusiness>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'trial'],
    default: 'trial'
  },
  subscriptionPlan: {
    type: String,
    enum: ['basic', 'premium', 'enterprise'],
    default: 'basic'
  },
  subscriptionExpiry: {
    type: Date,
    default: function() {
      // Default 30-day trial
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },
  settings: {
    currency: {
      type: String,
      default: 'USD'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    receiptTemplate: {
      type: String,
      default: 'default'
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
businessSchema.index({ owner: 1 });
businessSchema.index({ subscriptionStatus: 1 });

// Virtual for subscription active status
businessSchema.virtual('isSubscriptionActive').get(function() {
  return this.subscriptionStatus === 'active' && this.subscriptionExpiry > new Date();
});

// Ensure virtual fields are serialized
businessSchema.set('toJSON', { virtuals: true });

export default mongoose.model<IBusiness>('Business', businessSchema);