# PetPooja Style POS - Database Schema Documentation

## Overview
This document outlines the database schema for the PetPooja-style POS billing system. Currently using localStorage, this can be migrated to any backend database (Supabase, PostgreSQL, MongoDB, etc.).

---

## Database Tables/Collections

### 1. Users Table
Stores shop owner/vendor information.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- Hashed
  name VARCHAR(255) NOT NULL,
  shop_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  gst_number VARCHAR(50),
  shop_logo TEXT, -- URL to logo image
  tax_rate DECIMAL(5,2) DEFAULT 5.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Fields:**
- `id`: Unique user identifier
- `email`: Login email (unique)
- `password`: Encrypted password
- `name`: Owner's name
- `shop_name`: Business name
- `phone`: Contact number
- `address`: Shop address
- `gst_number`: GST registration number (optional)
- `shop_logo`: Logo URL for invoices
- `tax_rate`: Default GST rate percentage
- `created_at`, `updated_at`: Timestamps

---

### 2. Products Table
Stores product information with support for unit-based and weight-based items.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('unit', 'weight')),
  unit VARCHAR(10), -- kg, g, ltr, ml (for weight-based)
  quantity DECIMAL(10,2), -- Reference quantity for weight-based
  stock INTEGER NOT NULL DEFAULT 0,
  barcode VARCHAR(100),
  image TEXT, -- URL to product image
  gst_rate DECIMAL(5,2) DEFAULT 5.00,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_barcode ON products(barcode);
```

**Fields:**
- `id`: Unique product identifier
- `user_id`: Owner of the product
- `name`: Product name
- `category`: Product category (Grocery, Dairy, etc.)
- `price`: Price per unit/kg
- `type`: 'unit' or 'weight'
- `unit`: Measurement unit for weight-based items
- `quantity`: Reference quantity for weight-based
- `stock`: Available stock quantity
- `barcode`: Product barcode
- `gst_rate`: GST percentage for this product

**Important Notes:**
- **Unit-based products**: Price is per item (e.g., ₹35 per bread)
- **Weight-based products**: Price is per kg/ltr (e.g., ₹45 per kg of rice)
  - Vendor can sell any weight: 500g, 150g, 2kg, etc.
  - Price is automatically calculated: (weight in kg) × price

---

### 3. Customers Table
Stores customer information.

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  address TEXT,
  gst_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, mobile)
);

CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_mobile ON customers(mobile);
```

**Fields:**
- `id`: Unique customer identifier
- `user_id`: Shop owner who created this customer
- `name`: Customer name
- `mobile`: Phone number (unique per shop)
- `email`: Email address (optional)
- `address`: Customer address (optional)
- `gst_number`: Customer GST number (optional for B2B)

---

### 4. Sales Table
Stores completed sales/orders.

```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name VARCHAR(255),
  customer_mobile VARCHAR(20),
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'upi')),
  gst_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sales_user_id ON sales(user_id);
CREATE INDEX idx_sales_created_at ON sales(created_at);
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
```

**Fields:**
- `id`: Unique sale identifier
- `user_id`: Shop owner
- `customer_id`: Reference to customer (if registered)
- `customer_name`, `customer_mobile`: Customer info (for walk-ins)
- `subtotal`: Total before discount and tax
- `discount`: Discount amount
- `tax`: GST amount
- `total`: Final amount paid
- `payment_method`: Payment type
- `gst_enabled`: Whether GST was applied to this sale

---

### 5. Sale Items Table
Stores individual items in each sale.

```sql
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL, -- Price per item/kg
  total DECIMAL(10,2) NOT NULL,
  weight DECIMAL(10,2), -- Custom weight for weight-based items
  unit VARCHAR(10), -- Unit for weight-based items
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product_id ON sale_items(product_id);
```

**Fields:**
- `id`: Unique item identifier
- `sale_id`: Parent sale
- `product_id`: Reference to product
- `product_name`: Product name (snapshot)
- `quantity`: Number of items
- `price`: Price per unit (calculated for weight-based)
- `total`: Total price for this line item
- `weight`: Custom weight entered (for weight-based)
- `unit`: Unit of measurement (for weight-based)

**Example Records:**

**Unit-based item:**
```json
{
  "product_name": "Bread",
  "quantity": 2,
  "price": 35.00,
  "total": 70.00,
  "weight": null,
  "unit": null
}
```

