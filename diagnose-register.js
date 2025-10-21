// Comprehensive registration diagnostic
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:' + path.join(__dirname, 'packages', 'database', 'prisma', 'dev.db')
    }
  }
});

async function diagnose() {
  console.log('🔍 Registration Diagnostic Tool\n');

  try {
    // 1. Check database connection
    console.log('1️⃣ Testing database connection...');
    const userCount = await prisma.user.count();
    const workspaceCount = await prisma.workspace.count();
    console.log(`   ✅ Database connected (${userCount} users, ${workspaceCount} workspaces)\n`);

    // 2. Check if workspace slug exists
    const testSlug = 'reefer';
    console.log(`2️⃣ Checking if workspace slug "${testSlug}" exists...`);
    const existingWorkspace = await prisma.workspace.findUnique({
      where: { slug: testSlug }
    });
    if (existingWorkspace) {
      console.log(`   ⚠️  Workspace "${testSlug}" already exists!`);
      console.log(`   📋 Workspace details:`, {
        id: existingWorkspace.id,
        name: existingWorkspace.name,
        slug: existingWorkspace.slug,
        is_active: existingWorkspace.is_active
      });
    } else {
      console.log(`   ✅ Workspace slug "${testSlug}" is available\n`);
    }

    // 3. Check if email exists
    const testEmail = 'kelvinmorfe17@gmail.com';
    console.log(`3️⃣ Checking if email "${testEmail}" exists...`);
    const existingUser = await prisma.user.findFirst({
      where: { email: testEmail.toLowerCase() }
    });
    if (existingUser) {
      console.log(`   ⚠️  User with email "${testEmail}" already exists!`);
      console.log(`   📋 User details:`, {
        id: existingUser.id,
        email: existingUser.email,
        first_name: existingUser.first_name,
        last_name: existingUser.last_name,
        role: existingUser.role,
        is_active: existingUser.is_active,
        email_verified: existingUser.email_verified
      });
      console.log(`\n   💡 To fix: Delete this user or use a different email\n`);
    } else {
      console.log(`   ✅ Email "${testEmail}" is available\n`);
    }

    // 4. List all existing users and workspaces
    console.log('4️⃣ Existing users:');
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        workspace_id: true
      }
    });
    if (allUsers.length === 0) {
      console.log('   📭 No users found\n');
    } else {
      allUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.first_name} ${user.last_name}) - Role: ${user.role}`);
      });
      console.log('');
    }

    console.log('5️⃣ Existing workspaces:');
    const allWorkspaces = await prisma.workspace.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        is_active: true
      }
    });
    if (allWorkspaces.length === 0) {
      console.log('   📭 No workspaces found\n');
    } else {
      allWorkspaces.forEach(ws => {
        console.log(`   - ${ws.name} (slug: ${ws.slug}) - Active: ${ws.is_active}`);
      });
      console.log('');
    }

    // 6. Test password validation
    console.log('6️⃣ Testing password validation...');
    const { validatePassword } = require('./services/ash-admin/src/lib/password-validator.ts');
    const testPassword = 'Test1234'; // Common password pattern
    const validation = validatePassword(testPassword);
    console.log(`   Password: "${testPassword}"`);
    console.log(`   Valid: ${validation.valid ? '✅' : '❌'}`);
    console.log(`   Strength: ${validation.strength}`);
    console.log(`   Score: ${validation.score}/100`);
    if (validation.errors.length > 0) {
      console.log(`   Errors:`);
      validation.errors.forEach(err => console.log(`     - ${err}`));
    }
    console.log('');

    console.log('✅ Diagnostic complete!\n');

  } catch (error) {
    console.error('❌ Error during diagnostic:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnose();
