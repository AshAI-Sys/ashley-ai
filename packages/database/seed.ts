import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Check if workspace exists, create if not
  let workspace = await prisma.workspace.findUnique({
    where: { slug: 'ashley-ai-demo' },
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: 'Ashley AI Demo',
        slug: 'ashley-ai-demo',
        settings: '{}',
      },
    });
    console.log('✅ Workspace created:', workspace.slug);
  } else {
    console.log('✅ Workspace already exists:', workspace.slug);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Check if admin user exists
  let adminUser = await prisma.user.findFirst({
    where: { email: 'admin@ashleyai.com' },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: 'admin@ashleyai.com',
        first_name: 'Admin',
        last_name: 'User',
        password_hash: hashedPassword,
        role: 'ADMIN',
        workspace_id: workspace.id,
        position: 'System Administrator',
        department: 'Management',
      },
    });
    console.log('✅ Admin user created:', adminUser.email);
  } else {
    console.log('✅ Admin user already exists:', adminUser.email);
  }

  // Check if demo client exists
  let client = await prisma.client.findFirst({
    where: { email: 'client@demo.com' },
  });

  if (!client) {
    client = await prisma.client.create({
      data: {
        name: 'Demo Client',
        email: 'client@demo.com',
        phone: '+63 912 345 6789',
        address: JSON.stringify({ street: 'Manila, Philippines' }),
        contact_person: 'Juan Dela Cruz',
        is_active: true,
        workspace_id: workspace.id,
      },
    });
    console.log('✅ Demo client created:', client.name);
  } else {
    console.log('✅ Demo client already exists:', client.name);
  }

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
