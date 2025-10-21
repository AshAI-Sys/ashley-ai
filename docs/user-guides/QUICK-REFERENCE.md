# Ashley AI - Quick Reference Cards

**Version**: 1.0.0
**Last Updated**: October 10, 2025
**For**: All Users - Print and Keep Handy!

---

## 🎯 Quick Access URLs

| Portal              | URL                              | Who Uses It     |
| ------------------- | -------------------------------- | --------------- |
| **Admin Interface** | http://localhost:3001            | Internal staff  |
| **Client Portal**   | http://localhost:3003            | Clients only    |
| **Finance**         | http://localhost:3001/finance    | Finance team    |
| **HR & Payroll**    | http://localhost:3001/hr-payroll | HR team         |
| **Automation**      | http://localhost:3001/automation | Managers/Admins |

---

## 👥 User Roles & Permissions

| Role              | Key Access       | Main Tasks                         |
| ----------------- | ---------------- | ---------------------------------- |
| **Administrator** | Full system      | System config, user management     |
| **Manager**       | Department-wide  | Approvals, reports, oversight      |
| **CSR**           | Clients & Orders | Order intake, client communication |
| **Production**    | Production floor | Update status, scan bundles        |
| **QC Inspector**  | Quality checks   | Inspections, defects, CAPA         |
| **Finance**       | Finance module   | Invoices, payments, reports        |
| **HR Staff**      | HR module        | Employees, payroll, attendance     |
| **Client**        | Portal only      | View orders, approve designs       |

---

## 📦 Order Status Flow

```
NEW ORDER
   ↓
CONFIRMED (payment received)
   ↓
DESIGN (awaiting client approval)
   ↓
APPROVED (production starts)
   ↓
IN_PRODUCTION (cutting → printing → sewing)
   ↓
QUALITY_CHECK (QC inspection)
   ↓
FINISHING (packing & labeling)
   ↓
READY_TO_SHIP (awaiting dispatch)
   ↓
IN_TRANSIT (on delivery)
   ↓
DELIVERED (completed)
```

---

## 🏭 Production Stages Quick Guide

### 1. Order Intake

- **Who**: CSR
- **Action**: Create order → Enter details → Generate quotation
- **Next**: Send to client for approval

### 2. Design Approval

- **Who**: Client + Design Team
- **Action**: Upload mockup → Client approves/requests changes
- **Next**: Production starts on approval

### 3. Cutting

- **Who**: Cutting Operator
- **Action**: Create lay → Cut fabric → Generate bundles → Print QR tags
- **Next**: Bundles to printing/sewing

### 4. Printing

- **Who**: Printing Operator
- **Action**: Scan bundles → Setup machine → Print → QC check
- **Next**: To sewing

### 5. Sewing

- **Who**: Sewing Operators
- **Action**: Scan bundles → Assemble garments → Update count
- **Next**: To quality control

### 6. Quality Control

- **Who**: QC Inspector
- **Action**: Inspect per AQL → Record defects → Pass/Fail
- **Next**: Pass → Finishing | Fail → Rework

### 7. Finishing & Packing

- **Who**: Finishing Staff
- **Action**: Tag/fold/press → Pack in cartons → Label
- **Next**: Ready for shipment

### 8. Delivery

- **Who**: Logistics/Driver
- **Action**: Scan out → Deliver → Proof of delivery
- **Next**: Order complete

---

## 📱 QR Code Scanning Guide

### What to Scan:

- ✅ Bundle tags
- ✅ Carton labels
- ✅ Lay plans
- ✅ Shipment barcodes
- ✅ Asset tags

### How to Scan:

1. Tap **"Scan"** button in app
2. Point camera at QR code
3. Hold steady until beep
4. Details appear automatically

### If Scan Fails:

- Clean QR code surface
- Improve lighting
- Hold device closer
- Try manual entry

### Manual Entry:

1. Tap **"Manual Entry"**
2. Type bundle/carton number
3. Tap **"Search"**

---

## 🎨 Status Colors Reference

