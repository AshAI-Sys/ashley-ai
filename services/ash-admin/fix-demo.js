const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_oVNf76Kpqasx@ep-falling-fire-a1ru8mim-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function fixDemoAccount() {
  try {
    console.log('🔍 Fixing demo account...\n');

    // Find or create workspace
    let workspace = await prisma.workspace.upsert({
      where: { slug: 'demo-workspace' },
      update: {},
      create: {
        name: 'Demo Workspace',
        slug: 'demo-workspace',
        is_active: true,
        settings: JSON.stringify({
          timezone: 'Asia/Manila',
          currency: 'PHP',
        })
      }
    });

    console.log('✅ Workspace:', workspace.name);

    // Delete old demo user if exists
    await prisma.user.deleteMany({
      where: { email: 'demo@ashleyai.com' }
    });

    // Create fresh demo user
    const passwordHash = await bcrypt.hash('Demo@123456', 10);

    const user = await prisma.user.create({
      data: {
        email: 'demo@ashleyai.com',
        password_hash: passwordHash,
        first_name: 'Demo',
        last_name: 'Admin',
        role: 'admin',
        position: 'Administrator',
        department: 'Management',
        workspace_id: workspace.id,
        is_active: true,
        permissions: JSON.stringify(['*']),
        email_verified: true,
      }
    });

    console.log('✅ Demo user created!\n');
    console.log('╔════════════════════════════════╗');
    console.log('║   DEMO ACCOUNT READY!          ║');
    console.log('╠════════════════════════════════╣');
    console.log('║ Email: demo@ashleyai.com       ║');
    console.log('║ Password: Demo@123456          ║');
    console.log('╚════════════════════════════════╝');
    console.log('\nLogin: https://ash-ai-sigma.vercel.app/login\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixDemoAccount();
