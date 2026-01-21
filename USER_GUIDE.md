# PetPooja POS - User Guide

## 🎯 Complete Feature List

### ✅ Authentication & Security
- **Sign Up** with complete details:
  - Owner Name
  - Shop Name
  - Phone Number
  - Shop Address
  - GST Number (optional)
  - Email & Password
- **Login** with email and password
- **Forgot Password** - Reset password functionality
- **Secure Logout**

### ✅ Dashboard
- Today's revenue with percentage change
- Total orders comparison (today vs yesterday)
- Product count and inventory alerts
- 7-day sales trend (Line chart)
- 7-day orders trend (Bar chart)
- Top 5 selling products
- Payment method distribution (Pie chart)
- Low stock and out-of-stock alerts

### ✅ Advanced POS Billing System

#### Product Display
- **Category Navigation** - Quick filter by category
- **Search** - Product name or barcode search
- **View Modes** - Grid or List view
- **Stock Status** - Real-time stock display

#### Unit-Based Products
- Simple click to add
- Example: Bread × 2, Soap × 5
- Direct price calculation

#### Weight-Based Products (ADVANCED) ⭐
- **Same Product, Multiple Weights**
  - Example: Rice 500g × 2 + Rice 150g × 2
- **Automatic Price Calculation**
  - Vendor enters: 500g
  - System calculates: (500g ÷ 1000) × ₹45/kg = ₹22.50
  - For quantity 2: ₹22.50 × 2 = ₹45.00
- **Supported Units**:
  - Kilogram (kg)
  - Gram (g)
  - Liter (ltr)
  - Milliliter (ml)
- **Smart Unit Conversion**
  - All units converted to kg/ltr for calculation
  - Example: 500g = 0.5kg, 250ml = 0.25ltr

#### Cart Management
- Add/remove items
- Adjust quantities
- View item details
- Weight information display

#### Customer Details
- Customer Name
- Mobile Number
- Auto-save customer database

#### Billing Options
- **Discount** - Percentage-based discount
- **GST Toggle** - Enable/disable per customer ⭐
  - Business customer: GST enabled
  - Retail customer: GST disabled
- **Multiple Payment Methods**:
  - Cash
  - Card
  - UPI

#### GST Calculation
- Per-product GST rates
- Automatic tax calculation
- Weighted average for multiple items
- Clear GST breakdown on invoice

#### Invoice/Bill
- Professional 80mm thermal receipt format
- Shop details with GST number
- Customer information
- Itemized list with quantities
- **Weight details for each item** ⭐
- Subtotal, discount, GST, and total
- Payment method
- Barcode for bill tracking
- Print functionality

### ✅ Product Management
- **Add Products** with:
  - Product Name
  - Category
  - Price (per unit or per kg)
  - Product Type (Unit/Weight)
  - Weight/Volume (for weight-based)
  - Unit (kg, g, ltr, ml)
  - Stock Quantity
  - Barcode
  - GST Rate (per product) ⭐
- **Edit Products** - Update any details
- **Delete Products** - Remove items
- **Search & Filter** - Find products quickly
- **Grid/List View** - Choose display preference
- **Stock Status** - Color-coded indicators
  - Green: In stock (10+)
  - Yellow: Low stock (1-9)
  - Red: Out of stock (0)

### ✅ Inventory Management
- **Total Inventory Value** - Current stock worth
- **Stock Categories**:
  - In Stock (10+ items)
  - Low Stock (1-9 items)
  - Out of Stock (0 items)
- **Detailed Tables**:
  - Low stock alerts with quantities
  - Out of stock items list
- **Automatic Stock Updates** - After each sale

### ✅ Orders History
- Complete order list
- Order ID with barcode reference
- Date and time
- Customer information
- Items count
- Payment method
- Total amount
- Sortable by date

### ✅ Reports & Analytics
- **Date Range Selection**:
  - Last 7 days
  - Last 30 days
  - Last 90 days
- **Key Metrics**:
  - Total Revenue
  - Total Orders
  - Average Order Value
  - Total Discounts Given
- **Visual Charts**:
  - Revenue trend (Line chart)
  - Orders trend (Bar chart)
- **Performance Tracking** - Day-by-day breakdown

### ✅ Settings
- **Edit Account Information**:
  - Owner Name
  - Shop Name
  - Phone Number
  - Shop Address
  - GST Number
  - Default Tax Rate
- **Business Statistics**:
  - Total Products
  - Total Sales
  - Total Customers
- **Feature Status** - Active features list
- **App Information** - Version and storage details

---

## 🚀 How to Use

### First Time Setup

1. **Sign Up**
   - Click "Create Account"
   - Fill in all required details:
     - Your Name
     - Shop Name
     - Phone Number
     - Shop Address
     - GST Number (if applicable)
     - Email
     - Password (minimum 6 characters)
   - Click "Create Account"

2. **Add Products**
   - Go to "Products" section
   - Click "Add Product"
   - For Unit-Based (e.g., Bread, Soap):
     - Enter name, category, price per piece
     - Select "Unit Based"
     - Set stock quantity
   - For Weight-Based (e.g., Rice, Oil):
     - Enter name, category, price per kg/ltr
     - Select "Weight Based"
     - Choose unit (kg, g, ltr, ml)
     - Set stock quantity
   - Add GST rate (default 5%)
   - Click "Add Product"

### Daily Operations

#### Making a Sale

1. **Go to Billing/POS**
   - Click "Billing / POS" in sidebar

2. **Select Products**
   - Click category to filter
   - Or search by name/barcode
   - Click on product to add

