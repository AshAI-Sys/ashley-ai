# Ashley AI - Complete User Guide

## Manufacturing ERP System - Gabay sa Paggamit

**Last Updated**: November 7, 2025
**System Version**: Production Ready
**Website**: https://ash.vercel.app

---

## 📖 TABLE OF CONTENTS

1. [Getting Started](#getting-started)
2. [Creating Your Account](#creating-your-account)
3. [Dashboard Overview](#dashboard-overview)
4. [Core Features](#core-features)
5. [Manufacturing Workflow](#manufacturing-workflow)
6. [Common Tasks](#common-tasks)
7. [Troubleshooting](#troubleshooting)
8. [Support](#support)

---

## 🚀 GETTING STARTED

### System Requirements

- **Browser**: Google Chrome, Firefox, Safari, or Edge (latest version)
- **Internet**: Stable internet connection
- **Device**: Desktop, laptop, tablet, or mobile phone

### Accessing the System

1. Open your web browser
2. Go to: **https://ash.vercel.app**
3. You'll see the login page

---

## 👤 CREATING YOUR ACCOUNT

### First Time Setup

1. **Go to Registration Page**
   - Visit: https://ash.vercel.app/register
   - Or click "Register" on the login page

2. **Fill in Company Information**

   ```
   Workspace Name: Your Company Name (e.g., "ABC Manufacturing")
   Workspace Slug: your-company (lowercase, no spaces)
   ```

3. **Fill in Your Information**

   ```
   Email: yourname@company.com
   Password: (Min 8 characters, 1 uppercase, 1 number, 1 special character)
   Confirm Password: (Same as above)
   First Name: Your First Name
   Last Name: Your Last Name
   ```

4. **Optional Company Details**

   ```
   Company Address: Your full address
   Company Phone: Contact number
   ```

5. **Click "Create Account"**
   - You'll see a success message
   - Check your email for verification (in production)
   - In development mode, you can log in immediately

### Logging In

1. Go to https://ash.vercel.app/login
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to the Dashboard

---

## 📊 DASHBOARD OVERVIEW

The dashboard shows real-time statistics:

### Key Metrics

- **Active Orders**: Current production orders
- **Pending Approvals**: Designs waiting for client approval
- **Production Units**: Items currently in production
- **Deliveries Today**: Scheduled shipments

### Quick Actions

- Create New Order
- Add Client
- View Production Status
- Check Deliveries

---

## 🎯 CORE FEATURES

### 1. CLIENT MANAGEMENT

**How to Add a New Client:**

1. Click "Clients" in the sidebar
2. Click "+ New Client" button
3. Fill in client information:
   - Name (required)
   - Email
   - Phone
   - Address
   - Contact Person
4. Click "Create Client"

**How to View Client Details:**

1. Go to Clients page
2. Click on any client name
3. You'll see:
   - Client information
   - Order history
   - Brands
   - Contact details

### 2. ORDER MANAGEMENT

**How to Create a New Order:**

1. Click "Orders" → "+ New Order"
2. **Step 1: Basic Info**
   - Select Client
   - Select Brand
   - Enter PO Number (optional)
   - Choose Order Type (NEW or REORDER)
3. **Step 2: Product Details**
   - Design Name
   - Garment Type (T-shirt, Polo, etc.)
   - Fabric Type (Cotton, Polyester, etc.)
   - Quantity
   - Size Distribution
4. **Step 3: Print Details**
   - Print Method (Silkscreen, DTF, Sublimation, etc.)
   - Print Locations (Front, Back, Sleeves, etc.)
   - Specify dimensions
5. **Step 4: Color Variants** (if applicable)
   - Add colors
   - Specify quantities per color
6. **Step 5: Add-ons** (optional)
   - Custom Neck Tags (₱12/pc)
   - Custom Size Labels (₱8/pc)
   - Custom Care Labels (₱6/pc)
7. Click "Create Order"

**Order Statuses:**

- `PENDING` - Just created, not started
- `IN_PRODUCTION` - Currently being manufactured
- `QUALITY_CHECK` - Under inspection
- `COMPLETED` - Finished, ready for delivery
- `DELIVERED` - Sent to client

### 3. DESIGN APPROVAL

**How to Upload Designs for Approval:**

1. Go to Orders → Select Order → "Design" tab
2. Click "Upload Design"
3. Select design file (JPG, PNG, PDF)
4. Add notes/comments
5. Click "Send for Approval"

**How Clients Approve Designs:**

- Clients receive email with approval link
- They can approve or request changes
- You'll see status update in real-time

### 4. PRODUCTION MANAGEMENT

#### CUTTING OPERATIONS

1. Go to "Cutting" page
2. Create Lay:
   - Select Order
   - Specify fabric details
   - Enter marker dimensions
   - Number of plies
3. Generate Bundles (with QR codes)
4. Track cutting progress

#### PRINTING OPERATIONS

1. Go to "Printing" page
2. Create Print Run:
   - Select Order
   - Choose print method
   - Assign machine
   - Specify quantity
3. Track print runs
4. QC inspection after printing

#### SEWING OPERATIONS

1. Go to "Sewing" page
2. Scan bundle QR code
3. Select operator
4. Choose operation type
5. Track sewing progress per bundle

#### QUALITY CONTROL

1. Go to "Quality Control" page
2. Create inspection:
   - Select order
   - Choose AQL sampling plan
   - Inspect samples
3. Record defects (if any):
   - Select defect type
   - Mark severity (Critical, Major, Minor)
   - Take photos
4. System calculates Pass/Fail automatically
5. If failed → Create CAPA (Corrective Action)

#### FINISHING & PACKING

1. Go to "Finishing" page
2. Select order
3. Track finishing tasks:
   - Trimming
   - Ironing
   - Folding
   - Tagging
4. Create cartons:
   - Specify dimensions
   - Weight
   - Contents
5. Generate shipping labels

### 5. DELIVERY MANAGEMENT

**How to Create a Shipment:**

1. Go to "Delivery" page
2. Click "New Shipment"
3. Select order and cartons
4. Choose delivery method:
   - Own driver
   - Lalamove
   - J&T Express
   - Other 3PL
5. Enter delivery details
6. Click "Create Shipment"

**Tracking Deliveries:**

- Real-time status updates
- GPS tracking (for 3PL)
- Proof of delivery (POD) capture
- Customer signature

### 6. FINANCE OPERATIONS

**How to Create an Invoice:**

1. Go to "Finance" → "Invoices"
2. Click "+ New Invoice"
3. Select client and order
4. Line items auto-populate
5. Review totals
6. Click "Create Invoice"

**Recording Payments:**

1. Go to invoice details
2. Click "Record Payment"
3. Enter:
   - Amount paid
   - Payment method
   - Reference number
   - Date
4. Click "Save"

**Expense Management:**

1. Go to "Finance" → "Expenses"
2. Click "+ New Expense"
3. Fill in details:
   - Amount
   - Category
   - Vendor
   - Date
   - Receipt photo
4. Submit for approval

### 7. HR & PAYROLL

**Adding Employees:**

1. Go to "HR & Payroll" → "Employees"
2. Click "+ New Employee"
3. Fill in details:
   - Name
   - Position
   - Department
   - Salary type (Daily, Hourly, Piece, Monthly)
   - Rate
4. Click "Create"

**Attendance Tracking:**

1. Go to "Attendance" tab
2. Employees can time in/out
3. System tracks:
   - Regular hours
   - Overtime
   - Breaks

**Processing Payroll:**

1. Go to "Payroll" tab
2. Select pay period
3. Review calculations
4. Generate pay slips
5. Record payments

### 8. INVENTORY MANAGEMENT

**Finished Goods:**

1. Go to "Inventory" → "Finished Goods"
2. View all completed items
3. Filter by:
   - Category
   - Color
   - Size
   - Location
4. Track stock levels

**Warehouse Management:**

1. Go to "Inventory" → "Warehouse"
2. Three operations:
   - **Delivery**: Issue stock to customers
   - **Transfer**: Move between locations
   - **Adjust**: Correct stock levels

**POS / Cashier:**

1. Go to "Mobile" → "Cashier POS"
2. Scan product QR codes
3. Add to cart
4. Process payment
5. Print receipt

---

## 🔄 MANUFACTURING WORKFLOW

### Complete Production Flow

```
1. CLIENT INQUIRY
   ↓
2. CREATE ORDER
   ↓
3. DESIGN APPROVAL
   ↓
4. CUTTING
   - Create Lay
   - Generate Bundles
   ↓
5. PRINTING (if applicable)
   - Print Run
   - QC Check
   ↓
6. SEWING
   - Scan Bundles
   - Track Operations
   ↓
7. QUALITY CONTROL
   - AQL Inspection
   - Defect Recording
   ↓
8. FINISHING
   - Trimming, Ironing
   - Packing
   ↓
9. DELIVERY
   - Create Shipment
   - Track Delivery
   ↓
10. INVOICE & PAYMENT
    - Generate Invoice
    - Record Payment
    ↓
11. COMPLETED
```

---

## 📝 COMMON TASKS

### Daily Operations

**Morning Routine:**

1. Check Dashboard for today's orders
2. Review pending approvals
3. Check production status
4. Verify deliveries scheduled

**Creating a Rush Order:**

1. Create order normally
2. Mark as "PRIORITY" in notes
3. Notify production team
4. Track closely on dashboard

**Handling Defects:**

1. QC inspector records defect
2. Take photos
3. System creates CAPA task
4. Production manager addresses issue
5. Re-inspect after fix

**Emergency Stock Check:**

1. Go to Inventory
2. Use search/filter
3. Check availability
4. Reserve if needed

---

## 🔧 TROUBLESHOOTING

### Common Issues

**Problem: Can't Log In**

- ✅ Check email spelling
- ✅ Verify password (case-sensitive)
- ✅ Clear browser cache
- ✅ Try "Forgot Password"

**Problem: Page Won't Load**

- ✅ Check internet connection
- ✅ Refresh page (Ctrl+R or Cmd+R)
- ✅ Clear browser cache
- ✅ Try different browser

**Problem: Can't Upload Files**

- ✅ Check file size (max 10MB)
- ✅ Verify file format (JPG, PNG, PDF)
- ✅ Check internet speed
- ✅ Try again later

**Problem: QR Code Won't Scan**

- ✅ Clean camera lens
- ✅ Ensure good lighting
- ✅ Hold steady
- ✅ Try manual entry

**Problem: Data Not Showing**

- ✅ Check filters/search
- ✅ Verify workspace selection
- ✅ Refresh page
- ✅ Check permissions

### Performance Tips

**For Faster Loading:**

- Use Chrome or Firefox
- Close unused tabs
- Clear cache weekly
- Use wired internet when possible

**For Mobile Use:**

- Use latest Chrome/Safari
- Enable mobile data if WiFi slow
- Use landscape mode for tables
- Bookmark frequently used pages

---

## 💡 PRO TIPS

1. **Use Search Everywhere**
   - Press `/` to quick search
   - Works on Clients, Orders, Products

2. **Keyboard Shortcuts**
   - `Ctrl+K` - Quick search
   - `Esc` - Close modals
   - `Tab` - Navigate forms

3. **Bulk Operations**
   - Select multiple items
   - Apply actions to all

4. **Export Data**
   - Most pages have "Export CSV"
   - Great for reports

5. **Mobile App**
   - Use for warehouse operations
   - QR scanning on mobile
   - Faster than desktop for floor work

---

## 📞 SUPPORT

### Need Help?

**For Technical Issues:**

- Check this guide first
- Review troubleshooting section
- Contact your IT admin

**For Feature Requests:**

- Document what you need
- Explain the use case
- Submit to management

**For Training:**

- Review this guide
- Practice in test workspace
- Shadow experienced user

---

## 📚 ADDITIONAL RESOURCES

### Video Tutorials (Coming Soon)

- Basic Navigation
- Creating Orders
- Production Workflow
- Inventory Management

### Quick Reference Cards

- Order Creation Checklist
- QC Inspection Guide
- Delivery Tracking
- Finance Operations

---

## 🎓 TRAINING CHECKLIST

**New User Setup (Day 1):**

- [ ] Create account
- [ ] Complete profile
- [ ] Tour of dashboard
- [ ] Create test client
- [ ] Create test order

**Week 1 Tasks:**

- [ ] Process 3 complete orders
- [ ] Upload and approve designs
- [ ] Create invoices
- [ ] Record payments
- [ ] Run basic reports

**Week 2 Tasks:**

- [ ] Handle production workflow
- [ ] QC inspections
- [ ] Manage deliveries
- [ ] Process payroll
- [ ] Use inventory system

---

## 📄 APPENDIX

### User Roles & Permissions

**Admin**

- Full system access
- Manage users
- Configure settings
- View all reports

**Production Manager**

- Manage production
- QC oversight
- Assign tasks
- View production reports

**Finance**

- Create invoices
- Record payments
- Manage expenses
- View financial reports

**Warehouse**

- Inventory management
- Stock movements
- Deliveries
- POS operations

**Quality Control**

- Conduct inspections
- Record defects
- Create CAPA
- View QC reports

**Operator**

- Record production
- Scan bundles
- Track tasks
- Limited access

---

**END OF USER GUIDE**

For the latest updates and information, visit: https://ash.vercel.app

**© 2025 Ashley AI Manufacturing ERP System**
