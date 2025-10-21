# How to Update GitHub Personal Access Token (PAT) Scope

## Problem
Your current PAT doesn't have the `workflow` scope needed to push `.github/workflows/ci.yml`

## Solution - Update PAT Scope

### Step 1: Go to GitHub Settings
1. Open browser: https://github.com/settings/tokens
2. Or navigate manually:
   - GitHub.com → Click your profile picture (top right)
   - **Settings** → **Developer settings** (bottom left)
   - **Personal access tokens** → **Tokens (classic)**

### Step 2: Find Your Current Token
- Look for the token you're currently using
- It might be named something like:
  - "Git Credentials"
  - "GitHub CLI"
  - "Desktop"
  - Or whatever name you gave it

### Step 3: Edit Token Scopes
1. Click on the token name
2. Scroll down to **Select scopes**
3. Find and **CHECK** the box for: `workflow`
   - It should say: "Update GitHub Action workflows"
4. Scroll to bottom and click **Update token**

### Step 4: Copy the New Token (if shown)
- GitHub might show you the token again
- **IMPORTANT**: Copy it if shown - you won't see it again!
- Save it somewhere safe

### Step 5: Update Git Credentials (Windows)

**Option A - If you're using Windows Credential Manager:**
```powershell
# Open Credential Manager
control /name Microsoft.CredentialManager

# Find "git:https://github.com"
# Click it → Edit → Update password with new token
```

**Option B - Update via command line:**
```bash
# Git will prompt you for new credentials on next push
git config --global credential.helper manager
```

### Step 6: Push Again
```bash
cd "C:\Users\Khell\Desktop\Ashley AI"
git push -u origin fix/auto-errors
```

## Alternative - Create New Token with All Scopes

If you can't edit the existing token, create a new one:

### Required Scopes for Full Access:
- ✅ `repo` (Full control of private repositories)
- ✅ `workflow` (Update GitHub Action workflows)
- ✅ `write:packages` (Upload packages to GitHub Package Registry)
- ✅ `delete:packages` (Delete packages from GitHub Package Registry)
- ✅ `admin:org` (if working with organization repos)
- ✅ `admin:repo_hook` (Full control of repository hooks)

### Create New Token:
1. Go to: https://github.com/settings/tokens/new
2. **Note**: "Ashley AI - Full Access"
3. **Expiration**: 90 days (or No expiration if you prefer)
4. **Select scopes**: Check all boxes mentioned above
5. Click **Generate token**
6. **COPY THE TOKEN** - You won't see it again!
7. Update your git credentials with this new token

## Verification

After updating, test with:
```bash
git push -u origin fix/auto-errors
```

You should see:
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
...
To https://github.com/AshAI-Sys/ashley-ai.git
 * [new branch]      fix/auto-errors -> fix/auto-errors
```

## Still Having Issues?

If you still get errors:
1. Check your PAT has `workflow` scope
2. Make sure credentials are updated in Windows Credential Manager
3. Try removing and re-adding credentials:
   ```bash
   git credential reject https://github.com
   git push -u origin fix/auto-errors
   # Enter new token when prompted
   ```

---

**After successful push, delete this file:**
```bash
rm UPDATE-PAT-INSTRUCTIONS.md
```
