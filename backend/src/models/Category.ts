const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
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
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
categorySchema.index({ businessId: 1, name: 1 });
categorySchema.index({ businessId: 1, isActive: 1 });
categorySchema.index({ parentCategory: 1 });

// Method to get full category path
categorySchema.methods.getCategoryPath = async function() {
  const path = [this.name];
  let currentCategory = this;
  
  while (currentCategory.parentCategory) {
    currentCategory = await this.model('Category').findById(currentCategory.parentCategory);
    if (currentCategory) {
      path.unshift(currentCategory.name);
    } else {
      break;
    }
  }
  
  return path.join(' > ');
};

// Static method to get category tree
categorySchema.statics.getCategoryTree = async function(businessId) {
  const categories = await this.find({ businessId, isActive: true });
  
  const buildTree = (parentId = null) => {
    return categories
      .filter(cat => {
        if (parentId === null) {
          return !cat.parentCategory;
        }
        return cat.parentCategory && cat.parentCategory.toString() === parentId.toString();
      })
      .map(cat => ({
        ...cat.toObject(),
        children: buildTree(cat._id)
      }));
  };
  
  return buildTree();
};

// Ensure virtual fields are serialized
categorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);