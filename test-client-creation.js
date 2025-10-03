// Test Client Creation - Verify 403 Fix
const testClientCreation = async () => {
  const testClient = {
    name: "Test Manufacturing Co.",
    contact_person: "John Doe",
    email: "john@testmfg.com",
    phone: "09171234567",
    address: {
      street: "123 Test Street",
      city: "Manila",
      state: "NCR",
      postal_code: "1000",
      country: "Philippines"
    },
    tax_id: "123-456-789",
    payment_terms: 30,
    credit_limit: 500000
  };

  try {
    console.log('🧪 Testing Client Creation...\n');
    console.log('📋 Test Data:', JSON.stringify(testClient, null, 2));

    const response = await fetch('http://localhost:3001/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testClient)
    });

    const data = await response.json();

    console.log('\n📊 Response Status:', response.status);
    console.log('📦 Response Data:', JSON.stringify(data, null, 2));

    if (response.status === 200 || response.status === 201) {
      console.log('\n✅ SUCCESS: Client created successfully!');
      console.log('🎉 403 Error is FIXED!');
      return { success: true, data };
    } else if (response.status === 403) {
      console.log('\n❌ FAILED: Still getting 403 Forbidden');
      console.log('🔧 CSRF token issue not resolved');
      return { success: false, error: '403 Forbidden' };
    } else {
      console.log('\n⚠️  WARNING: Unexpected status code');
      return { success: false, error: data.error || 'Unknown error' };
    }
  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
    return { success: false, error: error.message };
  }
};

// Run the test
testClientCreation().then(result => {
  console.log('\n' + '='.repeat(50));
  console.log('TEST RESULT:', result.success ? '✅ PASSED' : '❌ FAILED');
  console.log('='.repeat(50));
  process.exit(result.success ? 0 : 1);
});
