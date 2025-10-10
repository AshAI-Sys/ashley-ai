# Ashley AI - Administrator Guide

**Version**: 1.0.0
**Last Updated**: October 10, 2025
**For**: System Administrators

---

## 📖 Table of Contents

1. [Administrator Overview](#administrator-overview)
2. [System Setup](#system-setup)
3. [User Management](#user-management)
4. [Configuration](#configuration)
5. [Security & Permissions](#security--permissions)
6. [System Maintenance](#system-maintenance)
7. [Monitoring & Analytics](#monitoring--analytics)
8. [Troubleshooting](#troubleshooting)
9. [Backup & Recovery](#backup--recovery)

---

## 👨‍💼 Administrator Overview

As an Ashley AI Administrator, you have full control over:
- System configuration
- User accounts and permissions
- Data management
- Security settings
- System health monitoring
- Backup and recovery
- Integration settings

### Admin Dashboard Access
- **URL**: http://localhost:3001/admin
- **Login**: Use admin credentials
- **Required Role**: Administrator

---

## 🔧 System Setup

### Initial System Configuration

#### 1. Workspace Setup
```
Navigate to: Settings → Workspace

Configure:
- Workspace name (e.g., "Ashley AI Factory")
- Company information
- Default timezone (Asia/Manila)
- Currency (PHP)
- Tax settings (VAT rate)
- Language preferences
```

#### 2. Database Configuration
```
Location: .env file or environment variables

Required:
- DATABASE_URL=your_database_connection
- JWT_SECRET=your_secret_key
- NODE_ENV=production
```

#### 3. Email Settings
```
Configure SMTP for notifications:
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASSWORD
- FROM_EMAIL
- FROM_NAME
```

#### 4. AI Integration (Optional)
```
For AI Chat Assistant:
- ANTHROPIC_API_KEY=your_claude_key
- OPENAI_API_KEY=your_openai_key
```

---

## 👥 User Management

### Creating New Users

**Step-by-Step**:
1. Navigate to Admin → Users
2. Click "New User"
3. Fill in user details:
   - Email (unique, required)
   - First Name
   - Last Name
   - Role (select from dropdown)
   - Department
   - Position
4. Set initial password (user can change)
5. Enable 2FA if required
6. Save

### User Roles Available

| Role | Access Level | Key Permissions |
|------|--------------|-----------------|
| **Administrator** | Full system | All permissions |
| **Manager** | Department-wide | Approve, override, reports |
| **CSR** | Client & Orders | Create/edit orders, client management |
| **Production** | Production floor | Update status, scan bundles |
| **QC Inspector** | Quality Control | Inspections, defects, CAPA |
| **Finance** | Finance module | Invoices, payments, reports |
| **HR Staff** | HR module | Employees, attendance, payroll |
| **Client** | Portal only | View orders, approve designs |

### Managing User Permissions

**Role-Based Access Control (RBAC)**:
```
Navigate to: Admin → Roles & Permissions

Available Permissions:
- orders.create
- orders.edit
- orders.view
- orders.delete
- clients.create
- clients.edit
- designs.approve
- production.update
- finance.view
- finance.edit
- reports.view
- system.admin
```

**Custom Permission Sets**:
1. Create new role
2. Select permissions
3. Assign to users
4. Save configuration

### Bulk User Operations

**Import Users**:
```
1. Prepare CSV file with columns:
   email, first_name, last_name, role, department

2. Go to Admin → Users → Import
3. Upload CSV
4. Review mapping
5. Confirm import
```

**Export Users**:
```
Admin → Users → Export → Select format (CSV/Excel)
```

---

## ⚙️ Configuration

### General Settings

#### System Preferences
```
Settings → General

- Company Name
- Logo upload
- Default language
- Date format
- Time format
- Number format
- Currency symbol
```

#### Business Rules
```
Settings → Business Rules

Order Settings:
- Minimum order quantity
- Lead time defaults
- Auto-approval thresholds
- Price rounding rules

Production Settings:
- Bundle size defaults
- QC sampling plans (AQL levels)
- Efficiency thresholds
- Overtime rules

Finance Settings:
- Payment terms defaults
- Tax rates
- Discount limits
- Credit limits per client
```

### Module Configuration

#### 1. Order Management
```
Settings → Orders

- Order number format (e.g., ORD-2025-{sequential})
- Status workflow customization
- Required fields configuration
- Auto-notifications settings
```

#### 2. Production
```
Settings → Production

Cutting:
- Fabric wastage allowance (%)
- Bundle size ranges
- QR code format

Printing:
- Machine efficiency targets
- Material usage tracking
- Quality thresholds

Sewing:
- Piece rate multipliers
- Efficiency standards
- Overtime calculations
```

#### 3. Quality Control
```
Settings → Quality Control

- AQL sampling plans
- Defect severity levels
- CAPA workflows
- Auto-hold thresholds
```

#### 4. Finance
```
Settings → Finance

- Invoice templates
- Payment terms options
- Tax configurations
- Bank account details
- Accounting period (monthly/quarterly)
```

---

## 🔒 Security & Permissions

### Security Best Practices

#### 1. Password Policy
```
Settings → Security → Password Policy

Requirements:
- Minimum 12 characters
- Must include uppercase, lowercase, number, special char
- Cannot reuse last 5 passwords
- Expires every 90 days (configurable)
- Account lockout after 5 failed attempts
```

#### 2. Two-Factor Authentication (2FA)
```
Enable for sensitive roles:
- Administrators
- Finance staff
- Managers

Settings → Security → 2FA
- Enable/disable per role
- Choose method (TOTP app)
- Backup codes
```

#### 3. IP Whitelisting (Optional)
```
Settings → Security → IP Whitelist

Add trusted IPs:
- Office network
- VPN endpoints
- Admin home IPs
```

#### 4. Audit Logging
```
View audit logs:
Admin → Audit Logs

Tracks:
- User logins/logouts
- Data modifications
- Permission changes
- Failed login attempts
- Critical operations
```

### Data Security

#### Field-Level Encryption
```
Sensitive data automatically encrypted:
- User passwords (bcrypt)
- Payment information
- Personal employee data (PII)
- Client financial data
```

#### Row-Level Security (RLS)
```
Automatic filtering by:
- workspace_id (multi-tenant isolation)
- user permissions
- department access
```

---

## 🛠️ System Maintenance

### Regular Maintenance Tasks

#### Daily
- [x] Check system health dashboard
- [x] Review error logs
- [x] Monitor disk space
- [x] Check backup status
- [x] Review security alerts

#### Weekly
- [x] Clear temporary files
- [x] Review user activity logs
- [x] Check database performance
- [x] Update system status reports
- [x] Review automation rules

#### Monthly
- [x] Database optimization (VACUUM, ANALYZE)
- [x] Archive old data
- [x] Review and rotate logs
- [x] Update documentation
- [x] Security audit

#### Quarterly
- [x] Full system backup
- [x] Disaster recovery test
- [x] Performance review
- [x] Update dependencies
- [x] Security patch review

### Database Maintenance

#### Prisma Database Commands
```bash
# Generate Prisma Client
cd packages/database
npx prisma generate

# Push schema changes
npx prisma db push

# Create migration
npx prisma migrate dev --name description

# Run migrations in production
npx prisma migrate deploy

# View database in Prisma Studio
npx prisma studio
```

#### Database Optimization
```sql
-- SQLite (Development)
VACUUM;
ANALYZE;

-- PostgreSQL (Production)
VACUUM ANALYZE;
REINDEX DATABASE dbname;
```

### Log Management

#### View Logs
```bash
# Application logs (if configured)
tail -f services/ash-admin/logs/app.log

# Error logs
tail -f services/ash-admin/logs/error.log

# Access logs
tail -f services/ash-admin/logs/access.log
```

#### Log Rotation
```
Configured to rotate:
- Daily for access logs
- Weekly for application logs
- Immediately for error logs >100MB
- Keep last 30 days
```

---

## 📊 Monitoring & Analytics

### System Health Dashboard

**Access**: Admin → System Health

**Metrics Displayed**:
- Server uptime
- CPU usage
- Memory usage
- Database connections
- API response times
- Active users
- Error rates
- Queue status

### Performance Monitoring

#### Key Performance Indicators (KPIs)

**System Performance**:
```
- API Response Time (p95 < 500ms)
- Database Query Time (p95 < 100ms)
- Page Load Time (< 2s)
- Error Rate (< 1%)
- Uptime (> 99.9%)
```

**Business Metrics**:
```
- Orders processed/day
- Production efficiency %
- Quality pass rate
- On-time delivery %
- Revenue per day
```

### Analytics & Reports

#### Available Reports
1. **User Activity Report**
   - Login frequency
   - Feature usage
   - Time spent per module

2. **System Performance Report**
   - Response times by endpoint
   - Database performance
   - Error frequency

3. **Business Intelligence Report**
   - Production metrics
   - Financial summary
   - Quality metrics
   - Delivery performance

#### Generating Reports
```
Admin → Reports → Select Report Type
- Choose date range
- Select filters
- Click "Generate"
- Export as PDF/Excel/CSV
```

---

## 🔍 Troubleshooting

### Common Admin Issues

#### 1. User Cannot Login
**Diagnosis**:
```
Admin → Users → Search user
Check:
- Account is active (not disabled)
- Password not expired
- Not locked out
- Email verified
- Has correct role
```

**Solution**:
- Reset password
- Unlock account
- Enable account
- Resend verification email

#### 2. Slow System Performance
**Diagnosis**:
```
Admin → System Health
Check:
- Server resources (CPU/Memory)
- Database connections
- Active queries
- Error logs
```

**Solutions**:
- Restart services if needed
- Clear cache
- Optimize slow queries
- Scale resources

#### 3. Module Not Working
**Diagnosis**:
```
Check:
- Module is enabled
- User has permissions
- No errors in console (F12)
- Database connection OK
```

**Solution**:
- Enable module in settings
- Grant permissions
- Clear browser cache
- Check error logs

#### 4. Email Notifications Not Sending
**Diagnosis**:
```
Settings → Email Configuration
Test:
- SMTP settings correct
- Send test email
- Check email logs
- Verify firewall rules
```

**Solution**:
- Update SMTP settings
- Check credentials
- Verify port access (587/465)
- Review email service status

---

## 💾 Backup & Recovery

### Backup Strategy

#### Automated Backups
```
Configured in: Settings → Backups

Schedule:
- Database: Daily at 2:00 AM
- Files: Weekly (Sundays at 3:00 AM)
- Full system: Monthly (1st of month)

Retention:
- Daily: Keep 7 days
- Weekly: Keep 4 weeks
- Monthly: Keep 12 months
```

#### Manual Backup
```bash
# Database backup
npm run backup:db

# Full system backup
./backup-clean.ps1  # Windows PowerShell
# or
./scripts/backup.sh  # Linux
```

### Backup Locations

**Local Storage**:
```
/backups/
  ├── daily/
  ├── weekly/
  └── monthly/
```

**Cloud Storage** (Recommended):
```
Configure in .env:
- AWS_S3_BUCKET
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY

Or use:
- Google Cloud Storage
- Azure Blob Storage
- Backblaze B2
```

### Recovery Procedures

#### Database Recovery
```bash
# Restore from backup
cd packages/database

# For SQLite
cp backups/dev.db.backup prisma/dev.db

# For PostgreSQL
pg_restore -d database_name backup_file.dump
```

#### Full System Recovery
```bash
# 1. Stop services
pnpm stop

# 2. Restore database
# (see above)

# 3. Restore files
cp -r backups/uploads/ uploads/
cp backups/.env .env

# 4. Regenerate Prisma client
cd packages/database
npx prisma generate

# 5. Restart services
pnpm --filter @ash/admin dev
```

#### Disaster Recovery Checklist
- [ ] Restore database from latest backup
- [ ] Restore uploaded files
- [ ] Restore environment configuration
- [ ] Verify all services running
- [ ] Test critical functions
- [ ] Notify users of any data loss
- [ ] Document incident
- [ ] Update recovery procedures

---

## 🔧 Advanced Configuration

### Environment Variables

**Essential Variables**:
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Security
JWT_SECRET=your_random_secret_here
SESSION_SECRET=another_random_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# AI Services (Optional)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# File Storage (Optional)
CLOUDINARY_URL=cloudinary://...
AWS_S3_BUCKET=your-bucket-name

# Monitoring (Optional)
SENTRY_DSN=https://...
```

### API Configuration

#### Rate Limiting
```
Settings → API → Rate Limits

Default limits:
- Anonymous: 10 requests/minute
- Authenticated: 100 requests/minute
- Admin: 1000 requests/minute

Customize per endpoint if needed
```

#### CORS Settings
```
Settings → API → CORS

Allowed origins:
- http://localhost:3001 (admin)
- http://localhost:3003 (portal)
- https://yourdomain.com (production)
```

### Integration Settings

#### 3PL Courier Integration
```
Settings → Integrations → 3PL

Configure:
- API keys per courier
- Webhook endpoints
- Default carrier preferences
- Rate calculation rules
```

#### Payment Gateway
```
Settings → Integrations → Payments

Supported:
- Stripe
- PayPal
- PayMongo (Philippines)

Configure:
- API keys (public and secret)
- Webhook URLs
- Currency
- Payment methods enabled
```

---

## 📞 Support & Resources

### Getting Administrative Help

**Internal Support**:
- Check this Admin Guide
- Review system logs
- Use AI Chat Assistant
- Consult API documentation

**External Support**:
- GitHub Issues: https://github.com/AshAI-Sys/ashley-ai/issues
- Email: admin-support@ashleyai.com
- Emergency: [Your emergency contact]

### Useful Commands

```bash
# Start development server
pnpm --filter @ash/admin dev

# Build for production
cd services/ash-admin
pnpm build

# Run tests
pnpm test

# Database operations
cd packages/database
npx prisma studio          # View database
npx prisma generate        # Generate client
npx prisma db push         # Push schema changes

# View logs
tail -f services/ash-admin/logs/*.log

# Check system status
pnpm --filter @ash/admin health-check
```

---

## 📚 Additional Resources

- **User Guide**: For end-users
- **API Documentation**: docs/API_DOCUMENTATION.md
- **Production Deployment**: docs/PRODUCTION_DEPLOYMENT_GUIDE.md
- **Security Guide**: SECURITY-AUDIT-REPORT.md
- **Performance Guide**: docs/PERFORMANCE-OPTIMIZATION-GUIDE.md

---

## 📝 Appendix

### System Requirements

**Server Requirements**:
- Node.js 20+
- 4GB RAM minimum (8GB recommended)
- 50GB disk space minimum
- PostgreSQL 14+ or SQLite
- Redis (optional, for caching)

**Client Requirements**:
- Modern web browser (Chrome, Firefox, Safari, Edge)
- 1024x768 resolution minimum
- Stable internet connection (1 Mbps+)

### Glossary

- **RBAC**: Role-Based Access Control
- **2FA**: Two-Factor Authentication
- **SMTP**: Simple Mail Transfer Protocol
- **API**: Application Programming Interface
- **CORS**: Cross-Origin Resource Sharing
- **JWT**: JSON Web Token
- **RLS**: Row-Level Security
- **AQL**: Acceptable Quality Limit
- **CAPA**: Corrective and Preventive Action
- **3PL**: Third-Party Logistics

---

**Document End**

*For system updates and changes, refer to CLAUDE.md in the root directory.*
