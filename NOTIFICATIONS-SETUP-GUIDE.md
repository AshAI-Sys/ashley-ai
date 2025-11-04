# SMS & WhatsApp Notifications Setup Guide

Complete guide to setting up real SMS and WhatsApp notifications in Ashley AI.

## Table of Contents
- [Option 1: Semaphore (Philippine SMS)](#option-1-semaphore)
- [Option 2: Twilio (Global SMS + WhatsApp)](#option-2-twilio)
- [Option 3: Meta WhatsApp Business API](#option-3-meta-whatsapp)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Option 1: Semaphore (Philippine SMS)

**Best for**: Philippine businesses sending SMS to local customers

### Step 1: Sign Up for Semaphore

1. Go to [https://semaphore.co](https://semaphore.co)
2. Click "Sign Up" and create an account
3. Verify your email address
4. Add credits to your account (SMS costs vary)

### Step 2: Get API Key

1. Log in to Semaphore dashboard
2. Go to **Account** → **API**
3. Copy your API key

### Step 3: Configure Ashley AI

Add to your `.env` file:

```env
SEMAPHORE_API_KEY="your-api-key-here"
SEMAPHORE_SENDER_NAME="ASHLEY AI"
```

### Step 4: Test

1. Go to http://localhost:3001/notifications
2. Select "SMS"
3. Enter a Philippine mobile number (09XX XXX XXXX)
4. Type a test message
5. Click "Send SMS"

### Pricing

- **Priority SMS**: ₱0.50 per SMS (160 characters)
- **Minimum top-up**: ₱200
- **No monthly fees**

---

## Option 2: Twilio (Global SMS + WhatsApp)

**Best for**: International businesses, WhatsApp messaging

### Step 1: Sign Up for Twilio

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Create a free trial account ($15 credit)
3. Verify your email and phone number

### Step 2: Get Credentials

1. Log in to Twilio Console
2. Go to **Dashboard** → copy:
   - Account SID
   - Auth Token
3. Go to **Phone Numbers** → **Manage** → **Active numbers**
4. Buy a phone number or use trial number

### Step 3: Configure SMS

Add to your `.env` file:

```env
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your-auth-token"
TWILIO_PHONE_NUMBER="+1234567890"
```

### Step 4: Set Up WhatsApp (Optional)

1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Click "Sandbox" and follow setup instructions
3. Send "join [sandbox-word]" to your Twilio WhatsApp number
4. Copy your WhatsApp-enabled number

Add to `.env`:

```env
TWILIO_WHATSAPP_NUMBER="+14155238886"  # Your Twilio WhatsApp number
```

### Step 5: Test

**SMS Test:**
1. Go to http://localhost:3001/notifications
2. Select "SMS"
3. Enter a phone number (must be verified in trial mode)
4. Send test message

**WhatsApp Test:**
1. Go to http://localhost:3001/notifications
2. Select "WhatsApp"
3. Enter a phone number (must have joined sandbox)
4. Send test message

### Pricing

**SMS:**
- US: $0.0079 per message
- Philippines: $0.055 per message

**WhatsApp:**
- First 1,000 conversations/month: Free
- Business-initiated: $0.005-0.08 per conversation
- User-initiated: Free

**Free Trial:**
- $15 credit
- Test before buying

---

## Option 3: Meta WhatsApp Business API

**Best for**: Large-scale WhatsApp messaging, official business verification

### Step 1: Set Up Meta Business Account

1. Go to [https://business.facebook.com](https://business.facebook.com)
2. Create a Business Manager account
3. Go to **Business Settings** → **Accounts** → **WhatsApp Business Accounts**
4. Click "Add" and follow setup wizard

### Step 2: Create WhatsApp Business App

1. Go to [https://developers.facebook.com](https://developers.facebook.com)
2. Create a new app → Select "Business"
3. Add **WhatsApp** product to your app
4. Complete business verification (required for production)

### Step 3: Get Credentials

1. In your app, go to **WhatsApp** → **Getting Started**
2. Copy:
   - Temporary access token (24 hours)
   - Phone number ID
3. For permanent token, go to **Settings** → **System Users**

Add to `.env`:

```env
META_WHATSAPP_TOKEN="EAAxxxxxxxxxxxxxxxxxxxxx"
META_WHATSAPP_PHONE_ID="123456789012345"
```

### Step 4: Test

1. Go to http://localhost:3001/notifications
2. Select "WhatsApp"
3. Enter a test phone number
4. Send message

### Pricing

- First 1,000 conversations/month: **Free**
- Business-initiated conversations: $0.005-0.08 (varies by country)
- User-initiated conversations: **Free**
- No monthly fees
- Verified Business Account required for production

---

## Testing

### Test with Mock Mode (No API Keys)

Ashley AI will run in **mock mode** if no API keys are configured:

```bash
# No .env variables needed
# System will log mock messages to console
```

All notifications will return `sent_mock` status and log to console.

### Test with Real Providers

1. **Add API credentials** to `.env` file
2. **Restart development server**: `pnpm --filter @ash/admin dev`
3. **Check console** for connection logs:

```
[SMS] Sending via Semaphore to: +639123456789
[SMS] Semaphore success: msg_12345
```

### Test Phone Numbers

**Development/Testing:**
- Use your own verified phone number
- Check spam/message folders
- Confirm sender name appears correctly

**Production:**
- Test with at least 3 different numbers
- Test both mobile and landline (if supported)
- Verify message formatting on different devices

---

## Troubleshooting

### Issue: "No SMS API key configured - running in mock mode"

**Solution**:
- Add `SEMAPHORE_API_KEY` or Twilio credentials to `.env`
- Restart server: `pnpm --filter @ash/admin dev`

### Issue: "Invalid Philippine phone number format"

**Solution**:
- Use format: `09XX XXX XXXX` or `+639XX XXX XXXX`
- Remove spaces, dashes, or special characters
- Ensure it starts with `09` or `+639`

### Issue: Twilio - "Permission denied"

**Solution**:
- Trial accounts can only send to verified numbers
- Upgrade to paid account for unrestricted sending
- Verify recipient numbers in Twilio Console

### Issue: WhatsApp - "Recipient not in sandbox"

**Solution**:
- Recipient must send "join [code]" to Twilio WhatsApp number
- For production, use Meta Business API with verified account
- Check sandbox expiry (resets every 72 hours)

### Issue: "Failed to send SMS" / "Failed to send WhatsApp message"

**Solution**:
1. Check console logs for detailed error
2. Verify API credentials are correct
3. Check account balance/credits
4. Ensure phone number format is correct
5. Verify recipient number is not blocked

### Issue: Messages sent but not received

**Solution**:
- Check recipient's spam/junk folder
- Verify phone number is active and has signal
- Check message length (SMS limited to 160 characters)
- For WhatsApp, ensure recipient has WhatsApp installed
- Check provider dashboard for delivery status

---

## Provider Comparison

| Feature | Semaphore | Twilio | Meta WhatsApp |
|---------|-----------|--------|---------------|
| **SMS Support** | ✅ Philippines only | ✅ Global | ❌ No |
| **WhatsApp Support** | ❌ No | ✅ Yes (Sandbox) | ✅ Yes (Official) |
| **Free Trial** | ❌ No | ✅ $15 credit | ✅ 1,000 msg/month |
| **Setup Difficulty** | ⭐ Easy | ⭐⭐ Medium | ⭐⭐⭐ Hard |
| **Best For** | PH SMS | Global SMS/WA | Large-scale WA |
| **Cost (SMS)** | ₱0.50/msg | $0.055/msg (PH) | N/A |
| **Cost (WhatsApp)** | N/A | $0.005-0.08/conv | $0.005-0.08/conv |

---

## Production Deployment

### Environment Variables

Add to your Vercel/Railway environment variables:

```env
# SMS (Choose one or both)
SEMAPHORE_API_KEY=your-key
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890

# WhatsApp (Choose one)
TWILIO_WHATSAPP_NUMBER=+14155238886
META_WHATSAPP_TOKEN=EAAxxxxx
META_WHATSAPP_PHONE_ID=123456789012345
```

### Automatic Fallback

Ashley AI tries providers in this order:

**SMS:**
1. Semaphore (if `SEMAPHORE_API_KEY` exists)
2. Twilio (if Twilio credentials exist)
3. Mock mode (if no credentials)

**WhatsApp:**
1. Twilio WhatsApp (if Twilio + WhatsApp number exist)
2. Meta Business API (if Meta credentials exist)
3. Mock mode (if no credentials)

This ensures your notifications always work, even if one provider fails!

---

## Getting Help

- **Semaphore Support**: support@semaphore.co
- **Twilio Support**: https://support.twilio.com
- **Meta Support**: https://developers.facebook.com/support
- **Ashley AI Issues**: Check console logs for detailed errors

---

## Quick Start Commands

```bash
# Start development server
pnpm --filter @ash/admin dev

# Test notifications page
open http://localhost:3001/notifications

# View API logs
# Check terminal for [SMS] and [WhatsApp] logs

# Deploy to production
vercel --prod
```

---

**Last Updated**: November 4, 2025
**Version**: 1.0.0
