// Create Demo User Script
// This script creates a demo user account in the database

const { PrismaClient } = require('./packages/database');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    console.log('🚀 Creating demo user...');

    // Check if demo workspace exists
    let workspace = await prisma.workspace.findFirst({
      where: { slug: 'demo-workspace' }
    });

    // Create workspace if it doesn't exist
    if (!workspace) {
      console.log('📦 Creating demo workspace...');
      workspace = await prisma.workspace.create({
        data: {
          name: 'Demo Company',
          slug: 'demo-workspace',
          is_active: true,
        }
      });
      console.log('✅ Workspace created:', workspace.id);
    } else {
      console.log('✅ Using existing workspace:', workspace.id);
    }

    // Check if demo user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: 'demo@ashleyai.com',
        workspace_id: workspace.id
      }
    });

    if (existingUser) {
      console.log('⚠️ Demo user already exists!');
      console.log('📧 Email: demo@ashleyai.com');
      console.log('🔑 Password: Demo123!');
      return;
    }

    // Hash password
    const password = 'Demo123!';
    const password_hash = await bcrypt.hash(password, 10);

    // Create demo user
    const user = await prisma.user.create({
      data: {
        workspace_id: workspace.id,
        email: 'demo@ashleyai.com',
        first_name: 'Demo',
        last_name: 'User',
        role: 'ADMIN',
        position: 'System Administrator',
        department: 'Management',
        password_hash: password_hash,
        is_active: true,
        requires_2fa: false,
        two_factor_enabled: false,
      }
    });

    console.log('✅ Demo user created successfully!');
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('  DEMO ACCOUNT CREDENTIALS');
    console.log('═══════════════════════════════════════');
    console.log('  📧 Email: demo@ashleyai.com');
    console.log('  🔑 Password: Demo123!');
    console.log('  👤 Name: Demo User');
    console.log('  🏢 Role: ADMIN');
    console.log('  🏭 Workspace: Demo Company');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('🌐 Production URL: https://ash-kwm3455as-ash-ais-projects.vercel.app');
    console.log('💻 Local URL: http://localhost:3001');
    console.log('');
    console.log('You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error creating demo user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();
