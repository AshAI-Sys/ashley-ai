/**
 * Google Sheets Real-Time Sync Service
 * Automatically syncs Ashley AI database data to Google Sheets
 * Account: ashai.system@gmail.com
 */

import { google } from 'googleapis';
import { prisma } from './db';

// Google Sheets API Configuration
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Service Account Credentials (from Google Cloud Console)
// You need to create these at: https://console.cloud.google.com
interface GoogleCredentials {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

/**
 * Get authenticated Google Sheets API client
 */
export async function getGoogleSheetsClient() {
  try {
    // Load credentials from environment variable
    const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

    if (!credentialsJson) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON environment variable not set');
    }

    const credentials: GoogleCredentials = JSON.parse(credentialsJson);

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient as any });

    return sheets;
  } catch (error: any) {
    console.error('❌ Failed to initialize Google Sheets client:', error.message);
    throw error;
  }
}

/**
 * Create or get the main Ashley AI spreadsheet
 */
export async function getOrCreateSpreadsheet() {
  try {
    const sheets = await getGoogleSheetsClient();

    // Check if spreadsheet ID is stored in database
    const settings = await prisma.systemSettings.findFirst({
      where: { key: 'google_sheets_spreadsheet_id' },
    });

    if (settings?.value) {
      return settings.value;
    }

    // Create new spreadsheet
    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: 'Ashley AI - Manufacturing Data Sync',
        },
        sheets: [
          { properties: { title: 'Orders', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'Clients', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'Inventory', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'Production', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'Finance', gridProperties: { frozenRowCount: 1 } } },
          { properties: { title: 'HR', gridProperties: { frozenRowCount: 1 } } },
        ],
      },
    });

    const spreadsheetId = response.data.spreadsheetId!;

    // Save spreadsheet ID to database
    await prisma.systemSettings.upsert({
      where: { key: 'google_sheets_spreadsheet_id' },
      create: {
        key: 'google_sheets_spreadsheet_id',
        value: spreadsheetId,
        description: 'Google Sheets Spreadsheet ID for data sync',
      },
      update: {
        value: spreadsheetId,
      },
    });

    // Share spreadsheet with ashai.system@gmail.com
    const drive = google.drive({ version: 'v3', auth: (await getGoogleSheetsClient()).context._options.auth });
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        type: 'user',
        role: 'writer',
        emailAddress: 'ashai.system@gmail.com',
      },
    });

    console.log('✅ Created new spreadsheet:', spreadsheetId);
    console.log('📊 Spreadsheet URL:', `https://docs.google.com/spreadsheets/d/${spreadsheetId}`);

    return spreadsheetId;
  } catch (error: any) {
    console.error('❌ Failed to create spreadsheet:', error.message);
    throw error;
  }
}

/**
 * Sync Orders data to Google Sheets
 */
export async function syncOrdersToSheets(workspaceId: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getOrCreateSpreadsheet();

    // Fetch orders from database
    const orders = await prisma.order.findMany({
      where: { workspace_id: workspaceId },
      include: {
        client: true,
        brand: true,
      },
      orderBy: { created_at: 'desc' },
      take: 1000, // Limit to recent 1000 orders
    });

    // Prepare data for sheets
    const headers = [
      'Order Number',
      'Client',
      'Brand',
      'Status',
      'Total Amount',
      'Currency',
      'Delivery Date',
      'Created At',
      'Notes',
    ];

    const rows = orders.map(order => [
      order.order_number,
      order.client?.name || '',
      order.brand?.name || '',
      order.status,
      order.total_amount,
      order.currency,
      order.delivery_date?.toISOString().split('T')[0] || '',
      order.created_at.toISOString().split('T')[0],
      order.notes || '',
    ]);

    // Clear existing data and write new data
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Orders!A:Z',
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Orders!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers, ...rows],
      },
    });

    console.log(`✅ Synced ${orders.length} orders to Google Sheets`);
    return { success: true, count: orders.length };
  } catch (error: any) {
    console.error('❌ Failed to sync orders:', error.message);
    throw error;
  }
}

/**
 * Sync Clients data to Google Sheets
 */
export async function syncClientsToSheets(workspaceId: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getOrCreateSpreadsheet();

    const clients = await prisma.client.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { created_at: 'desc' },
    });

    const headers = [
      'Client Name',
      'Contact Person',
      'Email',
      'Phone',
      'Payment Terms (days)',
      'Credit Limit',
      'Status',
      'Created At',
    ];

    const rows = clients.map(client => [
      client.name,
      client.contact_person || '',
      client.email || '',
      client.phone || '',
      client.payment_terms || 0,
      client.credit_limit || 0,
      client.is_active ? 'Active' : 'Inactive',
      client.created_at.toISOString().split('T')[0],
    ]);

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Clients!A:Z',
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Clients!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers, ...rows],
      },
    });

    console.log(`✅ Synced ${clients.length} clients to Google Sheets`);
    return { success: true, count: clients.length };
  } catch (error: any) {
    console.error('❌ Failed to sync clients:', error.message);
    throw error;
  }
}

/**
 * Sync Inventory data to Google Sheets
 */
