# Gmail SMTP Setup Guide

## 📧 How to Setup Gmail for Sending Verification Emails

Ashley AI now uses **Gmail SMTP** to send email verification emails directly from your Gmail account.

---

## 🔐 Step 1: Get Gmail App Password

Google requires you to use an **App Password** instead of your regular Gmail password for security reasons.

### Follow these steps:

1. **Enable 2-Factor Authentication** (required for App Passwords)
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup process

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Or search "App Passwords" in Google Account settings
   - Select app: **Mail**
   - Select device: **Other (Custom name)** → Type: "Ashley AI"
   - Click **Generate**
   - **COPY THE 16-CHARACTER PASSWORD** (it looks like: `abcd efgh ijkl mnop`)

---

## ⚙️ Step 2: Configure Environment Variables

Add these two lines to your `.env` file:

**File:** `C:\Users\Khell\Desktop\Ashley AI\services\ash-admin\.env`

```bash
# Gmail SMTP Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

### Example:
```bash
# Gmail SMTP Configuration
GMAIL_USER=kelvinmorfe17@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

**⚠️ Important:**
- Replace `your-email@gmail.com` with your actual Gmail address
- Replace the password with the 16-character App Password you generated
- **DO NOT use your regular Gmail password** - it won't work!
- You can include or remove spaces in the App Password (both work)

---

## 🚀 Step 3: Restart Development Server

After adding the environment variables, restart the server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
pnpm --filter @ash/admin dev
```

---

## ✅ Step 4: Test Email Verification

Now try registering a new account:

1. Go to: http://localhost:3001/register
2. Fill in the registration form with your details
3. Click "Create Admin Account"
4. **Check your Gmail inbox** for the verification email!

**The email will have:**
- Subject: "Welcome to Ashley AI - Verify Your Email ✅"
- From: "Ashley AI <your-email@gmail.com>"
- A big blue button to verify your email
- The verification link will be valid for 24 hours

---

## 📋 Environment Variables Summary

```bash
# Required for Gmail SMTP email sending
GMAIL_USER=your-email@gmail.com              # Your Gmail address
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx       # 16-char App Password from Google

# Already configured
DATABASE_URL=file:../../../packages/database/prisma/dev.db
JWT_SECRET=your-jwt-secret-key
ENCRYPTION_KEY=your-encryption-key-32-chars
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## 🐛 Troubleshooting

### "Gmail credentials not configured" warning

**Problem:** You see this in the console:
```
⚠️ Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD in .env
```

**Solution:**
1. Check that you added both `GMAIL_USER` and `GMAIL_APP_PASSWORD` to `.env`
2. Make sure there are no typos in the variable names
3. Restart the dev server after adding them

---

### "Invalid login" or "Authentication failed" error

**Problem:** Email sending fails with authentication error

**Solutions:**
1. **Use App Password, not your regular password**
   - Regular Gmail passwords don't work for SMTP
   - You must use the 16-character App Password

2. **Enable 2-Factor Authentication**
   - App Passwords require 2FA to be enabled
   - Go to: https://myaccount.google.com/security

3. **Check the App Password is correct**
   - Generate a new one if needed
   - Copy-paste it carefully (spaces don't matter)

---

### Email is in Spam folder

**Problem:** Verification email goes to spam

**Solution:**
- This is normal for new sending addresses
- Check your spam/junk folder
- Mark it as "Not Spam"
- Future emails should arrive in inbox

---

### "Connection timeout" error

**Problem:** Email sending times out

**Solutions:**
1. Check your internet connection
2. Gmail SMTP might be blocked by firewall
3. Try using a different network (mobile hotspot)
4. Check if Gmail is down: https://www.google.com/appsstatus

---

## 🔒 Security Best Practices

1. **Never commit `.env` to Git**
   - It's already in `.gitignore`
   - Never share your App Password

2. **Revoke unused App Passwords**
   - Go to: https://myaccount.google.com/apppasswords
   - Delete old/unused passwords

3. **Use a dedicated email for production**
   - For production, create a separate Gmail account
   - Example: `noreply@yourcompany.com` or use a professional email service

---

## 📊 How It Works

```
User registers
    ↓
Ashley AI creates account in database
    ↓
Ashley AI generates verification token
    ↓
Ashley AI connects to Gmail SMTP
    ↓
Gmail sends email to user
    ↓
User receives email in Gmail inbox
    ↓
User clicks verification link
    ↓
Email verified! ✅
```

---

## 🎯 Production Considerations

For production deployment, consider:

1. **Use a professional email service:**
   - SendGrid (free tier: 100 emails/day)
   - Mailgun (free tier: 5,000 emails/month)
   - Amazon SES (very cheap, reliable)
   - Resend (already integrated as fallback)

2. **Gmail limitations:**
   - 500 emails per day limit
   - May end up in spam for some users
   - Not ideal for high-volume sending

3. **Current setup works great for:**
   - Development and testing
   - Small-scale production (< 100 users/day)
   - Internal company systems

---

## ✅ Quick Checklist

- [ ] 2-Factor Authentication enabled on Gmail
- [ ] App Password generated
- [ ] `GMAIL_USER` added to `.env`
- [ ] `GMAIL_APP_PASSWORD` added to `.env`
- [ ] Dev server restarted
- [ ] Test registration completed
- [ ] Verification email received in inbox (or spam)
- [ ] Email verification successful

---

## 📞 Need Help?

If you're still having issues:

1. Check the server console logs for detailed error messages
2. Verify your Gmail account settings
3. Try generating a new App Password
4. Make sure 2FA is enabled on your Gmail account

**Verification link will also be logged to console** if email sending fails, so you can still test the verification flow!

---

**Ashley AI - Manufacturing ERP System**
*Powered by Gmail SMTP for reliable email delivery*
