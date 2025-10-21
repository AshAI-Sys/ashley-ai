// Test registration endpoint directly
const testData = {
  workspaceName: "Test Company",
  workspaceSlug: "test-company",
  firstName: "John",
  lastName: "Doe",
  email: "john@test.com",
  password: "Test1234!",
  confirmPassword: "Test1234!",
};

fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testData),
})
  .then(res => res.json())
  .then(data => {
    console.log('Response:', JSON.stringify(data, null, 2));
  })
  .catch(err => {
    console.error('Error:', err.message);
  });
