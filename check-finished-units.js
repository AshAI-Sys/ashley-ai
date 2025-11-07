const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFinishedUnits() {
  try {
    const count = await prisma.finishedUnit.count();
    console.log(`✅ Total Finished Units in Database: ${count}`);

    if (count > 0) {
      const units = await prisma.finishedUnit.findMany({
        take: 5,
        include: {
          order: {
            select: {
              design_name: true,
              order_number: true
            }
          }
        }
      });

      console.log('\n📦 Sample Units:');
      units.forEach(unit => {
        console.log(`  • ${unit.sku} (${unit.size_code}) - ${unit.order.design_name}`);
        console.log(`    Crate: ${unit.crate_number} | Price: ₱${unit.price} | Sale: ₱${unit.sale_price || 'N/A'}`);
        console.log(`    Packed: ${unit.packed ? 'YES (Out of Stock)' : 'NO (Available)'}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkFinishedUnits();
