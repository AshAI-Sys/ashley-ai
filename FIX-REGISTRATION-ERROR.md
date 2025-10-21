# Fix Registration Error - "Failed to create account"

## Problem
You're seeing "Failed to create account" error when trying to register with:
- Workspace: Reefer
- Email: Kelvinmorfe17@gmail.com

## Most Likely Causes & Solutions

### Option 1: Use Different Credentials (EASIEST) ✅
Simply try registering with:
- **Different workspace name** (not "Reefer")
- **Different email** (not kelvinmorfe17@gmail.com)

Example:
```
Workspace: Reefer-New
Email: kelvin.test@gmail.com
Password: KelvinTest123 (must have: 8+ chars, uppercase, lowercase, number)
```

### Option 2: Check Password Requirements
Make sure your password has:
- ✅ At least 8 characters
- ✅ At least ONE uppercase letter (A-Z)
- ✅ At least ONE lowercase letter (a-z)
- ✅ At least ONE number (0-9)

**Good examples:**
- `Password123`
- `Kelvin2025`
- `MyPass123`
- `Test1234`

**Bad examples:**
- `password` (no uppercase, no number)
- `PASSWORD123` (no lowercase)
- `Password` (no number)
- `Pass123` (less than 8 chars)

### Option 3: Clear Existing Data (ADVANCED)

If the workspace "reefer" or email already exists, delete them:

#### Method A: Using Database Browser
1. Download [DB Browser for SQLite](https://sqlitebrowser.org/)
2. Open file: `C:\Users\Khell\Desktop\Ashley AI\packages\database\prisma\dev.db`
3. Go to "Browse Data" tab
4. Select "User" table → Find and delete row with email "kelvinmorfe17@gmail.com"
5. Select "Workspace" table → Find and delete row with slug "reefer"
6. Save changes (Write Changes button)

#### Method B: Command Line (Requires SQLite)
```bash
cd "C:\Users\Khell\Desktop\Ashley AI\packages\database\prisma"
sqlite3 dev.db < ../../clear-test-user.sql
```

### Option 4: Check Dev Server Logs

1. Open the terminal where `pnpm --filter @ash/admin dev` is running
2. Look for error messages after clicking "Create Admin Account"
3. Common errors:
   - `Workspace slug already taken` → Use different workspace name
   - `Email already exists` → Use different email
   - `Password does not meet security requirements` → Fix password

### Option 5: Use Existing Login

If you already created this account successfully before, don't register again - just **LOGIN**:

1. Go to http://localhost:3001/login
2. Enter:
   - Email: kelvinmorfe17@gmail.com
   - Password: (your existing password)
3. Click "Sign In"

## Quick Test Registration

Try these credentials (should work if no conflicts):

```
Workspace Name: TestCompany2025
Workspace Slug: testcompany2025
First Name: Test
Last Name: User
Email: test.user.2025@example.com
Password: TestPass123
Confirm Password: TestPass123
```

## Still Not Working?

If none of the above work, there might be a server issue:

1. **Restart Dev Server:**
   ```bash
   # In the terminal, press Ctrl+C to stop
   # Then restart:
   cd "C:\Users\Khell\Desktop\Ashley AI"
   pnpm --filter @ash/admin dev
   ```

2. **Check Database:**
   ```bash
   cd "C:\Users\Khell\Desktop\Ashley AI\packages\database"
   npx prisma studio
   ```
   This opens a visual database browser at http://localhost:5555

3. **Regenerate Database:**
   ```bash
   cd "C:\Users\Khell\Desktop\Ashley AI\packages\database"
   npx prisma generate
   npx prisma db push
   ```

## Need More Help?

Check the dev server terminal for detailed error messages. The error will show exactly what went wrong:
- "Workspace slug already taken" → Solution: Use different workspace name
- "Email already exists" → Solution: Use different email or login instead
- "Password does not meet security requirements" → Solution: Use stronger password
- "Failed to send email" → This is OK, you can still login (email is optional)

---

**Quick Fix Summary:**
1. Use a **different workspace name** (e.g., "Reefer2", "Reefer-Test", "MyCompany")
2. Use a **different email** (e.g., "kelvinmorfe17+test@gmail.com", "test@example.com")
3. Make sure password has **8+ chars, uppercase, lowercase, number**
