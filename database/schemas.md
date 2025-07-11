# Database Schemas for POS System

## Collections Overview

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  email: String, // unique
  password: String, // hashed
  firstName: String,
  lastName: String,
  role: String, // 'business_owner', 'staff', 'admin'
  businessId: ObjectId, // reference to business
  permissions: [String], // role-based permissions
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. Businesses Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  owner: ObjectId, // reference to user
  subscriptionStatus: String, // 'active', 'inactive', 'suspended'
  subscriptionPlan: String, // 'basic', 'premium', 'enterprise'
  subscriptionExpiry: Date,
  settings: {
    currency: String,
    timezone: String,
    receiptTemplate: String,
    taxRate: Number
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Shops Collection
```javascript
{
  _id: ObjectId,
  name: String,
  businessId: ObjectId, // reference to business
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  phone: String,
  manager: ObjectId, // reference to user
  settings: {
    openingTime: String,
    closingTime: String,
    workingDays: [String]
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Categories Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  businessId: ObjectId, // reference to business
  shopId: ObjectId, // reference to shop (optional)
  parentCategory: ObjectId, // for subcategories
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. Products Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  sku: String, // unique per business
  barcode: String,
  businessId: ObjectId, // reference to business
  categoryId: ObjectId, // reference to category
  pricing: {
    retailPrice: Number,
    wholesalePrice: Number,
    cost: Number
  },
  inventory: [{
    shopId: ObjectId, // reference to shop
    quantity: Number,
    minStock: Number,
    maxStock: Number
  }],
  images: [String], // image URLs
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 6. Sales Collection
```javascript
{
  _id: ObjectId,
  saleNumber: String, // unique sale identifier
  businessId: ObjectId, // reference to business
  shopId: ObjectId, // reference to shop
  cashier: ObjectId, // reference to user
  customer: {
    name: String,
    phone: String,
    email: String
  },
  items: [{
    productId: ObjectId, // reference to product
    name: String,
    sku: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  totals: {
    subtotal: Number,
    tax: Number,
    discount: Number,
    total: Number
  },
  payment: {
    method: String, // 'cash', 'card', 'credit'
    status: String, // 'paid', 'pending', 'partial'
    paidAmount: Number,
    changeAmount: Number
  },
  status: String, // 'completed', 'refunded', 'voided'
  receiptPrinted: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Inventory Movements Collection
```javascript
{
  _id: ObjectId,
  productId: ObjectId, // reference to product
  shopId: ObjectId, // reference to shop
  businessId: ObjectId, // reference to business
  type: String, // 'sale', 'purchase', 'adjustment', 'transfer'
  quantity: Number, // positive for inbound, negative for outbound
  previousStock: Number,
  newStock: Number,
  reference: {
    type: String, // 'sale', 'purchase_order', 'manual'
    id: ObjectId // reference to sale, purchase order, etc.
  },
  user: ObjectId, // reference to user who made the change
  notes: String,
  createdAt: Date
}
```

### 8. Staff Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // reference to user
  businessId: ObjectId, // reference to business
  shopId: ObjectId, // reference to shop (if shop-specific)
  position: String,
  permissions: [String],
  salary: Number,
  commissionRate: Number,
  hireDate: Date,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 9. Subscriptions Collection
```javascript
{
  _id: ObjectId,
  businessId: ObjectId, // reference to business
  plan: String, // 'basic', 'premium', 'enterprise'
  status: String, // 'active', 'cancelled', 'past_due'
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  pricing: {
    amount: Number,
    currency: String,
    interval: String // 'monthly', 'yearly'
  },
  stripeSubscriptionId: String,
  stripeCustomerId: String,
  paymentHistory: [{
    amount: Number,
    status: String,
    paidAt: Date,
    stripePaymentId: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 10. Reports Collection
```javascript
{
  _id: ObjectId,
  businessId: ObjectId, // reference to business
  shopId: ObjectId, // reference to shop (optional)
  type: String, // 'daily_sales', 'inventory', 'staff_performance'
  dateRange: {
    start: Date,
    end: Date
  },
  data: Object, // report-specific data structure
  generatedBy: ObjectId, // reference to user
  createdAt: Date
}
```

### 11. Expenses Collection
```javascript
{
  _id: ObjectId,
  businessId: ObjectId, // reference to business
  shopId: ObjectId, // reference to shop
  category: String, // 'rent', 'utilities', 'supplies', 'other'
  description: String,
  amount: Number,
  date: Date,
  receipt: String, // file URL
  recordedBy: ObjectId, // reference to user
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes for Performance

### Users Collection
- `{ email: 1 }` - unique
- `{ businessId: 1, role: 1 }`

### Products Collection
- `{ businessId: 1, sku: 1 }` - unique
- `{ businessId: 1, categoryId: 1 }`
- `{ barcode: 1 }`

### Sales Collection
- `{ businessId: 1, createdAt: -1 }`
- `{ shopId: 1, createdAt: -1 }`
- `{ cashier: 1, createdAt: -1 }`

### Inventory Movements Collection
- `{ productId: 1, createdAt: -1 }`
- `{ shopId: 1, createdAt: -1 }`

## Data Relationships

1. **Users** belong to **Businesses**
2. **Businesses** have multiple **Shops**
3. **Products** belong to **Businesses** and **Categories**
4. **Sales** are made at **Shops** by **Staff** (Users)
5. **Inventory** is tracked per **Shop** per **Product**
6. **Subscriptions** are linked to **Businesses**