export async function syncInventoryToSheets(workspaceId: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getOrCreateSpreadsheet();

    const inventory = await prisma.inventoryItem.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { updated_at: 'desc' },
      take: 5000,
    });

    const headers = [
      'Item Name',
      'SKU',
      'Category',
      'Unit',
      'Quantity',
      'Reorder Point',
      'Unit Cost',
      'Location',
      'Last Updated',
    ];

    const rows = inventory.map(item => [
      item.name,
      item.sku || '',
      item.category || '',
      item.unit || '',
      item.quantity,
      item.reorder_point || 0,
      item.unit_cost || 0,
      item.location || '',
      item.updated_at.toISOString().split('T')[0],
    ]);

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Inventory!A:Z',
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Inventory!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers, ...rows],
      },
    });

    console.log(`✅ Synced ${inventory.length} inventory items to Google Sheets`);
    return { success: true, count: inventory.length };
  } catch (error: any) {
    console.error('❌ Failed to sync inventory:', error.message);
    throw error;
  }
}

/**
 * Sync Production data to Google Sheets
 */
export async function syncProductionToSheets(workspaceId: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getOrCreateSpreadsheet();

    const cuttingRuns = await prisma.cuttingRun.findMany({
      where: { workspace_id: workspaceId },
      include: { order: true },
      orderBy: { created_at: 'desc' },
      take: 500,
    });

    const headers = [
      'Run Number',
      'Order',
      'Status',
      'Total Bundles',
      'Total Pieces',
      'Efficiency %',
      'Started At',
      'Completed At',
    ];

    const rows = cuttingRuns.map(run => [
      run.run_number,
      run.order?.order_number || '',
      run.status,
      run.total_bundles || 0,
      run.total_pieces || 0,
      run.efficiency_percentage || 0,
      run.started_at?.toISOString().split('T')[0] || '',
      run.completed_at?.toISOString().split('T')[0] || '',
    ]);

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Production!A:Z',
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Production!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers, ...rows],
      },
    });

    console.log(`✅ Synced ${cuttingRuns.length} production runs to Google Sheets`);
    return { success: true, count: cuttingRuns.length };
  } catch (error: any) {
    console.error('❌ Failed to sync production:', error.message);
    throw error;
  }
}

/**
 * Sync Finance data to Google Sheets
 */
export async function syncFinanceToSheets(workspaceId: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getOrCreateSpreadsheet();

    const invoices = await prisma.invoice.findMany({
      where: { workspace_id: workspaceId },
      include: { client: true },
      orderBy: { created_at: 'desc' },
      take: 1000,
    });

    const headers = [
      'Invoice Number',
      'Client',
      'Amount',
      'Amount Paid',
      'Status',
      'Due Date',
      'Issue Date',
      'Payment Method',
    ];

    const rows = invoices.map(invoice => [
      invoice.invoice_number,
      invoice.client?.name || '',
      invoice.total_amount,
      invoice.amount_paid || 0,
      invoice.status,
      invoice.due_date?.toISOString().split('T')[0] || '',
      invoice.issue_date.toISOString().split('T')[0],
      invoice.payment_method || '',
    ]);

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'Finance!A:Z',
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Finance!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers, ...rows],
      },
    });

    console.log(`✅ Synced ${invoices.length} invoices to Google Sheets`);
    return { success: true, count: invoices.length };
  } catch (error: any) {
    console.error('❌ Failed to sync finance:', error.message);
    throw error;
  }
}

/**
 * Sync HR data to Google Sheets
 */
export async function syncHRToSheets(workspaceId: string) {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = await getOrCreateSpreadsheet();

    const employees = await prisma.employee.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { created_at: 'desc' },
    });

    const headers = [
      'Employee Name',
      'Email',
      'Position',
      'Department',
      'Salary Type',
      'Salary Amount',
      'Status',
      'Hire Date',
    ];

    const rows = employees.map(emp => [
      `${emp.first_name} ${emp.last_name}`,
      emp.email || '',
      emp.position || '',
      emp.department || '',
      emp.salary_type || '',
      emp.salary_amount || 0,
      emp.is_active ? 'Active' : 'Inactive',
      emp.hire_date?.toISOString().split('T')[0] || '',
    ]);

    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'HR!A:Z',
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'HR!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers, ...rows],
      },
    });

    console.log(`✅ Synced ${employees.length} employees to Google Sheets`);
    return { success: true, count: employees.length };
  } catch (error: any) {
    console.error('❌ Failed to sync HR:', error.message);
    throw error;
  }
}

/**
 * Sync all data to Google Sheets
 */
export async function syncAllDataToSheets(workspaceId: string) {
  try {
    console.log('🔄 Starting full data sync to Google Sheets...');

    const results = await Promise.allSettled([
      syncOrdersToSheets(workspaceId),
      syncClientsToSheets(workspaceId),
      syncInventoryToSheets(workspaceId),
      syncProductionToSheets(workspaceId),
      syncFinanceToSheets(workspaceId),
      syncHRToSheets(workspaceId),
    ]);

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ Sync complete: ${successful} successful, ${failed} failed`);

    return {
      success: failed === 0,
      successful,
      failed,
      results,
    };
  } catch (error: any) {
    console.error('❌ Full sync failed:', error.message);
    throw error;
  }
}

/**
 * Get Google Sheets URL
 */
export async function getGoogleSheetsUrl() {
  try {
    const spreadsheetId = await getOrCreateSpreadsheet();
    return `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
  } catch (error: any) {
    console.error('❌ Failed to get spreadsheet URL:', error.message);
    return null;
  }
}
