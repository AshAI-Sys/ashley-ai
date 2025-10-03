#!/usr/bin/env node
/**
 * Test OpenAI API Key
 * Run: node test-openai-key.js
 */

const fs = require('fs')
const path = require('path')

// Read .env file manually
const envPath = path.join(__dirname, '.env')
const envContent = fs.readFileSync(envPath, 'utf-8')
const envLines = envContent.split('\n')

const env = {}
envLines.forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/)
  if (match) {
    env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '')
  }
})

async function testOpenAI() {
  const apiKey = env.ASH_OPENAI_API_KEY

  if (!apiKey) {
    console.error('❌ ASH_OPENAI_API_KEY not found in .env file')
    process.exit(1)
  }

  console.log('🔑 Testing OpenAI API Key...')
  console.log(`📋 Key: ${apiKey.substring(0, 20)}...${apiKey.substring(apiKey.length - 4)}`)

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: 'Say "Hello from Ashley AI!" in 5 words or less.' }
        ],
        max_tokens: 20,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      console.log('\n✅ SUCCESS! API key is valid')
      console.log('\n🤖 AI Response:')
      console.log(`   "${data.choices[0].message.content}"`)
      console.log('\n📊 Usage:')
      console.log(`   - Prompt tokens: ${data.usage.prompt_tokens}`)
      console.log(`   - Completion tokens: ${data.usage.completion_tokens}`)
      console.log(`   - Total tokens: ${data.usage.total_tokens}`)
      console.log(`   - Estimated cost: $${((data.usage.total_tokens / 1000000) * 0.50).toFixed(6)}`)
      console.log('\n🎉 Your OpenAI integration is working perfectly!')
    } else {
      console.error('\n❌ ERROR: API key is invalid or has issues')
      console.error(`   Status: ${response.status} ${response.statusText}`)
      console.error(`   Message: ${data.error?.message || 'Unknown error'}`)

      if (response.status === 401) {
        console.error('\n💡 Troubleshooting:')
        console.error('   1. Check your API key at: https://platform.openai.com/api-keys')
        console.error('   2. Make sure the key starts with "sk-proj-" or "sk-"')
        console.error('   3. Generate a new key if this one was deleted')
      } else if (response.status === 429) {
        console.error('\n💡 Rate limit or quota exceeded')
        console.error('   1. Check usage: https://platform.openai.com/usage')
        console.error('   2. Add payment method: https://platform.openai.com/settings/organization/billing')
      }
    }
  } catch (error) {
    console.error('\n❌ Network error:', error.message)
    console.error('\n💡 Make sure you have internet connection')
  }
}

testOpenAI()
