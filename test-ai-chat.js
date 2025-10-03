// Test AI Chat Assistant
const testAIChat = async () => {
  const testMessage = {
    message: "Hello! Can you help me understand how to create a new production order?",
    workspace_id: "demo-workspace-1", // Required
    conversationId: null // New conversation
  };

  try {
    console.log('🧪 Testing AI Chat Assistant...\n');
    console.log('💬 Test Message:', testMessage.message);

    const response = await fetch('http://localhost:3001/api/ai-chat/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testMessage)
    });

    const data = await response.json();

    console.log('\n📊 Response Status:', response.status);
    console.log('📦 Response Data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ SUCCESS: AI Chat is working!');
      console.log('🤖 AI Response:', data.response || data.message || 'No response text');
      return { success: true, data };
    } else {
      console.log('\n❌ FAILED: AI Chat error');
      return { success: false, error: data.error || 'Unknown error' };
    }
  } catch (error) {
    console.error('\n💥 ERROR:', error.message);
    return { success: false, error: error.message };
  }
};

// Run the test
testAIChat().then(result => {
  console.log('\n' + '='.repeat(50));
  console.log('TEST RESULT:', result.success ? '✅ PASSED' : '❌ FAILED');
  console.log('='.repeat(50));
  process.exit(result.success ? 0 : 1);
});
