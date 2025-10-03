// Test Order Creation
const testOrderCreation = async () => {
  const testOrder = {
    clientId: "cmgal7ds70005nra2lajao1hu", // Correct camelCase
    orderNumber: "ORD-TEST-001",
    orderDate: new Date().toISOString(),
    deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    productType: "T-Shirt",
    quantity: 1000,
    unitPrice: 250,
    totalAmount: 250000,
    status: "DRAFT", // Valid enum value
    notes: "Test order for quality assurance"
  };

  try {
    console.log('🧪 Testing Order Creation...\n');
    console.log('📋 Test Data:', JSON.stringify(testOrder, null, 2));

    const response = await fetch('http://localhost:3001/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder)
    });

    const data = await response.json();

    console.log('\n📊 Response Status:', response.status);
    console.log('📦 Response Data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS: Order created successfully!');
      return { success: true, data };
    } else {
      console.log('\n❌ FAILED: Could not create order');
      return { success: false, error: data.error || 'Unknown error' };
    }
  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
    return { success: false, error: error.message };
  }
};

// Run the test
testOrderCreation().then(result => {
  console.log('\n' + '='.repeat(50));
  console.log('TEST RESULT:', result.success ? '✅ PASSED' : '❌ FAILED');
  console.log('='.repeat(50));
  process.exit(result.success ? 0 : 1);
});
