# 🔐 Role-Based Feature Access Matrix

## **User Roles in the POS System**

### **1. Admin (Super User)**
- **Role:** `admin`
- **Access Level:** Full system access
- **Permissions:** All permissions granted

### **2. Business Owner**
- **Role:** `business_owner`
- **Access Level:** Full business management
- **Permissions:** All business-related operations

### **3. Staff/Employee**
- **Role:** `staff`
- **Access Level:** Limited operational access
- **Permissions:** Based on assigned permissions array

---

## **📋 Feature Access by Role**

### **🔐 Authentication & Security**

| Feature | Admin | Business Owner | Staff |
|---------|--------|----------------|--------|
| Login/Logout | ✅ | ✅ | ✅ |
| Multi-Factor Authentication | ✅ | ✅ | ✅ |
| Password Reset | ✅ | ✅ | ✅ |
| Account Settings | ✅ | ✅ | ✅ |

### **📊 Dashboard & Analytics**

| Feature | Admin | Business Owner | Staff |
|---------|--------|----------------|--------|
| Dashboard Overview | ✅ | ✅ | ✅ |
| Advanced Reports | ✅ | ✅ | 📋 `view_reports` |
| Sales Analytics | ✅ | ✅ | 📋 `view_reports` |
| Export Data | ✅ | ✅ | 📋 `export_data` |

### **💰 Sales & POS**

| Feature | Admin | Business Owner | Staff |
|---------|--------|----------------|--------|
| Process Sales | ✅ | ✅ | ✅ |
| Cash Payments | ✅ | ✅ | ✅ |
| Card Payments | ✅ | ✅ | ✅ |
| Credit Sales | ✅ | ✅ | 📋 `process_credit_sales` |
| Void/Refund Sales | ✅ | ✅ | 📋 `void_sales` |
| View Sales History | ✅ | ✅ | 📋 `view_sales` |

### **📦 Product Management**

| Feature | Admin | Business Owner | Staff |
|---------|--------|----------------|--------|
| View Products | ✅ | ✅ | ✅ |
| Add Products | ✅ | ✅ | 📋 `manage_products` |
| Edit Products | ✅ | ✅ | 📋 `manage_products` |
| Delete Products | ✅ | ✅ | 📋 `manage_products` |
| Bulk Import/Export | ✅ | ✅ | 📋 `manage_products` |
| Product Categories | ✅ | ✅ | 📋 `manage_categories` |

### **📋 Inventory Management**

| Feature | Admin | Business Owner | Staff |
|---------|--------|----------------|--------|
| View Inventory | ✅ | ✅ | ✅ |
| Stock Adjustments | ✅ | ✅ | 📋 `manage_inventory` |
| Low Stock Alerts | ✅ | ✅ | ✅ |
| Inventory Reports | ✅ | ✅ | 📋 `view_inventory_reports` |
| Stock History | ✅ | ✅ | 📋 `view_stock_history` |

### **🏭 Supplier Management**

| Feature | Admin | Business Owner | Staff |
|---------|--------|----------------|--------|
| View Suppliers | ✅ | ✅ | 📋 `view_suppliers` |
| Add Suppliers | ✅ | ✅ | 📋 `manage_suppliers` |
| Edit Suppliers | ✅ | ✅ | 📋 `manage_suppliers` |
| Delete Suppliers | ✅ | ✅ | 📋 `manage_suppliers` |
| Supplier Reports | ✅ | ✅ | 📋 `view_supplier_reports` |

### **📄 Purchase Orders**

| Feature | Admin | Business Owner | Staff |
|---------|--------|----------------|--------|
| View Purchase Orders | ✅ | ✅ | 📋 `view_purchase_orders` |
| Create Purchase Orders | ✅ | ✅ | 📋 `create_purchase_orders` |
| Edit Purchase Orders | ✅ | ✅ | 📋 `manage_purchase_orders` |
| Approve Purchase Orders | ✅ | ✅ | 📋 `approve_purchase_orders` |
| Receive Orders | ✅ | ✅ | 📋 `receive_orders` |

### **💳 Credit Sales Management**

| Feature | Admin | Business Owner | Staff |
|---------|--------|----------------|--------|
| View Credit Sales | ✅ | ✅ | 📋 `view_credit_sales` |
| Process Credit Sales | ✅ | ✅ | 📋 `process_credit_sales` |
| Record Payments | ✅ | ✅ | 📋 `record_payments` |
| Credit Reports | ✅ | ✅ | 📋 `view_credit_reports` |
| Customer Credit Limits | ✅ | ✅ | 📋 `manage_credit_limits` |

### **👥 Customer Management**

| Feature | Admin | Business Owner | Staff |
|---------|--------|----------------|--------|
| View Customers | ✅ | ✅ | ✅ |
| Add Customers | ✅ | ✅ | 📋 `manage_customers` |
| Edit Customers | ✅ | ✅ | 📋 `manage_customers` |
| Delete Customers | ✅ | ✅ | 📋 `manage_customers` |
| Customer Reports | ✅ | ✅ | 📋 `view_customer_reports` |

### **👤 User & Staff Management**

