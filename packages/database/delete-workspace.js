const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteWorkspace() {
  try {
    const slug = process.argv[2] || 'reefer';

    console.log(`🔍 Searching for workspace with slug: ${slug}`);

    // Find workspace
    const workspace = await prisma.workspace.findFirst({
      where: { slug: slug },
      include: {
        users: {
          select: { email: true }
        }
      }
    });

    if (!workspace) {
      console.log(`❌ No workspace found with slug: ${slug}`);
      console.log('✅ You can use this slug for registration!');
      process.exit(0);
    }

    console.log(`\n🗑️  Found workspace:`);
    console.log(`   Name: ${workspace.name}`);
    console.log(`   Slug: ${workspace.slug}`);
    console.log(`   Users: ${workspace.users.length}`);
    if (workspace.users.length > 0) {
      workspace.users.forEach(user => {
        console.log(`      - ${user.email}`);
      });
    }
    console.log('');

    // Delete all users in this workspace first
    if (workspace.users.length > 0) {
      console.log('🗑️  Deleting users in this workspace...');
      await prisma.user.deleteMany({
        where: { workspace_id: workspace.id }
      });
      console.log(`   ✅ Deleted ${workspace.users.length} user(s)`);
    }

    // Delete the workspace
    console.log('🗑️  Deleting workspace...');
    await prisma.workspace.delete({
      where: { id: workspace.id }
    });

    console.log('\n✅ Workspace deleted successfully!');
    console.log('');
    console.log(`🎉 You can now register with workspace slug: "${slug}"`);
    console.log('   http://localhost:3001/register');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2014') {
      console.log('\n⚠️  Workspace has related data. Deleting dependencies first...');
    }
  } finally {
    await prisma.$disconnect();
  }
}

deleteWorkspace();
