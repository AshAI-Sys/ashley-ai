# Seed Production Database on Render

Your production database is empty - that's why you can't login! Follow these steps to populate it with demo data.

## Option A: Run Seed via Render Shell (Recommended)

1. **Go to Render Dashboard**
   - Open: https://dashboard.render.com/web/ashley-aiy

2. **Open Shell**
   - Click on "Shell" tab in the left sidebar
   - This opens a terminal into your production server

3. **Run Migration and Seed**

   ```bash
   # Navigate to database package
   cd packages/database

   # Run migrations (if not already run)
   npx prisma migrate deploy

   # Seed the database
   npm run db:seed
   ```

4. **Verify Success**
   You should see:

   ```
   🌱 Starting database seed...
   ✅ Workspace created: demo-workspace
   ✅ User created: admin@ashleyai.com
   ✅ Clients created: 3
   ✅ Brands created: 3
   ✅ Orders created: 3
   🎉 Database seeded successfully!
   ```

5. **Test Login**
   - Go to: https://ashley-aiy.onrender.com/login
   - Email: `admin@ashleyai.com`
   - Password: `password123`
   - Click "Sign In as Admin"

## Option B: Run via Environment Variable

Add this to your Render environment variables:

1. Go to Render Dashboard → Environment
2. Add new variable:
   - **Key**: `SEED_DB`
   - **Value**: `true`
3. Save and redeploy

Then add a build hook to run seed automatically.

## What Gets Created

The seed script creates:

### Demo User (Admin)

- Email: `admin@ashleyai.com`
- Password: `password123`
- Role: Admin
- Full access to all features

### Demo Workspace

- Name: Demo Workspace
- Slug: demo-workspace

### 3 Demo Clients

1. Manila Shirts Co. (Metro Manila)
2. Cebu Sports Apparel (Cebu)
3. Davao Uniform Solutions (Davao)

### 3 Demo Brands

- Manila Classic (MNLC)
- Manila Pro (MNLP)
- Cebu Athletes (CBAT)

### 3 Demo Orders

- ORD-2024-001 (In Production)
- ORD-2024-002 (Pending Approval)
- ORD-2024-003 (Completed)

## Troubleshooting

### If seed fails with "User already exists"

The database already has data. You can either:

1. Use existing credentials
2. Reset database (⚠️ deletes all data):
   ```bash
   cd packages/database
   npx prisma migrate reset --force
   npm run db:seed
   ```

### If you get "Cannot find module tsx"

Run this first:

```bash
npm install tsx --save-dev
```

### If migrations fail

Check DATABASE_URL environment variable is set correctly:

```bash
echo $DATABASE_URL
```

Should show: `postgresql://ashley_ai_db_fnky_user:...@...`

## After Seeding

Once seeded, you can:

- Login with admin@ashleyai.com / password123
- Access all dashboard features
- Create new users, clients, orders, etc.
- The demo data will be visible in all modules

---

**Need Help?** Check Render logs or ask for assistance!
