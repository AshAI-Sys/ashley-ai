# Ashley AI - Complete User Guide

**Version**: 1.0.0
**Last Updated**: October 10, 2025
**For**: Ashley AI Manufacturing ERP System

---

## 📖 Table of Contents

1. [Getting Started](#getting-started)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Core Modules](#core-modules)
4. [Production Workflow](#production-workflow)
5. [Common Tasks](#common-tasks)
6. [Troubleshooting](#troubleshooting)
7. [Support](#support)

---

## 🚀 Getting Started

### Accessing Ashley AI

**Web Application**:

- **URL**: http://localhost:3001 (or your production URL)
- **Browser**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile**: Responsive design works on tablets and phones

**Login Credentials**:

- Use the email and password provided by your administrator
- Default admin: `admin@ashleyai.com` / `password123`

### First-Time Login

1. Navigate to the login page
2. Enter your email and password
3. Click "Sign In"
4. You'll be directed to your role-specific dashboard

---

## 👥 User Roles & Permissions

### 1. **Administrator**

- Full system access
- Manage all users and settings
- Access to all modules
- Can override workflows

### 2. **Manager**

- Oversee production operations
- Approve orders and changes
- Access to reports and analytics
- Manage department staff

### 3. **CSR (Customer Service Representative)**

- Create and manage orders
- Client communication
- Order intake and processing
- Basic reporting

### 4. **Production Operator**

- View assigned tasks
- Update production status
- Scan QR codes
- Record completion

### 5. **Quality Inspector**

- Perform QC inspections
- Record defects
- Approve/reject batches
- Create CAPA tasks

### 6. **Finance Staff**

- Manage invoices
- Process payments
- Generate financial reports
- Track expenses

### 7. **Client (Portal Access)**

- View order status
- Approve designs
- Make payments
- Track deliveries

---

## 📦 Core Modules

### Module 1: Client & Order Management

**Purpose**: Manage clients, brands, and production orders

**Key Features**:

- Client database with contact information
- Brand management per client
- Order creation and tracking
- Order status workflow

**Quick Actions**:

```
Dashboard → Orders → New Order
Dashboard → Clients → View Client → Create Order
```

**Common Tasks**:

1. **Create New Client**:
   - Navigate to Clients page
   - Click "New Client"
   - Fill in company details, contact info
   - Add brand information
   - Save

2. **Create New Order**:
   - Go to Orders page
   - Click "New Order"
   - Select client and brand
   - Enter product details (type, quantity, sizes)
   - Choose print method
   - Set delivery date
   - Add design files
   - Submit order

3. **Track Order Status**:
   - View Orders list
   - Click on order number
   - See real-time status across all stages
   - View production progress

---

### Module 2: Design & Approval

**Purpose**: Manage design assets and client approvals

**Key Features**:

- Design file upload and versioning
- Client approval workflow
- Magic link for client reviews
- Version history tracking

**Process Flow**:

1. Upload design → 2. Send for approval → 3. Client reviews → 4. Approved/Changes requested → 5. Production ready

**Common Tasks**:

1. **Upload Design**:
   - Open order details
   - Navigate to Designs tab
   - Click "Upload Design"
   - Select file (PNG, JPG, PDF, AI)
   - Add notes
   - Save

2. **Send for Client Approval**:
   - Select design version
   - Click "Send for Approval"
   - Enter client email
   - System sends magic link
   - Client can approve/request changes

3. **Handle Design Revisions**:
   - If changes requested, upload new version
   - System maintains version history
   - Re-send for approval
   - Once approved, design locks for production

---

### Module 3: Cutting Operations

**Purpose**: Plan fabric cutting and create production bundles

**Key Features**:

- Lay planning with fabric optimization
- Bundle generation with QR codes
- Fabric batch tracking
- Cutting efficiency calculations

**Common Tasks**:

1. **Create Lay**:
   - Go to Cutting page
   - Click "Create Lay"
   - Select order
   - Enter fabric details (width, length)
   - System calculates optimal layout
   - Review Ashley AI suggestions
   - Approve lay plan

2. **Generate Bundles**:
   - From lay, click "Generate Bundles"
   - System creates numbered bundles
   - QR codes generated automatically
   - Print bundle tags
   - Distribute to production

3. **Scan Bundle**:
   - Use mobile device or scanner
   - Scan bundle QR code
   - View bundle details
   - Update status as you process

---

### Module 4: Printing Operations

**Purpose**: Manage printing across all methods (Silkscreen, Sublimation, DTF, Embroidery)

**Methods Supported**:

- **Silkscreen**: Traditional screen printing
- **Sublimation**: Heat transfer for polyester
- **DTF**: Direct-to-film transfer
- **Embroidery**: Needle and thread decoration
- **Rubberized**: Raised rubber printing

**Common Tasks**:

1. **Create Print Run**:
   - Navigate to Printing page
   - Click "Create Run"
   - Select bundles to print
   - Choose print method
   - Assign machine and operator
   - Start run

2. **Record Production**:
   - Update units completed
   - Record material usage
   - Log any issues or defects
   - Mark run complete

3. **Quality Check**:
   - Inspect print quality
   - Record defects if any
   - Approve for next stage

---

### Module 5: Sewing Operations

**Purpose**: Track sewing production and operator performance

**Key Features**:

- Sewing run management
- Operator assignment
- Piece-rate tracking
- Real-time efficiency monitoring

**Common Tasks**:

1. **Create Sewing Run**:
   - Go to Sewing page
   - Click "New Run"
   - Select bundles (from printing or cutting)
   - Assign operators
   - Set piece rate
   - Start production

2. **Update Progress**:
   - Operators scan bundles
   - Enter completed pieces
   - System calculates earnings
   - Tracks efficiency in real-time

3. **Monitor Performance**:
   - View operator productivity
   - Check run status
   - Ashley AI highlights bottlenecks
   - Adjust assignments as needed

---

### Module 6: Quality Control (QC)

**Purpose**: Inspect products and manage quality standards

**Key Features**:

- AQL sampling plans
- Defect tracking with photos
- CAPA (Corrective Action) management
- Statistical quality charts

**Common Tasks**:

1. **Create QC Inspection**:
   - Navigate to Quality Control
   - Click "New Inspection"
   - Select batch to inspect
   - System calculates sample size (AQL)
   - Perform inspection
   - Record results

2. **Record Defects**:
   - During inspection, click "Add Defect"
   - Select defect type (critical, major, minor)
   - Add photo
   - Describe location and issue
   - Save

3. **Create CAPA Task**:
   - If inspection fails
   - System prompts to create CAPA
   - Assign to responsible person
   - Set corrective actions
   - Track completion

4. **View Quality Analytics**:
   - Access QC Analytics page
   - View SPC charts
   - See Pareto analysis of defects
   - Track quality trends

---

### Module 7: Finishing & Packing

**Purpose**: Final product finishing and carton packing

**Key Features**:

- Finishing task management
- SKU generation
- Carton builder
- Weight and dimension tracking

**Common Tasks**:

1. **Create Finishing Run**:
   - Go to Finishing & Packing
   - Click "New Run"
   - Select completed units
   - Add finishing tasks (tagging, folding, pressing)
   - Track material usage
   - Mark complete

2. **Build Cartons**:
   - Use Carton Builder
   - Scan or add finished units
   - System tracks weight and dimensions
   - Calculate volume utilization
   - Print carton labels
   - Mark ready for shipment

3. **Prepare for Delivery**:
   - Review packed cartons
   - Generate packing list
   - Create shipment
   - Hand off to delivery

---

### Module 8: Delivery Operations

**Purpose**: Manage shipments and track deliveries

**Key Features**:

- Multi-carrier support
- Real-time tracking
- Proof of delivery
- 3PL integration

**Common Tasks**:

1. **Create Shipment**:
   - Navigate to Delivery
   - Click "New Shipment"
   - Add cartons
   - Select delivery method (own driver or 3PL)
   - Enter delivery address
   - Schedule pickup/delivery

2. **Get 3PL Quote**:
   - If using courier
   - Click "Get Quotes"
   - System queries multiple carriers
   - Compare rates
   - Book shipment

3. **Track Delivery**:
   - View dispatch board
   - See real-time status
   - Receive notifications
   - View delivery route (if GPS enabled)

4. **Record Proof of Delivery**:
   - When delivered
   - Upload photo
   - Get signature
   - Add delivery notes
   - Complete shipment

---

### Module 9: Finance Operations

**Purpose**: Manage invoices, payments, and financial reporting

**Key Features**:

- Invoice generation
- Payment processing
- Credit notes
- Financial reporting
- Cash flow tracking

**Common Tasks**:

1. **Generate Invoice**:
   - From order, click "Create Invoice"
   - Review line items
   - Add/edit as needed
   - Set payment terms
   - Send to client

2. **Record Payment**:
   - Go to Finance → Payments
   - Click "Record Payment"
   - Select invoice
   - Enter amount and method
   - Add payment reference
   - Allocate to invoice(s)

3. **View Financial Reports**:
   - Navigate to Finance dashboard
   - View key metrics (revenue, expenses, profit)
   - Check accounts receivable aging
   - Monitor cash flow
   - Export reports

4. **Manage Expenses**:
   - Go to Expenses
   - Click "New Expense"
   - Categorize expense
   - Upload receipt
   - Submit for approval
   - Track reimbursement

---

### Module 10: HR & Payroll

**Purpose**: Manage employees and process payroll

**Key Features**:

- Employee database
- Attendance tracking
- Payroll calculation (daily, hourly, piece-rate, monthly)
- Performance metrics

**Common Tasks**:

1. **Add New Employee**:
   - Go to HR & Payroll
   - Click "New Employee"
   - Enter personal details
   - Set salary type and rate
   - Assign to department
   - Create login account (optional)

2. **Record Attendance**:
   - Use attendance log
   - Record time in/out
   - Track breaks
   - Calculate overtime
   - Submit for approval

3. **Process Payroll**:
   - Go to Payroll tab
   - Select pay period
   - Review hours/pieces completed
   - Calculate deductions
   - Generate pay slips
   - Process payment

4. **View Employee Performance**:
   - Check productivity metrics
   - Review attendance rates
   - Track piece-rate earnings
   - Identify training needs

---

### Module 11: Maintenance Management

**Purpose**: Track assets and schedule maintenance

**Key Features**:

- Asset registry
- Work order management
- Preventive maintenance scheduling
- Maintenance cost tracking

**Common Tasks**:

1. **Register New Asset**:
   - Go to Maintenance
   - Click "New Asset"
   - Enter details (machine, vehicle, equipment)
   - Set maintenance schedule
   - Add warranty info
   - Save

2. **Create Work Order**:
   - Click "New Work Order"
   - Select asset
   - Describe issue
   - Set priority
   - Assign technician
   - Track to completion

3. **Schedule Preventive Maintenance**:
   - View maintenance calendar
   - Set recurring schedules
   - Receive reminders
   - Complete tasks on time
   - Avoid breakdowns

---

### Module 12: Client Portal

**Purpose**: Allow clients to track orders and interact with the system

**Access**: Separate URL (usually port 3003 or subdomain)

**Features for Clients**:

- Order tracking
- Design approval
- Payment status
- Delivery tracking
- Messaging

**Client Experience**:

1. Receive magic link via email
2. Click to access portal (no password needed)
3. View all their orders
4. See production progress
5. Approve designs
6. Make payments
7. Download invoices

---

### Module 13: Merchandising AI

**Purpose**: AI-powered insights for merchandising and inventory

**Key Features**:

- Demand forecasting
- Product recommendations
- Market trend analysis
- Inventory optimization
- Customer segmentation

**How to Use**:

1. **View Demand Forecast**:
   - Go to Merchandising page
   - See predicted demand for products
   - Plan inventory accordingly
   - Adjust production schedules

2. **Get Product Recommendations**:
   - System suggests:
     - Cross-sell opportunities
     - Up-sell products
     - Reorder reminders
     - Trending items

3. **Analyze Market Trends**:
   - View fashion trends
   - See color preferences
   - Track seasonal patterns
   - Adjust offerings

---

### Module 14: Automation & Reminders

**Purpose**: Automate workflows and send notifications

**Key Features**:

- Workflow automation rules
- Multi-channel notifications (Email, SMS, In-app)
- Alert management
- External integrations

**Common Tasks**:

1. **Create Automation Rule**:
   - Go to Automation
   - Click "New Rule"
   - Define trigger (e.g., "Order created")
   - Set conditions
   - Choose action (send notification, update status, etc.)
   - Activate rule

2. **Manage Notifications**:
   - View notification templates
   - Customize messages
   - Set recipients
   - Choose delivery channels

3. **Monitor Alerts**:
   - View active alerts
   - Acknowledge issues
   - Resolve problems
   - Track escalations

---

### Module 15: AI Chat Assistant

**Purpose**: Conversational AI help for manufacturing operations

**Access**: Floating chat widget on all pages (bottom right)

**How to Use**:

1. Click the chat icon
2. Type your question
3. Ashley AI responds with relevant help
4. Can ask about:
   - How to perform tasks
   - System information
   - Production data
   - Recommendations
   - Troubleshooting

**Example Questions**:

- "How do I create a new order?"
- "What's the status of order #ORD-2025-001?"
- "Show me production bottlenecks"
- "Calculate cutting efficiency for lay #LAY-001"

---

## 🔄 Production Workflow

### Complete Order-to-Delivery Process

```
1. ORDER INTAKE
   ↓ Client places order, CSR creates PO

2. DESIGN APPROVAL
   ↓ Upload design → Client approves

3. CUTTING
   ↓ Create lay → Generate bundles

4. PRINTING
   ↓ Print bundles (if required by method)

5. SEWING
   ↓ Assemble garments

6. QUALITY CONTROL
   ↓ Inspect per AQL standards

7. FINISHING & PACKING
   ↓ Final touches → Pack in cartons

8. DELIVERY
   ↓ Ship to client

9. INVOICING
   ↓ Generate invoice → Collect payment
```

### Status Progression

Each order goes through these statuses:

- **PENDING** → Order created, awaiting design
- **DESIGN_APPROVAL** → Design uploaded, client review
- **APPROVED** → Design approved, ready for production
- **IN_CUTTING** → Fabric being cut
- **IN_PRINTING** → Printing in progress
- **IN_SEWING** → Garments being assembled
- **QC_INSPECTION** → Quality check
- **FINISHING** → Final touches
- **PACKING** → Being packed
- **READY_FOR_DELIVERY** → Awaiting shipment
- **IN_TRANSIT** → Out for delivery
- **DELIVERED** → Completed
- **COMPLETED** → Paid and closed

---

## ✅ Common Tasks

### Daily Operations

**Morning Checklist**:

1. Check dashboard for alerts
2. Review today's production schedule
3. Check pending approvals
4. Monitor inventory levels
5. Review Ashley AI recommendations

**Production Floor**:

1. Scan bundles as they move through stages
2. Update completion quantities
3. Record defects immediately
4. Track material usage
5. Report issues to supervisor

**End of Day**:

1. Update all run statuses
2. Review incomplete tasks
3. Check tomorrow's schedule
4. Back up critical data
5. Review Ashley AI insights

---

### Weekly Tasks

**Managers**:

- Review production efficiency reports
- Check quality metrics
- Approve payroll
- Review inventory levels
- Plan upcoming production

**Finance**:

- Generate weekly revenue report
- Follow up on overdue invoices
- Process payments
- Review cash flow
- Prepare for month-end

---

### Monthly Tasks

**Administration**:

- Month-end closing
- Financial reporting
- Inventory reconciliation
- Performance reviews
- System maintenance

---

## 🔧 Troubleshooting

### Common Issues

**1. Cannot Login**

- Check email/password spelling
- Ensure caps lock is off
- Try "Forgot Password" if available
- Contact administrator

**2. Order Not Showing**

- Check filters (status, date range)
- Ensure you have permission
- Try refreshing page
- Search by order number

**3. QR Code Not Scanning**

- Clean camera lens
- Ensure good lighting
- Hold steady at correct distance
- Try manual entry if persistent

**4. Slow Performance**

- Check internet connection
- Clear browser cache
- Close unnecessary tabs
- Try different browser

**5. Data Not Saving**

- Check all required fields filled
- Look for validation errors (red text)
- Ensure you have save permission
- Try again or contact support

---

## 📞 Support

### Getting Help

**In-App Support**:

- Use AI Chat Assistant (bottom right)
- Check help tooltips (? icons)
- Review in-context help messages

**Documentation**:

- This user guide
- API documentation (for developers)
- Video tutorials (if available)

**Contact Support**:

- Email: support@ashleyai.com
- Phone: [Your support number]
- Hours: [Your support hours]

---

## 📚 Additional Resources

- **Quick Start Guide**: See separate document
- **Admin Guide**: For system administrators
- **API Documentation**: For developers
- **Training Videos**: [If available]
- **Release Notes**: Check CLAUDE.md for latest updates

---

## 📝 Glossary

- **AQL**: Acceptable Quality Limit - statistical sampling method
- **CAPA**: Corrective and Preventive Action
- **CSR**: Customer Service Representative
- **DTF**: Direct to Film (printing method)
- **ERP**: Enterprise Resource Planning
- **Lay**: Arrangement of pattern pieces on fabric
- **Bundle**: Group of cut pieces tracked together
- **QC**: Quality Control
- **SKU**: Stock Keeping Unit
- **3PL**: Third-Party Logistics provider
- **POD**: Proof of Delivery
- **WIP**: Work in Progress

---

**Document End**

_For the latest updates, check CLAUDE.md in the root directory._
