// Test registration API endpoint
const fetch = require('node-fetch')

async function testRegister() {
  const payload = {
    workspaceName: 'Reefer Test',
    workspaceSlug: 'reefer-test',
    firstName: 'Kelvin',
    lastName: 'Morfe',
    email: 'kelvinmorfe17@gmail.com',
    password: 'TestPassword123',
    confirmPassword: 'TestPassword123',
    companyAddress: '',
    companyPhone: ''
  }

  console.log('Sending registration request...')
  console.log('Payload:', JSON.stringify(payload, null, 2))

  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    console.log('\nResponse status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

    const data = await response.json()
    console.log('\nResponse data:', JSON.stringify(data, null, 2))

  } catch (error) {
    console.error('Error:', error.message)
  }
}

testRegister()
