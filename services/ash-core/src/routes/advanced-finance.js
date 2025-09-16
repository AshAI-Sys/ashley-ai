const express = require('express');
const router = express.Router();
const financeController = require('../controllers/advanced-finance-controller');
const { authenticateToken } = require('../middleware/auth');

// ===== ACCOUNTS RECEIVABLE (AR) =====

// Invoices
router.get('/invoices/:workspaceId', authenticateToken, financeController.getInvoices);
router.get('/invoices/:workspaceId/:invoiceId', authenticateToken, financeController.getInvoiceById);
router.post('/invoices', authenticateToken, financeController.createInvoice);
router.patch('/invoices/:invoiceId', authenticateToken, financeController.updateInvoice);
router.post('/invoices/:invoiceId/send', authenticateToken, financeController.sendInvoice);

// Payments
router.get('/payments/:workspaceId', authenticateToken, financeController.getPayments);
router.post('/payments', authenticateToken, financeController.recordPayment);
router.post('/payments/:paymentId/allocate', authenticateToken, financeController.allocatePayment);

// Credit Notes & Refunds
router.get('/credit-notes/:workspaceId', authenticateToken, financeController.getCreditNotes);
router.post('/credit-notes', authenticateToken, financeController.createCreditNote);
router.post('/refunds', authenticateToken, financeController.processRefund);

// Aging Reports
router.get('/aging-report/:workspaceId', authenticateToken, financeController.getAgingReport);

// ===== ACCOUNTS PAYABLE (AP) =====

// Bills
router.get('/bills/:workspaceId', authenticateToken, financeController.getBills);
router.get('/bills/:workspaceId/:billId', authenticateToken, financeController.getBillById);
router.post('/bills', authenticateToken, financeController.createBill);
router.patch('/bills/:billId', authenticateToken, financeController.updateBill);

// Vendor Payments
router.get('/vendor-payments/:workspaceId', authenticateToken, financeController.getVendorPayments);
router.post('/vendor-payments', authenticateToken, financeController.createVendorPayment);
router.patch('/vendor-payments/:paymentId/approve', authenticateToken, financeController.approveVendorPayment);

// ===== COSTING & P&L =====

// PO Cost Sheets
router.get('/po-costs/:workspaceId/:orderId', authenticateToken, financeController.getPOCostSheet);
router.post('/po-costs/:orderId/calculate', authenticateToken, financeController.calculatePOCosts);
router.patch('/po-costs/:orderId', authenticateToken, financeController.updatePOCosts);

// Brand/Channel P&L
router.get('/pnl/:workspaceId/brand/:brandId', authenticateToken, financeController.getBrandPnL);
router.get('/pnl/:workspaceId/channel/:channel', authenticateToken, financeController.getChannelPnL);
router.get('/pnl/:workspaceId/summary', authenticateToken, financeController.getPnLSummary);

// Settlement Imports
router.post('/settlements/import', authenticateToken, financeController.importSettlements);
router.get('/settlements/:workspaceId', authenticateToken, financeController.getSettlements);

// ===== FINANCIAL REPORTS =====

// General Ledger Export
router.get('/reports/gl-export/:workspaceId', authenticateToken, financeController.exportGeneralLedger);

// BIR Compliance Reports
router.get('/reports/bir-sales/:workspaceId', authenticateToken, financeController.getBIRSalesReport);
router.get('/reports/bir-purchases/:workspaceId', authenticateToken, financeController.getBIRPurchasesReport);

// Government Compliance
router.get('/reports/sss-schedule/:workspaceId', authenticateToken, financeController.getSSSSchedule);
router.get('/reports/philhealth-schedule/:workspaceId', authenticateToken, financeController.getPhilHealthSchedule);
router.get('/reports/pagibig-schedule/:workspaceId', authenticateToken, financeController.getPagIBIGSchedule);

// ===== FINANCIAL ANALYTICS & FORECASTING =====

// Cashflow Forecast
router.get('/analytics/cashflow/:workspaceId', authenticateToken, financeController.getCashflowForecast);

// Financial KPIs
router.get('/analytics/kpis/:workspaceId', authenticateToken, financeController.getFinancialKPIs);

// Margin Analysis
router.get('/analytics/margins/:workspaceId', authenticateToken, financeController.getMarginAnalysis);

// Variance Analysis
router.get('/analytics/variance/:workspaceId', authenticateToken, financeController.getVarianceAnalysis);

module.exports = router;
module.exports.advancedFinanceRouter = router;