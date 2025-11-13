# Ashley AI - Complete User Guide

## Manufacturing ERP System para sa Apparel Production

**Last Updated**: November 14, 2025
**System Status**: Production Ready
**Website**: https://ash-pj4liunz0-ash-ais-projects.vercel.app

---

## 📚 Table of Contents

1. [Ano ang Ashley AI?](#ano-ang-ashley-ai)
2. [Buong Workflow - Order to Delivery](#buong-workflow)
3. [User Roles at Permissions](#user-roles)
4. [Module-by-Module Guide](#modules)
5. [Mobile App Guide](#mobile-app)
6. [Common Tasks](#common-tasks)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Ano ang Ashley AI?

Ashley AI ay **complete manufacturing ERP system** para sa garment/apparel production business. Nag-track ito ng **buong production process** mula order intake hanggang delivery at finance.

### Key Features:

- ✅ **Order Management** - Track lahat ng customer orders
- ✅ **Production Tracking** - Cutting, Printing, Sewing with QR codes
- ✅ **Quality Control** - AQL inspection with photo documentation
- ✅ **Delivery Management** - Driver tracking, 3PL integration, POD
- ✅ **Finance Module** - Invoicing, payments, P&L analysis
- ✅ **HR & Payroll** - Employee management, attendance, payroll
- ✅ **Inventory System** - Product tracking, QR labels, stock ledger
- ✅ **AI Assistant** - Chat with Ashley AI for help
- ✅ **Mobile App** - For warehouse, cashier, and scanner operations

---

## 🔄 Buong Workflow - Order to Delivery

### **Stage 1: Client & Order Intake**

**Sino gumagamit**: Sales Team, Admin

**Paano gamitin**:

1. **Add Client First** (kung bago):
   - Go to **Clients** page
   - Click "New Client"
   - Fill in: Name, Contact, Email, Address
   - Save

2. **Create Order**:
   - Go to **Orders** page
   - Click "New Order"
   - Select Client
   - Select Brand (kung multiple brands kayo)
   - Enter Order Details:
     - **PO Number** - Client's Purchase Order number
     - **Order Type** - NEW or REORDER
     - **Design Name** - Pangalan ng design
     - **Fabric Type** - Cotton, Polyester, etc.
     - **Garment Type** - T-shirt, Polo, etc.
     - **Quantity** - Total pieces
     - **Size Distribution** - Boxtype or Oversized
   - Add **Color Variants** with percentages:
     - Black 40%, White 30%, Navy 30%
   - Add **Print Locations** with dimensions:
     - Body Front: 12" x 12"
     - Left Sleeve: 3" x 3"
   - Add **Add-ons** (optional):
     - Custom Neck Tag (₱12/pc)
     - Custom Size Label (₱8/pc)
     - Custom Care Label (₱6/pc)
   - Set **Delivery Date**
   - Click "Create Order"

3. **Upload Design**:
   - After creating order, upload design files
   - Upload mockup image
   - Add artist filename and notes

4. **Send for Approval**:
   - Click "Send for Client Approval"
   - System generates approval link
   - Send link to client
   - Client can approve or request revisions

**Status Flow**: DRAFT → PENDING_APPROVAL → APPROVED → IN_PRODUCTION → COMPLETED

---

### **Stage 2: Design & Approval**

**Sino gumagamit**: Design Team, Client (via approval link)

**Paano gamitin**:

1. Designer uploads design files sa order
2. Upload mockup at production files
3. Admin sends approval link to client
4. Client clicks link, views design
5. Client approves or rejects with comments
6. Pag approved, order moves to production

**Activity Timeline**:

- Lahat ng actions naka-log (Created, Approved, Updated, etc.)
- May icons at timestamps

---

### **Stage 3: Cutting Operations**

**Sino gumagamit**: Cutting Department

**Paano gamitin**:

1. **Create Lay**:
   - Go to **Cutting** page
   - Click "Create Lay"
   - Select Order
   - Enter fabric details:
     - Fabric Width (inches)
     - Fabric Length (meters)
     - Total Layers
     - Pieces per Layer
   - System calculates fabric utilization
   - Click "Create"

2. **Issue Fabric**:
   - Lay status: PLANNED → FABRIC_ISSUED
   - Record actual fabric meters used
   - System tracks fabric efficiency

3. **Generate Bundles with QR Codes**:
   - Click "Generate Bundles"
   - Enter pieces per bundle (usually 12-24pcs)
   - System creates bundles with unique QR codes
   - Print QR labels
   - Attach labels to each bundle

4. **Complete Cutting**:
   - Record cut quantity
   - Mark lay as COMPLETED
   - Bundles ready for next stage

**Bundle Format**: ORDER-001-B001, ORDER-001-B002, etc.

---

### **Stage 4: Printing Operations**

**Sino gumagamit**: Printing Department

**Paano gamitin**:

1. **Create Print Run**:
   - Go to **Printing** page
   - Click "Create Print Run"
   - Select Order
   - Choose Print Method:
     - Silkscreen
     - Sublimation
     - DTF (Direct to Film)
     - Embroidery
     - Rubberized
   - Select bundles to print
   - Assign operator
   - Start printing

2. **Scan Bundles**:
   - Use QR scanner or manual input
   - Scan each bundle as it's processed
   - Record good/reject quantities

3. **Complete Print Run**:
   - Enter total printed
   - Record print quality notes
   - Mark as COMPLETED
   - Bundles move to sewing

**Print Efficiency**: System calculates efficiency based on time and quantity

---

### **Stage 5: Sewing Operations**

**Sino gumagamit**: Sewing Department, Line Leaders

**Paano gamitin**:

1. **Create Sewing Run**:
   - Go to **Sewing** page
   - Click "Create Sewing Run"
   - Select Order
   - Choose Sewing Type:
     - Flatbed
     - Overlock
     - Coverstitch
     - Bartack
     - Buttonhole
   - Assign operators (multiple)
   - Set piece rate (₱/piece)

2. **Scan Bundles In**:
   - Scan bundles as they enter sewing
   - System tracks bundle location

3. **Record Production**:
   - Each operator logs daily output
   - System calculates earnings based on piece rate
   - Track good/reject quantities

4. **Complete Sewing**:
   - All bundles completed
   - Mark run as COMPLETED
   - Ready for QC inspection

**Operator Tracking**: Real-time dashboard shows each operator's productivity

---

### **Stage 6: Quality Control**

**Sino gumagamit**: QC Inspector

**Paano gamitin**:

1. **Create QC Inspection**:
   - Go to **Quality Control** page
   - Click "New Inspection"
   - Select Order
   - Choose **AQL Level**: 2.5, 4.0, or 6.5
   - System calculates sample size based on:
     - Total quantity
     - AQL level
     - ANSI/ASQ Z1.4 standard

2. **Inspect Samples**:
   - Randomly select samples
   - For each sample, check:
     - Measurements
     - Print quality
     - Stitching
     - Overall appearance
   - Record defects with:
     - **Defect Code**: STITCH_SKIP, PRINT_FADE, etc.
     - **Severity**: CRITICAL, MAJOR, MINOR
     - **Photo** (upload)
     - **Location** (collar, sleeve, etc.)

3. **System Calculates Result**:
   - Based on AQL table
   - Compares defects vs acceptance number
   - **PASS** or **FAIL**

4. **If FAIL**:
   - Create **CAPA** (Corrective Action):
     - Identify root cause
     - Assign responsible person
     - Set due date
     - Track until resolved
   - Re-inspect after corrections

5. **If PASS**:
   - Order moves to finishing

**AQL Levels**:

- 2.5 = Strict (luxury brands)
- 4.0 = Standard (most orders)
- 6.5 = General (basic items)

---

### **Stage 7: Finishing & Packing**

**Sino gumagamit**: Finishing Department, Packing Team

**Paano gamitin**:

1. **Create Finishing Run**:
   - Go to **Finishing** page
   - Click "New Finishing Run"
   - Select passed QC order
   - Assign finishing tasks:
     - Thread trimming
     - Ironing/pressing
     - Steaming
     - Folding
     - Tagging
     - Poly bagging

2. **Track Materials Used**:
   - Record quantities:
     - Poly bags
     - Hangtags
     - Stickers
     - Carton boxes

3. **Create Finished Units**:
   - Generate SKU for each product
   - Record details:
     - Color
     - Size
     - Quantity
     - **Product Image** (upload photo)
     - **Crate Number** (e.g., α16, G-9)
   - System tracks warehouse location

4. **Pack into Cartons**:
   - Create cartons with:
     - Carton number
     - Contents (SKUs and quantities)
     - Weight (kg)
     - Dimensions (L x W x H cm)
   - System calculates:
     - Volume utilization
     - Dimensional weight
     - Stackability

5. **Prepare for Shipment**:
   - Group cartons into shipment
   - Print carton labels
   - Ready for delivery

**Warehouse Tracking**: Each finished unit has location (crate number) for easy retrieval

---

### **Stage 8: Delivery Operations**

**Sino gumagamit**: Logistics Team, Drivers

**Paano gamitin**:

#### **A. Create Shipment**

1. Go to **Delivery** page
2. Click "Create Shipment"
3. Select Order
4. Choose **Delivery Method**:
   - **Own Driver** - Your company driver
   - **3PL Provider** - Lalamove, JNT, Grab, etc.
5. Add cartons to shipment
6. If 3PL:
   - Enter pickup/delivery addresses
   - System gets quotes from providers
   - Select best option
   - Book shipment
7. Print shipping labels

#### **B. Warehouse Scan-Out**

1. Go to **Warehouse Operations**
2. Scan each carton QR code
3. System verifies:
   - Correct shipment
   - All cartons present
   - No missing items
4. Mark as "Dispatched"

#### **C. Driver Tracking** (for own drivers)

1. Assign driver in Mobile App
2. Driver sees delivery details
3. Navigate to customer
4. Capture Proof of Delivery:
   - **Photo** of delivered goods
   - **Signature** from receiver
   - **Notes** (if any issues)
5. Submit POD
6. Shipment marked as "Delivered"

#### **D. 3PL Tracking**

1. System tracks via provider API
2. Real-time status updates:
   - Picked up
   - In transit
   - Out for delivery
   - Delivered
3. View on dispatch board

**Dispatch Board**: Real-time dashboard showing all active deliveries

---

### **Stage 9: Finance Operations**

**Sino gumagamit**: Finance/Accounting Team

**Paano gamitin**:

#### **A. Accounts Receivable (AR)**

**1. Create Invoice**:

- Go to **Finance** → **Accounts Receivable** → **Invoices**
- Click "New Invoice"
- Select Client and Order (or multiple orders)
- Add invoice lines:
  - Description (e.g., "1000pcs Black T-shirt")
  - Quantity
  - Unit Price
  - Tax Rate (12% VAT)
- Set **Tax Mode**:
  - **VAT Inclusive** - Price includes VAT
  - **VAT Exclusive** - VAT added on top
  - **Zero Rated** - 0% VAT (exports)
- Add discount (percentage or amount)
- Set due date
- System calculates:
  - Subtotal
  - Discount
  - VAT Amount
  - **Total**
- Save as DRAFT or send to client (OPEN)

**2. Record Payment**:

- Go to **Payments**
- Click "Record Payment"
- Enter payment details:
  - **Source**: Cash, Bank, GCash, Stripe, Shopee, TikTok
  - **Amount**
  - **Reference Number**
  - **Date Received**
- Allocate to invoices:
  - Select invoice(s)
  - Enter amount to allocate
  - Supports **partial payments**
- System updates:
  - Invoice balance
  - Invoice status (PARTIAL/PAID)

**3. Create Credit Note** (for returns/refunds):

- Select invoice
- Click "Create Credit Note"
- Enter reason code
- Enter amount or quantity
- System reduces invoice balance

**4. View Aging Report**:

- Shows receivables by age:
  - **0-30 days** (green) - Current
  - **31-60 days** (yellow) - Watch closely
  - **61-90 days** (orange) - Follow up needed
  - **90+ days** (red) - Critical
- Filter by brand, client
- Export to Excel

#### **B. Accounts Payable (AP)**

**1. Create Bill** (supplier invoice):

- Go to **Accounts Payable** → **Bills**
- Click "New Bill"
- Select Supplier (or create new)
- Enter bill details:
  - Bill Number (from supplier)
  - Date Received
  - Due Date
- Add bill lines:
  - Description (e.g., "100 yards cotton fabric")
  - Quantity
  - Unit Cost
  - Tax Rate
- System calculates total
- Save

**2. Schedule Payment**:

- Go to **Bill Payments**
- Select bills to pay
- Choose payment date
- Attach receipt/proof
- Mark as paid

**3. Manage Suppliers**:

- Add supplier details:
  - Name, TIN
  - Contact info
  - Payment terms
  - Bank details

#### **C. Costing & P&L**

**View Cost Breakdown**:

- **Materials Cost**: From BOM and fabric purchases
- **Labor Cost**: From payroll allocations
- **Overhead Cost**: Utilities, rent, etc.
- **COGS** = Materials + Labor + Overhead

**P&L Analysis**:

- **Revenue** (from paid invoices)
- **- COGS** (cost of goods sold)
- **= Gross Profit**
- **Gross Margin %** = (Gross Profit / Revenue) × 100

**Brand P&L**:

- See profitability per brand
- Compare margins across brands
- Identify best/worst performers

**Channel Settlements**:

- Import Shopee/TikTok statements
- Track platform fees, shipping, ads
- Calculate net payout

#### **D. Compliance & Exports**

**BIR Reports**:

- **Sales Book**: All sales with VAT
- **Purchase Book**: All purchases with VAT
- Export to Excel for BIR filing

**Government Remittances**:

- **SSS**: Employee contributions
- **PhilHealth**: Health insurance
- **Pag-IBIG**: Housing fund
- Export schedules for payment

**General Ledger Export**:

- CSV/Excel format
- For accounting software (QuickBooks, Xero, etc.)

**VAT Report**:

- Input VAT (purchases)
- Output VAT (sales)
- Net VAT payable/refundable

**Withholding Tax (2307)**:

- EWT certificates
- For suppliers with withholding

---

### **Stage 10: HR & Payroll**

**Sino gumagamit**: HR Department, Managers

**Paano gamitin**:

#### **A. Employee Management**

**Add Employee**:

1. Go to **HR & Payroll** → **Employees**
2. Click "Add Employee"
3. Fill in details:
   - Personal Info: Name, birthday, address
   - Contact: Phone, email
   - Job Details:
     - Position
     - Department
     - Brand assignment
   - Salary Info:
     - **Salary Type**:
       - **DAILY** - ₱/day
       - **HOURLY** - ₱/hour
       - **PIECE** - ₱/piece (for production)
       - **MONTHLY** - Fixed salary
     - Base Rate
     - Allowances
   - Bank/GCash details
   - Emergency contact
4. Upload documents (ID, contract)
5. Save

#### **B. Attendance Tracking**

**Methods**:

1. **QR/NFC Kiosk** - Tablet at entrance
2. **Mobile App** - Employee scans QR or uses geofence
3. **Supervisor Batch** - Line leader clocks team
4. **Manual Entry** - HR corrects/adds

**Clock In/Out**:

- Employee clocks IN when arriving
- Clock OUT when leaving
- Break START/END for lunch
- System tracks:
  - Total hours worked
  - Break duration
  - Late minutes
  - Overtime hours

**Time Corrections**:

- Employee files correction request
- Attach photo/note
- Manager approves
- HR processes

#### **C. Payroll Processing**

**Create Payroll Run**:

1. Go to **Payroll** → \*\*New Payroll Run"
2. Select period (e.g., Nov 1-15, 2025)
3. Select employees or department
4. System calculates:
   - **For DAILY**: Days worked × daily rate
   - **For HOURLY**: Hours worked × hourly rate
   - **For PIECE**: Pieces completed × piece rate
   - **For MONTHLY**: Fixed monthly salary
5. Add:
   - Overtime pay
   - Night differential
   - Allowances
6. Deduct:
   - SSS contribution
   - PhilHealth
   - Pag-IBIG
   - Tax (withholding)
   - Absences
   - Cash advances
7. Calculate **Net Pay**
8. Review and approve
9. Process payment
10. Generate payslips

**Payslip**:

- Employee can download from portal
- Shows breakdown of:
  - Gross pay
  - Deductions
  - Net pay
  - YTD totals

#### **D. Leave Management**

**Types of Leave**:

- Vacation Leave (VL)
- Sick Leave (SL)
- Emergency Leave
- Maternity/Paternity
- Special Leave

**File Leave Request**:

1. Employee goes to **Leave Requests**
2. Click "Request Leave"
3. Select type
4. Choose dates
5. Enter reason
6. Submit

**Approve Leave**:

1. Manager sees pending requests
2. Check leave balance
3. Approve or reject
4. System updates:
   - Leave balance
   - Attendance calendar

#### **E. Employee Benefits**

**Setup Benefits**:

- SSS (11% employee + employer share)
- PhilHealth (4% shared)
- Pag-IBIG (₱200/month)
- HMO/Health insurance
- Rice subsidy
- Clothing allowance

**Track Benefits**:

- Employee benefit enrollments
- Deductions per pay period
- Government remittances due

---

### **Stage 11: Inventory Management**

**Sino gumagamit**: Warehouse Team, Store Manager

**Paano gamitin**:

#### **A. Product Management**

**Add Product**:

1. Go to **Inventory** → **Products**
2. Click "Add Product"
3. Fill in:
   - Product Name
   - SKU
   - **Category** (create inline if new):
     - T-Shirts
     - Polo Shirts
     - Hoodies, etc.
   - **Brand** (create inline if new):
     - Add brand logo
   - Description
   - Base Price
   - Reorder Level
4. Upload **Product Image**
5. Save

**Create Variants**:

- Add color variants (Black, White, Navy)
- Add size variants (S, M, L, XL, XXL)
- Each variant gets unique SKU
- Set stock levels per variant

#### **B. QR Code System**

**Generate QR Codes**:

1. Go to **Inventory** → **QR Printer**
2. Choose workflow:
   - **INVENTORY_FIRST**: Create QR, assign product later
   - **ORDER_FIRST**: Create QR for specific order
3. Select:
   - Category (e.g., T-Shirts)
   - Brand
   - Quantity
4. Generate codes
5. Download and print labels
6. Mark as "PRINTED"

**QR Code Lifecycle**:

- **GENERATED** → Created but not printed
- **PRINTED** → Labels printed, ready to use
- **ASSIGNED** → Attached to product/order
- **SCANNED** → Used in transaction
- **INACTIVE** → Retired/damaged

#### **C. Stock Operations**

**1. Store Scanner** (Retail Sales):

- Go to **Inventory** → **Store Scanner**
- Scan product QR code or barcode
- Shows:
  - Product name
  - Category badge (purple)
  - Brand badge (blue)
  - Price
  - Stock status
- Add to cart
- Process sale

**2. Cashier POS**:

- Mobile app or web
- Scan items in cart
- Calculate total
- Process payment:
  - Cash
  - GCash
  - Credit/Debit Card
- Print receipt
- Update stock

**3. Warehouse Operations**:

- **Delivery**: Receive stock from production
- **Transfer**: Move between locations
- **Adjust**: Correct stock discrepancies

**Stock Ledger**:

- Complete history per product:
  - Date/Time
  - Transaction type
  - Quantity in/out
  - Running balance
  - User
  - Notes

#### **D. Inventory Reports**

**Stock Report**:

- Current stock levels
- Low stock alerts
- Overstock warnings

**Transaction History**:

- All stock movements
- Filter by date, product, type

**Category/Brand Analysis**:

- Best sellers
- Slow movers
- Stock value by category

---

### **Stage 12: Mobile App**

**Download**: Expo Go app, scan QR code

**Modules**:

#### **1. Store Scanner**

- Scan products for retail sales
- View product details
- Check stock availability
- Add to sale

#### **2. Cashier POS**

- Process retail transactions
- Multiple payment methods
- Print/email receipts
- Daily sales summary

#### **3. Warehouse Management**

- Receive deliveries
- Transfer stock
- Adjust quantities
- QR code scanning

**Offline Mode**: Works without internet, syncs when online

---

## 👥 User Roles at Permissions

### **Admin**

- Access: Everything
- Can: All operations, settings, user management

### **Manager**

- Access: All production, finance, HR
- Can: Approve orders, timesheet corrections, payroll review

### **Sales**

- Access: Clients, Orders
- Can: Create orders, manage clients, view reports

### **Production Staff**

- Access: Cutting, Printing, Sewing
- Can: Create runs, scan bundles, record output

### **QC Inspector**

- Access: Quality Control
- Can: Create inspections, record defects, pass/fail

### **Finance**

- Access: Finance module
- Can: Create invoices, record payments, view reports

### **HR Staff**

- Access: HR & Payroll
- Can: Manage employees, process payroll, approve leaves

### **Warehouse**

- Access: Inventory, Warehouse operations
- Can: Receive stock, transfer, adjust, scan

### **Driver**

- Access: Mobile app - Deliveries
- Can: View assigned deliveries, capture POD

### **Employee**

- Access: Self-service portal
- Can: Clock in/out, request leave, view payslip

---

## 🔧 Common Tasks

### Paano mag-login?

1. Go to: https://ash-pj4liunz0-ash-ais-projects.vercel.app
2. Click "Login"
3. Enter credentials:
   - Email
   - Password
4. Click "Sign In"

### Paano mag-create ng order?

1. **Clients** → Add client first (if new)
2. **Orders** → "New Order"
3. Fill in all details
4. Upload design
5. Send for approval
6. Track status

### Paano mag-track ng production?

1. **Dashboard** → Overview of all orders
2. Click order → See detailed timeline
3. Each stage shows:
   - Status (Pending/In Progress/Completed)
   - Assigned to
   - Start/End dates
   - Quantities

### Paano mag-process ng payment?

1. **Finance** → **Payments**
2. "Record Payment"
3. Enter amount and source
4. Allocate to invoice(s)
5. Save

### Paano mag-create ng invoice?

1. **Finance** → **Invoices**
2. "New Invoice"
3. Select client and order
4. Add line items
5. Set terms and due date
6. Save (DRAFT) or Send (OPEN)

### Paano mag-process ng payroll?

1. **HR** → **Payroll**
2. "New Payroll Run"
3. Select period and employees
4. Review calculations
5. Approve
6. Process payments

### Paano mag-scan ng QR code?

1. **Mobile App** or **Web Scanner**
2. Click scan button
3. Point camera at QR code
4. System shows product/bundle info
5. Process transaction

---

## 🆘 Troubleshooting

### "White screen" or page not loading?

- Check internet connection
- Clear browser cache (Ctrl+Shift+Delete)
- Try different browser (Chrome recommended)
- Check if logged in

### QR code not scanning?

- Check camera permissions
- Clean lens
- Ensure good lighting
- Try manual entry of code

### Payment not reflecting?

- Check if properly allocated to invoice
- Refresh page
- Check payment date
- Contact admin if issue persists

### Stock count incorrect?

- Go to **Stock Ledger**
- Review recent transactions
- Create adjustment if needed
- Document reason

### Employee can't clock in?

- Check if employee is active
- Verify device time is correct
- Try alternative method (manual entry)
- Contact HR

### Invoice not generating?

- Check if all required fields filled
- Ensure client exists
- Verify order status
- Check permissions

### Payroll calculation wrong?

- Verify attendance records
- Check rate settings
- Review deductions
- Recalculate if needed

---

## 📞 Support

### Need Help?

1. **Chat with Ashley AI** - Click chat icon, ask questions
2. **Check Documentation** - Comprehensive guides available
3. **Contact Admin** - For account/permission issues
4. **Report Bug** - Use feedback form

### System Status

- **Production URL**: https://ash-pj4liunz0-ash-ais-projects.vercel.app
- **Backup System**: Available if main is down
- **Support Hours**: 24/7 automated, business hours for human

---

## 🎯 Best Practices

### Order Management

✅ Create clients before orders
✅ Upload designs early
✅ Send for approval promptly
✅ Track order status daily

### Production

✅ Scan all bundles
✅ Record defects immediately
✅ Complete runs daily
✅ Don't skip QC inspection

### Finance

✅ Send invoices on time
✅ Record payments same day
✅ Reconcile weekly
✅ Follow up on overdue accounts

### HR & Payroll

✅ Process attendance daily
✅ Approve leaves promptly
✅ Run payroll on schedule
✅ Keep employee records updated

### Inventory

✅ Conduct physical counts monthly
✅ Update stock levels daily
✅ Set reorder points
✅ Use QR codes consistently

---

## 🚀 Tips for Maximum Efficiency

1. **Use QR Codes** - Faster and more accurate than manual entry
2. **Mobile App** - For warehouse and field operations
3. **Dashboard View** - Start here every day for overview
4. **Filter & Search** - Use extensively to find data quickly
5. **Export Reports** - Regular exports for backup and analysis
6. **Automate** - Set up recurring tasks and reminders
7. **Train Staff** - Ensure everyone knows their module
8. **Regular Backup** - Export data weekly
9. **Clean Data** - Archive old records quarterly
10. **Stay Updated** - Check for new features regularly

---

## 📊 Reports Available

### Production Reports

- Order Status Report
- Production Efficiency
- Defect Analysis
- Operator Performance

### Finance Reports

- Aging Report
- P&L Statement
- Cash Flow
- Sales Book
- Purchase Book

### HR Reports

- Attendance Summary
- Payroll Register
- Leave Balances
- Performance Metrics

### Inventory Reports

- Stock Levels
- Transaction History
- Category Analysis
- Low Stock Alert

---

**End of Complete User Guide**

For specific module details, refer to individual module documentation or chat with Ashley AI for instant help!
