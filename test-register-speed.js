// Test registration API endpoint speed
const testRegistrationSpeed = async () => {
  const testData = {
    workspaceName: 'Speed Test Company',
    workspaceSlug: `speed-test-${Date.now()}`,
    email: `speedtest${Date.now()}@test.com`,
    password: 'TestPass123!',
    confirmPassword: 'TestPass123!',
    firstName: 'Speed',
    lastName: 'Test',
  };

  console.log('🚀 Testing registration API speed...\n');
  console.log('📝 Test data:', {
    workspace: testData.workspaceName,
    email: testData.email,
  });

  const startTime = Date.now();

  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    const data = await response.json();

    console.log('\n✅ Registration API Response:');
    console.log('⏱️  Response Time:', duration + 'ms');
    console.log('📊 Status Code:', response.status);
    console.log('🎯 Success:', data.success);

    if (data.success) {
      console.log('✅ Account Created:', data.user.email);
      console.log('🏢 Workspace:', data.workspace.name);
      console.log('🔗 Verification URL:', data.verificationUrl || 'Not provided');
    } else {
      console.log('❌ Error:', data.error);
    }

    // Performance evaluation
    console.log('\n📈 Performance Evaluation:');
    if (duration < 500) {
      console.log('🏆 EXCELLENT - Blazing fast!');
    } else if (duration < 1000) {
      console.log('✅ GOOD - Fast enough');
    } else if (duration < 2000) {
      console.log('⚠️  ACCEPTABLE - Slightly slow');
    } else {
      console.log('❌ SLOW - Needs optimization');
    }

    return { duration, success: data.success };
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    console.error('\n❌ Registration failed:', error.message);
    console.log('⏱️  Failed after:', duration + 'ms');
    return { duration, success: false, error: error.message };
  }
};

// Run test
testRegistrationSpeed()
  .then(result => {
    console.log('\n✅ Test completed!');
    process.exit(result.success ? 0 : 1);
  })
  .catch(err => {
    console.error('Test error:', err);
    process.exit(1);
  });
