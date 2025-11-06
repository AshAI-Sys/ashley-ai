# Google Sheets Real-Time Sync Setup Guide

## Overview

Ashley AI can automatically sync your manufacturing data to Google Sheets in real-time for easy reporting and analysis. This guide will walk you through setting up the integration.

## ✅ Features

- **Real-Time Sync**: One-click sync of database to Google Sheets
- **Multiple Sheets**: Organized tabs for Orders, Clients, Inventory, Production, Finance, and HR
- **Automatic Formatting**: Headers and frozen rows included
- **Selective Sync**: Sync only the data you need
- **Google Account**: Uses ashai.system@gmail.com

## 📋 Prerequisites

- Google Cloud Project with API access
- Google Service Account credentials
- Access to ashai.system@gmail.com

## 🚀 Setup Instructions

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a Project" → "New Project"
3. Enter project name: **"Ashley AI Data Sync"**
4. Click "Create"

### Step 2: Enable Required APIs

1. In Google Cloud Console, go to "APIs & Services" → "Enable APIs and Services"
2. Search for and enable:
   - **Google Sheets API**
   - **Google Drive API**

### Step 3: Create Service Account

1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Enter details:
   - **Service account name**: `ashley-ai-sheets-sync`
   - **Service account ID**: `ashley-ai-sheets-sync`
   - **Description**: "Service account for Ashley AI to Google Sheets sync"
4. Click "Create and Continue"
5. Grant roles:
   - **Role**: "Editor" (or "Service Account User")
6. Click "Continue" then "Done"

### Step 4: Generate JSON Key

1. Click on the newly created service account
2. Go to "Keys" tab
3. Click "Add Key" → "Create New Key"
4. Select **JSON** format
5. Click "Create"
6. A JSON file will be downloaded (keep this file secure!)

### Step 5: Share Google Sheet (Optional)

If you want to use a specific Google Sheet:

1. Open your Google Sheet
2. Click "Share"
3. Add the service account email (from the JSON file)
   - It looks like: `ashley-ai-sheets-sync@ashley-ai-data-sync.iam.gserviceaccount.com`
4. Grant "Editor" permissions

**Note**: Ashley AI will automatically create a new spreadsheet if you don't provide one.

### Step 6: Configure Environment Variables

Add the following to your `.env` file or Vercel environment variables:

```env
# Google Sheets Integration
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"ashley-ai-data-sync","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"ashley-ai-sheets-sync@ashley-ai-data-sync.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'
```

**Important**:
- Copy the entire JSON file contents and paste it as a single-line string
- Keep quotes around the value
- Make sure the private key's `\n` characters are preserved

#### For Vercel Deployment:

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add new variable:
   - **Name**: `GOOGLE_SERVICE_ACCOUNT_JSON`
   - **Value**: Paste the entire JSON file contents (as single line)
   - **Environment**: Production, Preview, Development
4. Click "Save"
5. Redeploy your application

### Step 7: Apply Database Migration

Run Prisma migration to add SystemSettings table:

```bash
cd packages/database
npx prisma db push
```

### Step 8: Test the Integration

1. Log in to Ashley AI admin panel
2. Navigate to **Integrations → Google Sheets**
   - URL: `http://localhost:3001/integrations/google-sheets`
3. You should see "Google Sheets Configured" status
4. Click "Sync All Data" button
5. Click "Open Spreadsheet" to view synced data

## 📊 Spreadsheet Structure

The integration creates a spreadsheet with the following sheets:

### 1. Orders Sheet
- Order Number
- Client
- Brand
- Status
- Total Amount
- Currency
- Delivery Date
- Created At
- Notes

### 2. Clients Sheet
- Client Name
- Contact Person
- Email
- Phone
- Payment Terms (days)
- Credit Limit
- Status
- Created At

### 3. Inventory Sheet
- Item Name
- SKU
- Category
- Unit
- Quantity
- Reorder Point
- Unit Cost
- Location
- Last Updated

### 4. Production Sheet
- Run Number
- Order
- Status
- Total Bundles
- Total Pieces
- Efficiency %
- Started At
- Completed At

### 5. Finance Sheet
- Invoice Number
- Client
- Amount
- Amount Paid
- Status
- Due Date
- Issue Date
- Payment Method

### 6. HR Sheet
- Employee Name
- Email
- Position
- Department
- Salary Type
- Salary Amount
- Status
- Hire Date

## 🔧 Usage

### Manual Sync

1. Go to **Integrations → Google Sheets**
2. Click sync button for specific data type or "Sync All Data"
3. Wait for confirmation message
4. Click "Open Spreadsheet" to view updated data

### Sync via API

```bash
# Sync all data
curl -X POST http://localhost:3001/api/google-sheets/sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"all"}'

# Sync specific data type
curl -X POST http://localhost:3001/api/google-sheets/sync \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"orders"}'
```

Available sync types:
- `all` - Sync all data
- `orders` - Orders and production data
- `clients` - Client information
- `inventory` - Inventory items
- `production` - Production runs
- `finance` - Invoices and payments
- `hr` - Employee data

## 🔒 Security Best Practices

1. **Never commit** the JSON credentials file to Git
2. Add `*.json` to `.gitignore` if not already present
3. Use environment variables for credentials
4. Restrict service account permissions to minimum required
5. Regularly rotate service account keys
6. Monitor service account usage in Google Cloud Console

## 🐛 Troubleshooting

### Error: "GOOGLE_SERVICE_ACCOUNT_JSON environment variable not set"

**Solution**: Add the environment variable with your JSON credentials.

### Error: "Failed to create spreadsheet"

**Possible causes**:
1. Google Sheets API not enabled
2. Service account doesn't have proper permissions
3. Invalid JSON credentials

**Solution**:
- Verify APIs are enabled in Google Cloud Console
- Check service account has "Editor" role
- Validate JSON format

### Error: "Permission denied"

**Solution**:
- Make sure the service account email has access to the spreadsheet
- If using existing spreadsheet, share it with the service account email

### Sync is slow

**Note**: Syncing large datasets (1000+ records) may take 10-30 seconds. This is normal.

## 📝 File Locations

- **Sync Library**: `services/ash-admin/src/lib/google-sheets-sync.ts`
- **API Endpoint**: `services/ash-admin/src/app/api/google-sheets/sync/route.ts`
- **UI Page**: `services/ash-admin/src/app/integrations/google-sheets/page.tsx`
- **Database Model**: `packages/database/prisma/schema.prisma` (SystemSettings)

## 💡 Tips

1. **First Sync**: Run "Sync All Data" to initialize all sheets
2. **Regular Updates**: Sync daily or weekly depending on your needs
3. **Data Limits**: Each sheet is limited to recent 1000-5000 records
4. **Backup**: Google Sheets serves as a convenient backup of your data
5. **Sharing**: You can share the Google Sheet with team members for read-only access

## 🆘 Support

If you encounter issues:
1. Check the console logs in the browser (F12)
2. Check server logs for detailed error messages
3. Verify all environment variables are set correctly
4. Ensure Google Cloud APIs are enabled

## 📚 Additional Resources

- [Google Sheets API Documentation](https://developers.google.com/sheets/api/guides/concepts)
- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)
- [Prisma Documentation](https://www.prisma.io/docs)