3. **For Weight-Based Products**:
   - Modal opens automatically
   - Enter weight (e.g., 500)
   - Select unit (g, kg, ltr, ml)
   - Enter quantity (how many items)
   - See auto-calculated price
   - Click "Add to Cart"
   
   **Example Scenario:**
   ```
   Customer wants:
   - 500g rice (2 packets)
   - 150g rice (3 packets)
   - 1kg rice (1 packet)
   
   Process:
   1. Click "Rice"
   2. Enter "500" g, quantity 2 → Adds ₹45.00
   3. Click "Rice" again
   4. Enter "150" g, quantity 3 → Adds ₹20.25
   5. Click "Rice" again
   6. Enter "1" kg, quantity 1 → Adds ₹45.00
   
   Cart shows all 3 entries separately!
   ```

4. **For Unit-Based Products**:
   - Click product
   - Automatically adds 1 item
   - Adjust quantity with +/- buttons

5. **Add Customer Details** (Optional)
   - Enter customer name
   - Enter mobile number
   - Saved for future reference

6. **Apply Discount** (Optional)
   - Enter discount percentage
   - Applied to subtotal

7. **GST Toggle** ⭐
   - **Enabled (Green)**: For businesses with GST
   - **Disabled (Gray)**: For retail customers
   - Toggle before checkout

8. **Select Payment Method**
   - Cash / Card / UPI

9. **Complete Sale**
   - Click "Pay ₹XXX.XX"
   - Sale completed
   - Click "Print Bill" for receipt

#### Viewing Reports

1. **Dashboard** - Quick overview
2. **Reports** - Detailed analysis
   - Select date range
   - View metrics and charts
3. **Orders** - Individual order details

#### Managing Stock

1. **Inventory** - Check stock status
2. **Products** - Add/edit/delete items
3. **Low Stock Alerts** - Restock notifications

---

## 💡 Pro Tips

### Weight-Based Billing Best Practices

1. **Price Setting**
   - Always set price per kg/ltr
   - Example: Rice ₹45 per kg, Oil ₹120 per ltr

2. **Common Conversions**
   - 500g = 0.5kg
   - 250g = 0.25kg
   - 100g = 0.1kg
   - 750ml = 0.75ltr

3. **Selling Mixed Weights**
   - Same product can be added multiple times
   - Each with different weight
   - Perfect for bulk + retail sales

### GST Management

1. **Per-Customer Toggle**
   - Wholesale/Business: GST ON
   - Retail/Walk-in: GST OFF
   - Toggle before checkout

2. **Per-Product Rates**
   - Set different rates for different categories
   - Common rates: 5%, 12%, 18%, 28%

### Inventory Tips

1. **Regular Updates**
   - Check inventory daily
   - Restock low items
   - Remove discontinued products

2. **Stock Represents Packages**
   - For weight-based: Stock = number of sellable units
   - Not total weight

---

## 📊 Sample Workflow

### Complete Sale Example

**Customer Order:**
- 500g Rice × 2
- 150g Rice × 2  
- 2 Bread
- 1 Milk (1 ltr)
- Apply 10% discount
- Payment: UPI
- GST: Enabled

**Process:**
1. Go to Billing
2. Enter customer: "John Doe", "9876543210"
3. Click "Rice" → 500g, qty 2 → ₹45.00
4. Click "Rice" → 150g, qty 2 → ₹13.50
5. Click "Bread" → Auto adds, increase to 2 → ₹70.00
6. Click "Milk" → 1ltr, qty 1 → ₹60.00
7. Enter discount: 10%
8. Ensure GST is enabled (green)
9. Select UPI
10. Click "Pay ₹XXX.XX"
11. Print Bill

**Bill Shows:**
```
Rice (500g each)     2    22.50    45.00
Rice (150g each)     2     6.75    13.50
Bread                2    35.00    70.00
Milk (1ltr each)     1    60.00    60.00
----------------------------------------
Subtotal:                          188.50
Discount (10%):                    -18.85
GST:                                 8.48
----------------------------------------
TOTAL:                             178.13
```

---

## 🔒 Data Storage

**Current**: Local Browser Storage
- All data stored on your device
- Private and secure
- No internet required after initial load

**For Production**: See DATABASE_SCHEMA.md
- Backend integration guide
- Multi-device support
- Cloud backup

---

## ❓ Troubleshooting

### Common Issues

1. **Product not adding to cart**
   - Check if stock is available
   - Verify product is not out of stock

2. **Weight calculation seems wrong**
   - Ensure correct unit selected
   - Remember: price is per kg/ltr
   - Example: 500g of ₹45/kg = ₹22.50

3. **GST not calculating**
   - Check if GST toggle is enabled
   - Verify product GST rate is set

4. **Print not working**
   - Allow print popup in browser
   - Check printer connection
   - Try different browser

### Data Management

**Backup Data:**
- Browser Developer Console
- localStorage.getItem('products')
- Copy JSON for backup

**Clear Data:**
- Settings → Browser → Clear Site Data
- Or use browser's developer tools

---

## 🎓 Training Tips

### For New Users

1. **Start with Products**
   - Add 5-10 sample products
   - Mix unit and weight-based items

2. **Practice Billing**
   - Create test sales
   - Try different weights
   - Test GST toggle

3. **Check Reports**
   - View dashboard daily
   - Monitor inventory weekly

### For Teams

1. **One Admin Account** (current version)
2. **Document Processes**
3. **Regular Training Sessions**
4. **Daily Reconciliation**

---

## 📞 Support

For technical support or feature requests, refer to the application settings or contact your system administrator.

**Version**: 2.0.0  
**Last Updated**: January 21, 2026

---

## 🎉 You're Ready!

Start billing with the most advanced POS system designed for retail shops!

**Key Advantages:**
✓ Sell same product in multiple weights
✓ Automatic price calculation
✓ Per-customer GST control
✓ Complete inventory management
✓ Detailed reports and analytics
✓ Professional invoices
✓ Easy to use interface