**Weight-based items (same product, different weights):**
```json
[
  {
    "product_name": "Rice",
    "quantity": 2,
    "price": 22.50, // Calculated: 500g = 0.5kg × ₹45 = ₹22.50
    "total": 45.00,
    "weight": 500,
    "unit": "g"
  },
  {
    "product_name": "Rice",
    "quantity": 2,
    "price": 6.75, // Calculated: 150g = 0.15kg × ₹45 = ₹6.75
    "total": 13.50,
    "weight": 150,
    "unit": "g"
  }
]
```

---

## Key Features Implementation

### 1. Weight-Based Billing Algorithm

```javascript
// Convert any unit to kg for calculation
function convertToKg(weight, unit) {
  switch (unit) {
    case 'g': return weight / 1000;
    case 'ltr': return weight;
    case 'ml': return weight / 1000;
    case 'kg': 
    default: return weight;
  }
}

// Calculate price for custom weight
function calculatePrice(product, weight, unit) {
  const weightInKg = convertToKg(weight, unit);
  return product.price * weightInKg;
}

// Example:
// Rice: ₹45 per kg
// Vendor sells 500g × 2
// Price per item: 0.5 × 45 = ₹22.50
// Total: ₹22.50 × 2 = ₹45.00
```

### 2. GST Calculation

```javascript
// Per-customer GST toggle
function calculateTax(items, gstEnabled) {
  if (!gstEnabled) return 0;
  
  let totalTax = 0;
  items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    const itemTax = (itemTotal * item.product.gstRate) / 100;
    totalTax += itemTax;
  });
  
  return totalTax;
}

// Each product can have different GST rates
// Example: Groceries (5%), Beverages (12%), etc.
```

### 3. Stock Management

```javascript
// Deduct stock after sale
function updateStock(saleItems) {
  saleItems.forEach(item => {
    const product = getProduct(item.productId);
    product.stock -= item.quantity;
    updateProduct(product);
  });
}

// Weight-based items:
// If Rice has stock of 100 (packages)
// Selling 500g doesn't reduce stock to 99.5
// Stock represents number of sellable packages, not weight
```

---

## API Endpoints (for Backend Implementation)

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Reset password
- `POST /api/auth/logout` - Logout

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/barcode/:code` - Search by barcode

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Add customer
- `PUT /api/customers/:id` - Update customer
- `GET /api/customers/mobile/:mobile` - Search by mobile

### Sales
- `POST /api/sales` - Create sale
- `GET /api/sales` - Get all sales
- `GET /api/sales/:id` - Get sale details
- `GET /api/sales/report?from=DATE&to=DATE` - Sales report

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings

---

## Migration from LocalStorage to Database

### Current Data Storage
```javascript
localStorage.setItem('user', JSON.stringify(user));
localStorage.setItem('products', JSON.stringify(products));
localStorage.setItem('sales', JSON.stringify(sales));
localStorage.setItem('customers', JSON.stringify(customers));
```

### Migration Steps
1. Export data from localStorage
2. Transform to match database schema
3. Import to database using API
4. Update frontend to use API calls instead of localStorage

---

## Security Considerations

1. **Password Hashing**: Use bcrypt/argon2 for password encryption
2. **JWT Tokens**: For authentication
3. **Role-Based Access**: Multi-user support (owner, staff)
4. **Data Validation**: Validate all inputs on backend
5. **Rate Limiting**: Prevent abuse
6. **HTTPS**: Encrypt data in transit
7. **Backup**: Regular database backups

---

## Future Enhancements

1. **Multi-branch Support**: Multiple shop locations
2. **Staff Management**: Employee accounts with permissions
3. **Advanced Reporting**: Sales analytics, profit margins
4. **Loyalty Program**: Customer rewards
5. **Online Orders**: Integration with e-commerce
6. **Supplier Management**: Purchase orders, inventory
7. **Barcode Printing**: Generate product labels
8. **Receipt Customization**: Custom invoice templates

---

## Technology Recommendations

### Backend Options
- **Node.js + Express**: Flexible, JavaScript ecosystem
- **Supabase**: PostgreSQL with real-time features
- **Firebase**: Real-time database, authentication
- **Django/FastAPI**: Python backend

### Database Options
- **PostgreSQL**: Robust, ACID compliant
- **MySQL**: Wide support
- **MongoDB**: NoSQL flexibility

### Deployment
- **Vercel/Netlify**: Frontend hosting
- **Heroku/Railway**: Backend hosting
- **AWS/GCP/Azure**: Enterprise solutions

---

## Support

For backend implementation assistance, contact your development team or refer to the respective database documentation.

**Current Version**: 2.0.0  
**Last Updated**: 2026-01-21