| Feature | Admin | Business Owner | Staff |
|---------|--------|----------------|--------|
| View Staff | ✅ | ✅ | ❌ |
| Add Staff | ✅ | ✅ | ❌ |
| Edit Staff | ✅ | ✅ | ❌ |
| Delete Staff | ✅ | ✅ | ❌ |
| Assign Permissions | ✅ | ✅ | ❌ |
| Staff Reports | ✅ | ✅ | ❌ |

### **⚙️ System Settings**

| Feature | Admin | Business Owner | Staff |
|---------|--------|----------------|--------|
| Business Settings | ✅ | ✅ | ❌ |
| Payment Methods | ✅ | ✅ | ❌ |
| Tax Settings | ✅ | ✅ | ❌ |
| Receipt Templates | ✅ | ✅ | ❌ |
| System Configuration | ✅ | ❌ | ❌ |
| Database Backup | ✅ | ❌ | ❌ |

---

## **🔑 Permission-Based Access Control**

### **Staff Permission System**

Staff users require specific permissions in their profile:

```typescript
// Example Staff User Permissions
{
  "role": "staff",
  "permissions": [
    "view_products",
    "manage_inventory", 
    "process_credit_sales",
    "view_reports",
    "manage_customers"
  ]
}
```

### **Available Permissions List**

```typescript
// Product Permissions
"view_products"
"manage_products"
"manage_categories"

// Inventory Permissions  
"view_inventory"
"manage_inventory"
"view_stock_history"
"view_inventory_reports"

// Sales Permissions
"view_sales"
"process_credit_sales"
"void_sales"
"record_payments"

// Customer Permissions
"view_customers" 
"manage_customers"
"manage_credit_limits"
"view_customer_reports"

// Supplier Permissions
"view_suppliers"
"manage_suppliers"
"view_supplier_reports"

// Purchase Order Permissions
"view_purchase_orders"
"create_purchase_orders"
"manage_purchase_orders"
"approve_purchase_orders"
"receive_orders"

// Report Permissions
"view_reports"
"view_credit_reports"
"export_data"

// Staff Management (Business Owner only)
"manage_staff"
"assign_permissions"
```

---

## **🧪 Testing Different Roles**

### **Test Admin Access:**
```bash
Email: admin@example.com
Password: admin123
# Full system access
```

### **Test Business Owner:**
```bash
Email: owner@business.com  
Password: password123
# Full business operations
```

### **Test Staff Member:**
```bash
Email: staff@business.com
Password: password123
# Limited access based on permissions
```

---

## **🔐 Implementation Details**

### **Middleware Protection:**

```typescript
// Backend Route Protection
router.post('/', verifyToken, requirePermission('manage_products'), createProduct);
router.patch('/stock', verifyToken, requirePermission('manage_inventory'), updateStock);
router.get('/credit-sales', verifyToken, requirePermission('view_credit_sales'), getCreditSales);
```

### **Frontend Route Guards:**

```typescript
// Component-level permission checks
{hasPermission('manage_inventory') && (
  <Button onClick={openStockAdjustment}>
    Adjust Stock
  </Button>
)}
```

### **Role Hierarchy:**

1. **Admin** - Complete system control
2. **Business Owner** - Full business operations  
3. **Staff** - Permission-based limited access

---

## **📱 Access URLs by Role**

### **Common Access (All Roles)**
- Dashboard: `http://localhost:5173/dashboard`
- Sales/POS: `http://localhost:5173/sales`
- Products (View): `http://localhost:5173/products`
- Customers (View): `http://localhost:5173/customers`

### **Admin & Business Owner Only**
- Inventory Management: `http://localhost:5173/inventory`
- Supplier Management: `http://localhost:5173/suppliers`
- Purchase Orders: `http://localhost:5173/purchase-orders`
- Credit Sales: `http://localhost:5173/credit-sales`
- Advanced Reports: `http://localhost:5173/reports`
- MFA Settings: `http://localhost:5173/settings/mfa`
- System Settings: `http://localhost:5173/settings`

### **Permission-Based Access (Staff)**
- Access depends on assigned permissions in user profile
- UI elements appear/disappear based on permissions
- API endpoints protected by permission middleware

---

## **🛡️ Security Features**

### **Authentication**
- JWT token-based authentication
- Multi-factor authentication support
- Session management
- Password encryption

### **Authorization**
- Role-based access control (RBAC)
- Permission-based feature access
- Route-level protection
- Component-level permission checks

### **Audit Trail**
- User action logging
- Access attempt tracking
- Permission change logs
- System activity monitoring

---

## **🔧 Configuration**

### **Adding New Permissions**

1. Define permission in types:
```typescript
// Add to permissions enum
"new_permission_name"
```

2. Add middleware protection:
```typescript
router.get('/endpoint', verifyToken, requirePermission('new_permission_name'), controller);
```

3. Add frontend permission check:
```typescript
{hasPermission('new_permission_name') && (
  <ComponentToShow />
)}
```

### **Creating New Roles**

1. Update user model:
```typescript
role: {
  type: String,
  enum: ['business_owner', 'staff', 'admin', 'new_role'],
  default: 'business_owner'
}
```

2. Update role hierarchy in middleware
3. Define default permissions for new role

---

This comprehensive role-based system ensures proper security and access control throughout the entire POS application, allowing businesses to safely delegate responsibilities while maintaining security and audit trails.