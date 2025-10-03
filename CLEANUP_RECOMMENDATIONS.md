# Ashley AI - Cleanup Recommendations

## Files to Clean Up

### 1. Duplicate Environment Files (Choose 1 only)
```
- .env (development - KEEP this)
- .env.development (duplicate)
- .env.example (keep for reference)
- .env.production (template only)
- .env.production.example (duplicate)
- .env.production.template (duplicate)
```
**Recommendation:** Delete .env.development, .env.production.template

---

### 2. Duplicate Deployment Documentation
```
- DEPLOY_VIA_DASHBOARD.md
- DEPLOYMENT_INSTRUCTIONS.md
- DEPLOYMENT_SUMMARY.md
- FINAL_DEPLOYMENT_STEPS.md
- FIX_DEPLOYMENT_ERROR.md
- DISABLE_VERCEL_PROTECTION.md
```
**Recommendation:** DELETE ALL (outdated from failed deployments)

---

### 3. Old Scripts
```
- cleanup-duplicates.ps1 (old cleanup script)
- deploy-now.ps1 (deployment script)
- kill-and-restart.ps1 (old script)
- vercel-env-setup.bat (vercel related)
- test-integrations.js (old test)
- test-phase2.js (old test)
```
**Recommendation:** DELETE ALL (replaced by new CLEANUP.bat)

---

### 4. Docker Files (if not using Docker)
```
- docker-compose.yml
- docker-compose.production.yml
- docker-compose.monitoring.yml
- Dockerfile
- ecosystem.config.js (PM2 config)
```
**Recommendation:** DELETE if not deploying with Docker

---

### 5. Unnecessary Lock File
```
- package-lock.json (npm lockfile, pero pnpm ang gamit mo)
```
**Recommendation:** DELETE (you use pnpm-lock.yaml)

---

### 6. TypeScript Declaration Files (95 files!)
```
Many .d.ts files in packages/*
```
**Recommendation:** These are auto-generated. Can delete and regenerate.

---

### 7. JavaScript Files in TypeScript Project
```
packages/ai/src/*.js (should be .ts)
packages/auth/src/*.js (should be .ts)
```
**Recommendation:** Convert to .ts or delete if duplicates

---

### 8. Stray File
```
- nul (empty file, 83 bytes)
```
**Recommendation:** DELETE

---

## Automated Cleanup Script

I can create a script to clean all these automatically. Want me to?

Or do you want to:
1. Clean everything automatically
2. Clean selectively (choose what to keep)
3. Review each category first
