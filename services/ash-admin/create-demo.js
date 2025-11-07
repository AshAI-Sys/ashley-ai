// Create Demo User - Simple Script
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function main() {
  try {
    console.log('🚀 Creating demo user...\n');

    // Create or find workspace
    let workspace = await prisma.workspace.findFirst({
      where: { slug: 'demo-workspace' }
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: 'Demo Company',
          slug: 'demo-workspace',
          is_active: true,
        }
      });
      console.log('✅ Workspace created');
    } else {
      console.log('✅ Using existing workspace');
    }

    // Check if user exists
    const existing = await prisma.user.findFirst({
      where: { email: 'demo@ashleyai.com' }
    });

    if (existing) {
      console.log('\n⚠️  Demo user already exists!\n');
      console.log('═══════════════════════════════════════');
      console.log('  DEMO ACCOUNT CREDENTIALS');
      console.log('═══════════════════════════════════════');
      console.log('  📧 Email: demo@ashleyai.com');
      console.log('  🔑 Password: Demo123!');
      console.log('═══════════════════════════════════════\n');
      return;
    }

    // Create user
    const password_hash = await bcrypt.hash('Demo123!', 10);

    await prisma.user.create({
      data: {
        workspace_id: workspace.id,
        email: 'demo@ashleyai.com',
        first_name: 'Demo',
        last_name: 'User',
        role: 'ADMIN',
        position: 'System Administrator',
        department: 'Management',
        password_hash,
        is_active: true,
      }
    });

    console.log('\n✅ Demo user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('  DEMO ACCOUNT CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log('  📧 Email: demo@ashleyai.com');
    console.log('  🔑 Password: Demo123!');
    console.log('  👤 Name: Demo User');
    console.log('  🏢 Role: ADMIN');
    console.log('═══════════════════════════════════════');
    console.log('\n🌐 Production: https://ash-kwm3455as-ash-ais-projects.vercel.app');
    console.log('💻 Local: http://localhost:3001\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