| Color         | Status           | Meaning               |
| ------------- | ---------------- | --------------------- |
| 🔵 **Blue**   | Pending          | Not started yet       |
| 🟡 **Yellow** | In Progress      | Currently working     |
| 🟢 **Green**  | Completed/Pass   | Finished successfully |
| 🔴 **Red**    | Failed/Defective | Has issues            |
| ⚫ **Gray**   | On Hold          | Paused/waiting        |
| 🟣 **Purple** | Approved         | Client approved       |
| 🟠 **Orange** | Needs Attention  | Action required       |

---

## 💰 Finance Quick Reference

### Payment Status:

- **PENDING**: Invoice issued, payment due
- **PARTIAL**: Some payment received
- **PAID**: Fully paid
- **OVERDUE**: Past due date

### Payment Terms (Standard):

- **Deposit**: 50% upfront
- **Balance**: 50% on delivery
- **Credit Terms**: Net 30 days (for approved clients)

### Creating Invoice:

1. Go to Finance → Invoices
2. Click "New Invoice"
3. Select order/client
4. Add line items
5. Set payment terms
6. Save & Send

---

## 👷 HR & Payroll Quick Reference

### Salary Types:

- **DAILY**: Fixed daily rate
- **HOURLY**: Per hour worked
- **PIECE**: Per piece completed (production)
- **MONTHLY**: Fixed monthly salary

### Clocking In/Out:

1. Login to system
2. Go to Attendance
3. Tap "Clock In" (start of day)
4. Tap "Clock Out" (end of day)
5. System calculates hours

### Checking Your Earnings (Piece Rate):

1. Tap "My Performance"
2. View today's pieces
3. See earnings calculation
4. Check weekly/monthly totals

---

## ✅ Quality Control (QC) Reference

### Defect Severity:

- **CRITICAL**: Unwearable (holes, wrong size) → FAIL immediately
- **MAJOR**: Noticeable (crooked print, skipped stitch) → Limited allowed
- **MINOR**: Small issue (loose thread) → More tolerance

### AQL Sampling:

| Lot Size | Sample Size |
| -------- | ----------- |
| 2-8      | 2           |
| 9-15     | 3           |
| 16-25    | 5           |
| 26-50    | 8           |
| 51-90    | 13          |
| 91-150   | 20          |
| 151-280  | 32          |
| 281-500  | 50          |
| 501-1200 | 80          |

### Inspection Checklist:

- [ ] Print quality (alignment, color)
- [ ] Sewing quality (seams, stitches)
- [ ] No stains or damages
- [ ] Correct size/label
- [ ] Complete assembly

---

## 🚚 Delivery Tracking Reference

### Delivery Methods:

- **Own Driver**: Company vehicle
- **3PL Courier**: LBC, J&T, Flash, etc.
- **Client Pickup**: Self-collection

### Tracking Status:

1. **PREPARING** - Packing in warehouse
2. **READY** - Awaiting pickup
3. **IN_TRANSIT** - On the way
4. **OUT_FOR_DELIVERY** - Near destination
5. **DELIVERED** - Completed
6. **FAILED** - Issue occurred

### Proof of Delivery:

- Photo of delivered items
- Recipient signature
- Delivery notes
- GPS timestamp

---

## 🔧 Troubleshooting Common Issues

### Can't Login?

1. Check caps lock
2. Verify email spelling
3. Try "Forgot Password"
4. Contact supervisor/IT

### QR Code Won't Scan?

1. Clean code surface
2. Better lighting
3. Hold closer/steadier
4. Use manual entry

### Page Not Loading?

1. Refresh page (F5)
2. Clear cache (Ctrl+Shift+Delete)
3. Try different browser
4. Check internet connection

### Data Not Saving?

1. Check all required fields filled
2. Wait for confirmation message
3. Check error messages
4. Try again
5. Contact IT if persists

### Print Preview Not Working?

1. Enable pop-ups in browser
2. Check printer connection
3. Try "Download PDF" instead
4. Use Chrome/Firefox

