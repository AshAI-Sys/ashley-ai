/**
 * Create Admin User Script
 * Run: DATABASE_URL="your-connection-string" npx tsx scripts/create-admin-user.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creating admin user and workspace...\n');

  try {
    // Create workspace
    const workspace = await prisma.workspace.upsert({
      where: { slug: 'ashley-ai-prod' },
      update: {},
      create: {
        name: 'Ashley AI Production',
        slug: 'ashley-ai-prod',
        settings: {},
      },
    });
    console.log('✅ Workspace created:', workspace.name);

    // Hash password (12 rounds - production strength)
    const password = 'Admin@12345';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin user
    const admin = await prisma.user.upsert({
      where: { email: 'admin@ashleyai.com' },
      update: {
        password: hashedPassword,
        email_verified: true,
      },
      create: {
        email: 'admin@ashleyai.com',
        password: hashedPassword,
        first_name: 'System',
        last_name: 'Administrator',
        role: 'admin',
        email_verified: true,
        workspace_id: workspace.id,
      },
    });
    console.log('✅ Admin user created:', admin.email);

    console.log('\n📋 Login Credentials:');
    console.log('   Email:', admin.email);
    console.log('   Password:', password);
    console.log('\n⚠️  IMPORTANT: Change password after first login!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
