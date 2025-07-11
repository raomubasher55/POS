# POS System API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Authentication Endpoints

### POST /auth/register
Register a new business and owner account.

**Request Body:**
```json
{
  "email": "owner@business.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "businessName": "My Business",
  "businessEmail": "contact@business.com",
  "businessPhone": "+1234567890",
  "businessAddress": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country"
  }
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "user": { "id": "...", "email": "...", "role": "business_owner" },
  "business": { "id": "...", "name": "...", "subscriptionStatus": "trial" },
  "tokens": { "accessToken": "...", "refreshToken": "..." }
}
```

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@business.com",
  "password": "password123"
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "..."
}
```

### POST /auth/logout
Logout and invalidate refresh token (requires authentication).

### GET /auth/profile
Get current user profile (requires authentication).

## Business Management Endpoints

### GET /businesses/:id
Get business details (requires authentication and business access).

### PUT /businesses/:id
Update business information (requires authentication and business owner role).

### GET /businesses/:id/settings
Get business settings.

### PUT /businesses/:id/settings
Update business settings.

## Product Management Endpoints

### GET /products
Get products for the authenticated user's business.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search by name or SKU
- `category` (string): Filter by category ID
- `isActive` (boolean): Filter by active status

### POST /products
Create a new product (requires authentication).

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "sku": "PROD-001",
  "barcode": "123456789",
  "categoryId": "category_id",
  "pricing": {
    "retailPrice": 29.99,
    "wholesalePrice": 19.99,
    "cost": 15.00
  },
  "inventory": [{
    "shopId": "shop_id",
    "quantity": 100,
    "minStock": 10,
    "maxStock": 500
  }]
}
```

### GET /products/:id
Get specific product details.

### PUT /products/:id
Update product information.

### DELETE /products/:id
Delete a product (soft delete).

### PUT /products/:id/inventory
Update product inventory for specific shop.

## Category Management Endpoints

### GET /categories
Get categories for the authenticated user's business.

### POST /categories
Create a new category.

**Request Body:**
```json
{
  "name": "Category Name",
  "description": "Category description",
  "parentCategory": "parent_category_id" // optional
}
```

### PUT /categories/:id
Update category information.

### DELETE /categories/:id
Delete a category.

## Sales Management Endpoints

### GET /sales
Get sales for the authenticated user's business.

**Query Parameters:**
- `page`, `limit`: Pagination
- `shopId`: Filter by shop
- `cashier`: Filter by cashier
- `startDate`, `endDate`: Date range filter
- `status`: Filter by sale status

### POST /sales
Create a new sale.

**Request Body:**
```json
{
  "shopId": "shop_id",
  "customer": {
    "name": "Customer Name",
    "phone": "+1234567890",
    "email": "customer@email.com"
  },
  "items": [{
    "productId": "product_id",
    "quantity": 2,
    "unitPrice": 29.99
  }],
  "payment": {
    "method": "cash",
    "paidAmount": 65.00
  }
}
```

### GET /sales/:id
Get specific sale details.

### PUT /sales/:id/refund
Process a refund for a sale.

### PUT /sales/:id/void
Void a sale.

## Shop Management Endpoints

### GET /shops
Get shops for the authenticated user's business.

### POST /shops
Create a new shop (requires business owner role).

**Request Body:**
```json
{
  "name": "Shop Name",
  "address": {
    "street": "456 Shop St",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country"
  },
  "phone": "+1234567890",
  "settings": {
    "openingTime": "09:00",
    "closingTime": "18:00",
    "workingDays": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  }
}
```

### GET /shops/:id
Get specific shop details.

### PUT /shops/:id
Update shop information.

## Staff Management Endpoints

### GET /staff
Get staff members for the authenticated user's business.

### POST /staff
Add a new staff member (requires business owner or manager role).

**Request Body:**
```json
{
  "email": "staff@business.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "position": "Cashier",
  "shopId": "shop_id", // optional
  "permissions": ["sales", "inventory_view"],
  "salary": 3000,
  "commissionRate": 2.5
}
```

### GET /staff/:id
Get specific staff member details.

### PUT /staff/:id
Update staff member information.

### DELETE /staff/:id
Remove staff member (soft delete).

## Reporting Endpoints

### GET /reports/sales
Get sales reports.

**Query Parameters:**
- `startDate`, `endDate`: Date range
- `shopId`: Specific shop
- `groupBy`: Group by 'day', 'week', 'month'

### GET /reports/inventory
Get inventory reports.

### GET /reports/staff-performance
Get staff performance reports.

### GET /reports/financial
Get financial summary reports.

## Subscription Management Endpoints

### GET /subscriptions/:businessId
Get subscription details for a business.

### PUT /subscriptions/:businessId/upgrade
Upgrade subscription plan.

### PUT /subscriptions/:businessId/cancel
Cancel subscription.

## Admin Endpoints (Admin role required)

### GET /admin/businesses
Get all businesses (with pagination and filters).

### PUT /admin/businesses/:id/status
Update business status (activate/suspend).

### GET /admin/analytics
Get platform-wide analytics.

### GET /admin/subscriptions
Get all subscription data.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "message": "Error description",
  "code": "ERROR_CODE", // optional
  "errors": [ // for validation errors
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

- 100 requests per 15 minutes per IP for `/api/*` endpoints
- Authentication endpoints may have stricter limits

## Data Formats

- All dates are in ISO 8601 format
- All monetary values are in decimal format (e.g., 29.99)
- All timestamps include timezone information