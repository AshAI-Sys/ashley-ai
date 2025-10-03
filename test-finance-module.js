// Finance Module Complete Testing Suite
const CLIENT_ID = "cmgal7ds70005nra2lajao1hu";
const ORDER_ID = "cmgal89mc0007nra2wfuzhto3";

async function apiCall(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (data) options.body = JSON.stringify(data);

  const response = await fetch(`http://localhost:3001${endpoint}`, options);
  const result = await response.json();
  return { status: response.status, data: result, ok: response.ok };
}

// TEST 1: Create Invoice
async function testInvoiceCreation() {
  console.log('\n💰 TEST 1: CREATE INVOICE');
  console.log('='.repeat(60));

  const invoiceData = {
    clientId: CLIENT_ID,
    orderId: ORDER_ID,
    invoiceNumber: "INV-2025-001",
    invoiceDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    subtotal: 250000,
    taxRate: 12,
    taxAmount: 30000,
    totalAmount: 280000,
    currency: "PHP",
    status: "DRAFT",
    notes: "Test invoice for production order",
    lineItems: [
      {
        description: "T-Shirt Production - 1000 pcs",
        quantity: 1000,
        unitPrice: 250,
        amount: 250000
      }
    ]
  };

  const result = await apiCall('/api/finance/invoices', 'POST', invoiceData);
  console.log('📊 Status:', result.status);
  console.log('📦 Response:', JSON.stringify(result.data, null, 2));

  if (result.ok) {
    console.log('✅ Invoice created successfully!');
    return result.data.data;
  } else {
    console.log('❌ Failed to create invoice');
    console.log('Error:', result.data.error || result.data.details);
    return null;
  }
}

// TEST 2: Create Payment
async function testPaymentProcessing(invoiceId) {
  console.log('\n💳 TEST 2: PROCESS PAYMENT');
  console.log('='.repeat(60));

  const paymentData = {
    invoiceId: invoiceId,
    amount: 280000,
    paymentMethod: "BANK_TRANSFER",
    paymentDate: new Date().toISOString(),
    referenceNumber: "REF-" + Date.now(),
    notes: "Full payment via bank transfer"
  };

  const result = await apiCall('/api/finance/payments', 'POST', paymentData);
  console.log('📊 Status:', result.status);
  console.log('📦 Response:', JSON.stringify(result.data, null, 2));

  if (result.ok) {
    console.log('✅ Payment processed successfully!');
    return result.data.data;
  } else {
    console.log('❌ Failed to process payment');
    console.log('Error:', result.data.error || result.data.details);
    return null;
  }
}

// TEST 3: Create Credit Note
async function testCreditNote(invoiceId) {
  console.log('\n📝 TEST 3: CREATE CREDIT NOTE');
  console.log('='.repeat(60));

  const creditNoteData = {
    invoiceId: invoiceId,
    creditNoteNumber: "CN-2025-001",
    amount: 10000,
    reason: "Defective items - 40 pcs returned",
    issueDate: new Date().toISOString()
  };

  const result = await apiCall('/api/finance/credit-notes', 'POST', creditNoteData);
  console.log('📊 Status:', result.status);
  console.log('📦 Response:', JSON.stringify(result.data, null, 2));

  if (result.ok) {
    console.log('✅ Credit note created successfully!');
    return result.data.data;
  } else {
    console.log('❌ Failed to create credit note');
    console.log('Error:', result.data.error || result.data.details);
    return null;
  }
}

// TEST 4: Create Expense
async function testExpenseManagement() {
  console.log('\n💸 TEST 4: CREATE EXPENSE');
  console.log('='.repeat(60));

  const expenseData = {
    category: "MATERIALS",
    description: "Fabric purchase for production",
    amount: 150000,
    expenseDate: new Date().toISOString(),
    paymentMethod: "BANK_TRANSFER",
    vendor: "Fabric Supplier Inc.",
    status: "APPROVED"
  };

  const result = await apiCall('/api/finance/expenses', 'POST', expenseData);
  console.log('📊 Status:', result.status);
  console.log('📦 Response:', JSON.stringify(result.data, null, 2));

  if (result.ok) {
    console.log('✅ Expense created successfully!');
    return result.data.data;
  } else {
    console.log('❌ Failed to create expense');
    console.log('Error:', result.data.error || result.data.details);
    return null;
  }
}

// TEST 5: Get Financial Reports
async function testFinancialReports() {
  console.log('\n📊 TEST 5: FINANCIAL REPORTS');
  console.log('='.repeat(60));

  // Test invoices list
  console.log('\n📋 Fetching Invoices...');
  const invoices = await apiCall('/api/finance/invoices?limit=5');
  console.log('Invoices Status:', invoices.status, invoices.ok ? '✅' : '❌');

  // Test payments list
  console.log('\n📋 Fetching Payments...');
  const payments = await apiCall('/api/finance/payments?limit=5');
  console.log('Payments Status:', payments.status, payments.ok ? '✅' : '❌');

  // Test expenses list
  console.log('\n📋 Fetching Expenses...');
  const expenses = await apiCall('/api/finance/expenses?limit=5');
  console.log('Expenses Status:', expenses.status, expenses.ok ? '✅' : '❌');

  return {
    invoices: invoices.ok,
    payments: payments.ok,
    expenses: expenses.ok
  };
}

// RUN ALL TESTS
async function runFinanceTests() {
  console.log('\n💰 FINANCE MODULE TEST SUITE');
  console.log('='.repeat(60));
  console.log('Test Start:', new Date().toISOString());

  const results = {
    invoice: false,
    payment: false,
    creditNote: false,
    expense: false,
    reports: { invoices: false, payments: false, expenses: false }
  };

  try {
    // Test Invoice Creation
    const invoice = await testInvoiceCreation();
    results.invoice = !!invoice;

    if (!invoice) {
      console.log('\n⚠️ Skipping remaining tests - invoice creation failed');
      return results;
    }

    // Test Payment Processing
    const payment = await testPaymentProcessing(invoice.id);
    results.payment = !!payment;

    // Test Credit Note
    const creditNote = await testCreditNote(invoice.id);
    results.creditNote = !!creditNote;

    // Test Expense Management
    const expense = await testExpenseManagement();
    results.expense = !!expense;

    // Test Financial Reports
    results.reports = await testFinancialReports();

    return results;
  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
    return results;
  }
}

// Execute tests
runFinanceTests().then(results => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINANCE MODULE TEST RESULTS');
  console.log('='.repeat(60));
  console.log('💰 Invoice Creation:', results.invoice ? '✅ PASSED' : '❌ FAILED');
  console.log('💳 Payment Processing:', results.payment ? '✅ PASSED' : '❌ FAILED');
  console.log('📝 Credit Note:', results.creditNote ? '✅ PASSED' : '❌ FAILED');
  console.log('💸 Expense Management:', results.expense ? '✅ PASSED' : '❌ FAILED');
  console.log('📋 Invoices Report:', results.reports.invoices ? '✅ PASSED' : '❌ FAILED');
  console.log('📋 Payments Report:', results.reports.payments ? '✅ PASSED' : '❌ FAILED');
  console.log('📋 Expenses Report:', results.reports.expenses ? '✅ PASSED' : '❌ FAILED');

  const passCount = [
    results.invoice,
    results.payment,
    results.creditNote,
    results.expense,
    results.reports.invoices,
    results.reports.payments,
    results.reports.expenses
  ].filter(Boolean).length;

  console.log('\n📈 Overall:', `${passCount}/7 tests passed`);
  console.log('='.repeat(60));

  process.exit(passCount === 7 ? 0 : 1);
});
