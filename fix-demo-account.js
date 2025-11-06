const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://neondb_owner:npg_oVNf76Kpqasx@ep-falling-fire-a1ru8mim-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"
    }
  }
});

async function fixDemoAccount() {
  try {
    console.log('🔍 Checking demo account...');

    // Find or create workspace
    let workspace = await prisma.workspace.findUnique({
      where: { slug: 'demo-workspace' }
    });

    if (!workspace) {
      console.log('Creating demo workspace...');
      workspace = await prisma.workspace.create({
        data: {
          name: 'Demo Workspace',
          slug: 'demo-workspace',
          is_active: true,
          settings: JSON.stringify({
            timezone: 'Asia/Manila',
            currency: 'PHP',
          })
        }
      });
      console.log('✅ Workspace created:', workspace.name);
    } else {
      console.log('✅ Workspace exists:', workspace.name);
    }

    // Check if demo user exists
    let user = await prisma.user.findFirst({
      where: { email: 'demo@ashleyai.com' }
    });

    const passwordHash = await bcrypt.hash('Demo@123456', 10);

    if (!user) {
      console.log('Creating demo user...');
      user = await prisma.user.create({
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
      console.log('✅ Demo user created!');
    } else {
      console.log('Updating demo user password...');
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password_hash: passwordHash,
          is_active: true,
          email_verified: true,
          workspace_id: workspace.id,
        }
      });
      console.log('✅ Demo user updated!');
    }

    console.log('');
    console.log('╔════════════════════════════════╗');
    console.log('║   DEMO ACCOUNT CREDENTIALS     ║');
    console.log('╠════════════════════════════════╣');
    console.log('║ Email: demo@ashleyai.com       ║');
    console.log('║ Password: Demo@123456          ║');
    console.log('╚════════════════════════════════╝');
    console.log('');
    console.log('Login at: https://ash-ai-sigma.vercel.app/login');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDemoAccount();
