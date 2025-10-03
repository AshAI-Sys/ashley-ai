// Test Production Workflow - Complete Pipeline
const ORDER_ID = "cmgal89mc0007nra2wfuzhto3"; // From previous test

// Helper function for API calls
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

// TEST 1: Create Fabric Batch (Pre-cutting)
async function testFabricBatch() {
  console.log('\n🧪 TEST 1: CREATE FABRIC BATCH');
  console.log('='.repeat(60));

  const fabricData = {
    orderId: ORDER_ID,
    fabricType: "Cotton Jersey",
    color: "Navy Blue",
    rollNumber: "ROLL-001",
    quantity: 100,
    unit: "METERS",
    supplierId: null,
    notes: "Quality cotton for T-shirt production"
  };

  const result = await apiCall('/api/cutting/fabric-batches', 'POST', fabricData);
  console.log('📊 Status:', result.status);
  console.log('📦 Response:', JSON.stringify(result.data, null, 2));

  if (result.ok) {
    console.log('✅ Fabric batch created successfully!');
    return result.data.data;
  } else {
    console.log('❌ Failed to create fabric batch');
    return null;
  }
}

// TEST 2: Create Lay (Cutting layout)
async function testLayCreation(fabricBatchId) {
  console.log('\n🧪 TEST 2: CREATE LAY (CUTTING LAYOUT)');
  console.log('='.repeat(60));

  const layData = {
    orderId: ORDER_ID,
    fabricBatchId: fabricBatchId,
    layNumber: "LAY-001",
    fabricLength: 50,
    fabricWidth: 1.5,
    numberOfPlies: 10,
    piecesPerPly: 12,
    totalPieces: 120,
    efficiency: 85.5,
    notes: "Optimized cutting layout"
  };

  const result = await apiCall('/api/cutting/lays', 'POST', layData);
  console.log('📊 Status:', result.status);
  console.log('📦 Response:', JSON.stringify(result.data, null, 2));

  if (result.ok) {
    console.log('✅ Lay created successfully!');
    return result.data.data;
  } else {
    console.log('❌ Failed to create lay');
    return null;
  }
}

// TEST 3: Create Bundle (Cut pieces)
async function testBundleCreation(layId) {
  console.log('\n🧪 TEST 3: CREATE BUNDLE (CUT PIECES)');
  console.log('='.repeat(60));

  const bundleData = {
    layId: layId,
    orderId: ORDER_ID,
    bundleNumber: "BDL-001",
    size: "MEDIUM",
    quantity: 50,
    qrCode: "QR-BDL-001-" + Date.now(),
    status: "CUT",
    notes: "First production bundle"
  };

  const result = await apiCall('/api/cutting/bundles', 'POST', bundleData);
  console.log('📊 Status:', result.status);
  console.log('📦 Response:', JSON.stringify(result.data, null, 2));

  if (result.ok) {
    console.log('✅ Bundle created successfully!');
    return result.data.data;
  } else {
    console.log('❌ Failed to create bundle');
    return null;
  }
}

// TEST 4: Create Print Run
async function testPrintRun(bundleId) {
  console.log('\n🧪 TEST 4: CREATE PRINT RUN');
  console.log('='.repeat(60));

  const printData = {
    orderId: ORDER_ID,
    method: "SCREEN_PRINT",
    design: "Company Logo - Front",
    quantity: 50,
    colorCount: 3,
    startedAt: new Date().toISOString(),
    status: "IN_PROGRESS",
    operator: "Juan Dela Cruz",
    notes: "3-color screen print"
  };

  const result = await apiCall('/api/printing/runs', 'POST', printData);
  console.log('📊 Status:', result.status);
  console.log('📦 Response:', JSON.stringify(result.data, null, 2));

  if (result.ok) {
    console.log('✅ Print run created successfully!');
    return result.data.data;
  } else {
    console.log('❌ Failed to create print run');
    return null;
  }
}

// TEST 5: Create Sewing Run
async function testSewingRun(bundleId) {
  console.log('\n🧪 TEST 5: CREATE SEWING RUN');
  console.log('='.repeat(60));

  const sewingData = {
    orderId: ORDER_ID,
    lineNumber: "LINE-A",
    operationType: "ASSEMBLY",
    targetQuantity: 50,
    actualQuantity: 45,
    startedAt: new Date().toISOString(),
    status: "IN_PROGRESS",
    operatorId: null,
    notes: "Main assembly line"
  };

  const result = await apiCall('/api/sewing/runs', 'POST', sewingData);
  console.log('📊 Status:', result.status);
  console.log('📦 Response:', JSON.stringify(result.data, null, 2));

  if (result.ok) {
    console.log('✅ Sewing run created successfully!');
    return result.data.data;
  } else {
    console.log('❌ Failed to create sewing run');
    return null;
  }
}

// RUN ALL TESTS
async function runProductionWorkflowTests() {
  console.log('\n🏭 PRODUCTION WORKFLOW TEST SUITE');
  console.log('='.repeat(60));
  console.log('Order ID:', ORDER_ID);
  console.log('Test Start:', new Date().toISOString());

  const results = {
    fabricBatch: false,
    lay: false,
    bundle: false,
    printRun: false,
    sewingRun: false
  };

  try {
    // Test Fabric Batch
    const fabricBatch = await testFabricBatch();
    results.fabricBatch = !!fabricBatch;

    if (!fabricBatch) {
      console.log('\n❌ Fabric batch failed - stopping tests');
      return results;
    }

    // Test Lay Creation
    const lay = await testLayCreation(fabricBatch.id);
    results.lay = !!lay;

    if (!lay) {
      console.log('\n❌ Lay creation failed - stopping tests');
      return results;
    }

    // Test Bundle Creation
    const bundle = await testBundleCreation(lay.id);
    results.bundle = !!bundle;

    // Test Print Run (independent)
    const printRun = await testPrintRun(bundle?.id || null);
    results.printRun = !!printRun;

    // Test Sewing Run (independent)
    const sewingRun = await testSewingRun(bundle?.id || null);
    results.sewingRun = !!sewingRun;

    return results;
  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
    return results;
  }
}

// Execute tests
runProductionWorkflowTests().then(results => {
  console.log('\n' + '='.repeat(60));
  console.log('📊 PRODUCTION WORKFLOW TEST RESULTS');
  console.log('='.repeat(60));
  console.log('✂️  Fabric Batch:', results.fabricBatch ? '✅ PASSED' : '❌ FAILED');
  console.log('📐 Lay Creation:', results.lay ? '✅ PASSED' : '❌ FAILED');
  console.log('📦 Bundle Creation:', results.bundle ? '✅ PASSED' : '❌ FAILED');
  console.log('🖨️  Print Run:', results.printRun ? '✅ PASSED' : '❌ FAILED');
  console.log('🪡 Sewing Run:', results.sewingRun ? '✅ PASSED' : '❌ FAILED');

  const passCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  console.log('\n📈 Overall:', `${passCount}/${totalTests} tests passed`);
  console.log('='.repeat(60));

  process.exit(passCount === totalTests ? 0 : 1);
});
