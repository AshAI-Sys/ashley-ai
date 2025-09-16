# 🛡️ Ashley AI Backup Guide

## Quick Backup Options

### **Option 1: One-Click Backup (Recommended)**

**Run the automated backup script:**
```bash
cd "C:\Users\Khell\Desktop\Ashley AI"
backup-ashley-ai.bat
```

This will create a ZIP file: `Ashley AI - Backup YYYY-MM-DD-HHMM.zip` on your Desktop.

**What it includes:**
- ✅ All source code (.ts, .tsx, .js, .css files)
- ✅ Configuration files (package.json, next.config.js, etc.)
- ✅ Database schema (prisma/schema.prisma)
- ✅ Documentation (.md files)
- ❌ node_modules (excluded - can be restored with `pnpm install`)
- ❌ Build artifacts (.next, dist, build folders)

---

### **Option 2: PowerShell Script (Enhanced)**

**Run the PowerShell script:**
```powershell
cd "C:\Users\Khell\Desktop\Ashley AI"
./quick-backup.ps1
```

Features colored output and shows backup size!

---

### **Option 3: Manual Backup Steps**

1. **Create backup folder:**
   ```
   C:\Users\Khell\Desktop\Ashley AI - Manual Backup YYYY-MM-DD
   ```

2. **Copy these essential folders/files:**
   - ✅ `services/` (admin and portal code)
   - ✅ `packages/` (database schema)
   - ✅ `*.md` files (documentation)
   - ✅ `package.json`, `pnpm-workspace.yaml`
   - ✅ Configuration files

3. **Skip these folders:**
   - ❌ `node_modules/` (too large, can be restored)
   - ❌ `.next/`, `dist/`, `build/` (build artifacts)

---

## Recovery Instructions

### **Restore from ZIP backup:**
1. Extract the ZIP file
2. Navigate to extracted folder
3. Run: `pnpm install` (installs dependencies)
4. Run: `cd packages/database && npx prisma generate`
5. Start servers: `pnpm --filter admin dev`

---

## Backup Schedule Recommendations

- **Daily:** Run `backup-ashley-ai.bat` at end of work
- **Weekly:** Push to Git repository
- **Monthly:** Create cloud storage backup
- **Before major changes:** Always backup first!

---

## File Size Estimates

- **Full project with node_modules:** ~500MB - 2GB
- **Source code only (recommended):** ~10-50MB
- **ZIP compressed:** ~5-20MB

---

## Emergency Recovery

If your main project gets corrupted:

1. **Stop all running servers** (Ctrl+C)
2. **Restore from most recent backup**
3. **Run restoration commands** (see above)
4. **Verify everything works**
5. **Resume development**

## Quick Commands

**To run backup NOW:**
```cmd
cd "C:\Users\Khell\Desktop\Ashley AI"
backup-ashley-ai.bat
```

**To restore from backup:**
```cmd
# After extracting backup
pnpm install
cd packages/database
npx prisma generate
cd ../..
pnpm --filter admin dev
```