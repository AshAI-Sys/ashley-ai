const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CUSTOMIZE THESE PRODUCT NAMES!
const PRODUCT_UPDATES = [
  {
    sku: 'RI-TSHIRT-001',
    new_name: 'Reefer\'s Inn Classic T-Shirt',
    category: 'T-SHIRT',
    brand: 'Reefer\'s Inn',
  },
  {
    sku: 'RI-POLO-001', 
    new_name: 'Reefer\'s Inn Premium Polo',
    category: 'POLO',
    brand: 'Reefer\'s Inn',
  },
  {
    sku: 'RI-HOODIE-001',
    new_name: 'Reefer\'s Inn Comfort Hoodie',
    category: 'HOODIE',
    brand: 'Reefer\'s Inn',
  },
];

async function main() {
  console.log('🚀 Updating product names...\n');

  const WORKSPACE_ID = 'cmhojdrie0002aby35loabmqb';

  for (const update of PRODUCT_UPDATES) {
    console.log(`📝 Updating SKU: ${update.sku}`);
    
    // Get order for this SKU
    const finishedUnit = await prisma.finishedUnit.findFirst({
      where: {
        workspace_id: WORKSPACE_ID,
        sku: update.sku,
      },
      include: { order: true }
    });

    if (finishedUnit) {
      // Update the order's design_name
      await prisma.order.update({
        where: { id: finishedUnit.order_id },
        data: { design_name: update.new_name }
      });

      // Count updated units
      const count = await prisma.finishedUnit.count({
        where: {
          workspace_id: WORKSPACE_ID,
          sku: update.sku
        }
      });

      console.log(`   ✅ Updated "${update.new_name}" (${count} units)\n`);
    }
  }

  console.log('🎉 All product names updated!\n');
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error('❌ Error:', error);
    prisma.$disconnect();
    process.exit(1);
  });