---

## ⌨️ Keyboard Shortcuts

### Navigation:

- **Ctrl + /**: Search orders
- **Ctrl + N**: New order (on orders page)
- **Ctrl + S**: Save form
- **Esc**: Close modal/dialog
- **F5**: Refresh page

### Editing:

- **Ctrl + Z**: Undo
- **Ctrl + Y**: Redo
- **Ctrl + C**: Copy
- **Ctrl + V**: Paste

### Browser:

- **Ctrl + T**: New tab
- **Ctrl + W**: Close tab
- **Ctrl + Tab**: Switch tabs
- **F11**: Full screen

---

## 📞 Emergency Contacts

### Production Issues:

- **Production Manager**: [ext. ____]
- **Quality Manager**: [ext. ____]
- **Maintenance**: [ext. ____]

### System/Tech Issues:

- **IT Support**: support@ashleyai.com
- **Phone**: [ext. ____]
- **Emergency**: [mobile number]

### Finance/Payments:

- **Finance Team**: finance@ashleyai.com
- **Phone**: [ext. ____]

### HR/Payroll:

- **HR Department**: hr@ashleyai.com
- **Phone**: [ext. ____]

### Client Support:

- **Customer Service**: support@ashleyai.com
- **Phone**: [main number]
- **Hours**: Mon-Fri 8AM-5PM

---

## 🔐 Security Reminders

### Password Best Practices:

- ✅ At least 12 characters
- ✅ Mix uppercase, lowercase, numbers, symbols
- ✅ Change every 90 days
- ✅ Don't share with anyone
- ✅ Don't reuse old passwords

### Account Security:

- ❌ Never share your login
- ❌ Don't write down passwords
- ❌ Don't login on public computers
- ✅ Logout when finished
- ✅ Enable 2FA if available
- ✅ Report suspicious activity

### Data Protection:

- Don't share client information
- Don't screenshot sensitive data
- Don't email passwords
- Lock screen when away
- Use secure connections only

---

## 📊 Common Reports

### Production Reports:

1. Go to Reports → Production
2. Select report type:
   - Daily output
   - Efficiency by operator
   - Defect rate
   - Material usage
3. Set date range
4. Click "Generate"
5. Export as PDF/Excel

### Financial Reports:

1. Go to Finance → Reports
2. Select report type:
   - Sales summary
   - Outstanding invoices
   - Payment history
   - Expense breakdown
3. Set period
4. Generate & export

### HR Reports:

1. Go to HR → Reports
2. Select:
   - Attendance summary
   - Payroll summary
   - Performance metrics
   - Overtime report
3. Set parameters
4. Generate

---

## 🎯 Performance Targets

### Production:

- **Cutting Efficiency**: ≥ 85%
- **Printing Quality**: ≥ 95% first-pass
- **Sewing Efficiency**: ≥ 80%
- **QC Pass Rate**: ≥ 98%

### Delivery:

- **On-Time Delivery**: ≥ 95%
- **Delivery Accuracy**: 100%

### Finance:

- **Collection Rate**: ≥ 90%
- **Invoice Accuracy**: 100%

### Quality:

- **Defect Rate**: ≤ 2%
- **Client Acceptance**: ≥ 99%

---

## 📝 Common Forms & Templates

### Order Form:

- Client details
- Product specifications
- Quantities by size
- Target delivery date
- Special instructions

### Design Approval:

- Design mockup
- Color specifications
- Print locations
- Size chart
- Approval signature

### QC Inspection:

- Batch/lot number
- Sample size (AQL)
- Defects found
- Pass/fail decision
- Inspector signature

### Delivery Receipt:

- Order number
- Items delivered
- Recipient name
- Signature & date
- Condition notes

---

## 🌟 Daily Checklist (by Role)

### CSR:

- [ ] Check new inquiries
- [ ] Follow up pending quotes
- [ ] Update order statuses
- [ ] Respond to client messages
- [ ] Review today's deliveries

### Production Operator:

- [ ] Clock in
- [ ] Check assigned tasks
- [ ] Scan bundles
- [ ] Update progress regularly
- [ ] Report issues immediately
- [ ] Clock out

### QC Inspector:

- [ ] Review batches for inspection
- [ ] Perform AQL inspections
- [ ] Document defects
- [ ] Create CAPA if needed
- [ ] Update QC dashboard

### Finance Staff:

- [ ] Process new payments
- [ ] Send invoices
- [ ] Follow up overdue accounts
- [ ] Reconcile bank transactions
- [ ] Update cash flow

### Manager:

- [ ] Review dashboard KPIs
- [ ] Approve pending items
- [ ] Check production progress
- [ ] Review quality reports
- [ ] Address escalations

---

## 🔍 Search Tips

### Finding Orders:

- Search by: Order number, PO, client name, product
- Use filters: Status, date range, brand
- Sort by: Date, priority, value

### Finding Clients:

- Search by: Name, email, phone, company
- Filter by: Status, location, brand
- View: Active only or all

### Finding Products:

- Search by: SKU, name, category
- Filter by: Type, print method
- Sort by: Popularity, recent

---

## 💡 Pro Tips

### Speed Up Work:

- ✅ Use keyboard shortcuts
- ✅ Scan QR codes instead of manual entry
- ✅ Update status in real-time (don't batch)
- ✅ Use templates for repeat tasks
- ✅ Bookmark frequently used pages

### Avoid Mistakes:

- ✅ Double-check quantities
- ✅ Verify client details before saving
- ✅ Review before final submission
- ✅ Take photos for documentation
- ✅ Ask if unsure

### Stay Organized:

- ✅ Process tasks in order
- ✅ Complete one before starting next
- ✅ Clear notifications regularly
- ✅ Keep workspace clean
- ✅ File documents properly

---

## 📱 Mobile Access Tips

### Best Practices:

- Use Chrome or Safari on mobile
- Add to home screen for quick access
- Rotate to landscape for tables
- Use QR scanner for speed
- Enable notifications

### Mobile URL:

Same as desktop - responsive design automatically adjusts!

---

## 🆘 When Things Go Wrong

### System Down?

1. Check internet connection
2. Try different device
3. Contact IT support
4. Use backup process (manual logs)

### Lost Data?

1. Check "Recent" or "History"
2. Look in "Archived"
3. Ask supervisor to restore
4. Contact IT for recovery

### Wrong Entry?

1. Edit if still possible
2. Create correction note
3. Report to supervisor
4. Document what happened

### Client Complaint?

1. Listen carefully
2. Document issue
3. Escalate to manager
4. Follow up until resolved

---

## 📚 Where to Find More Help

### Documentation:

- **Full User Guide**: docs/user-guides/USER-GUIDE.md
- **Admin Guide**: docs/user-guides/ADMIN-GUIDE.md
- **Production Guide**: docs/user-guides/PRODUCTION-STAFF-GUIDE.md
- **Client Portal Guide**: docs/user-guides/CLIENT-PORTAL-GUIDE.md

### In-App Help:

- Click **"?"** icon anywhere
- Use **AI Chat Assistant** (bottom right)
- Hover over **"ℹ️"** for tooltips

### Training:

- Ask supervisor for training session
- Watch demo videos (if available)
- Practice in test environment
- Shadow experienced colleague

---

## 🎉 Success Metrics

### You're Doing Great If:

- ✅ Tasks completed on time
- ✅ Few errors or rework
- ✅ Positive client feedback
- ✅ Meeting efficiency targets
- ✅ No system issues reported
- ✅ Team collaboration smooth

### Keep Improving:

- 📈 Track your performance metrics
- 📚 Learn new system features
- 🤝 Share tips with colleagues
- 💬 Provide feedback to management
- 🎯 Set personal improvement goals

---

**Print this reference card and keep it at your workstation!**

**For the latest version, visit**: docs/user-guides/QUICK-REFERENCE.md

---

**Document End**

_Ashley AI - Making manufacturing smarter, faster, better._
