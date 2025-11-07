/**
 * Import Inventory Data Script
 *
 * Usage: node import-inventory-data.js
 *
 * This script will:
 * 1. Create sample client and order
 * 2. Import finished units inventory
 * 3. Display summary
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Sample inventory data - CUSTOMIZE THIS!
const SAMPLE_PRODUCTS = [
  {
    sku: 'RI-TSHIRT-001',
    product_name: 'Reefer\'s Inn T-Shirt Black',
    category: 'T-SHIRT',
    brand: 'Reefer\'s Inn',
    sizes: [
      { size: 'S', quantity: 20, crate: 'A-1' },
      { size: 'M', quantity: 50, crate: 'A-1' },
      { size: 'L', quantity: 40, crate: 'A-2' },
      { size: 'XL', quantity: 30, crate: 'A-2' },
    ],
    color: 'Black',
    price: 250,
    sale_price: 200,
  },
  {
    sku: 'RI-POLO-001',
    product_name: 'Reefer\'s Inn Polo White',
    category: 'POLO',
    brand: 'Reefer\'s Inn',
    sizes: [
      { size: 'S', quantity: 15, crate: 'B-1' },
      { size: 'M', quantity: 30, crate: 'B-1' },
      { size: 'L', quantity: 25, crate: 'B-2' },
      { size: 'XL', quantity: 20, crate: 'B-2' },
    ],
    color: 'White',
    price: 350,
    sale_price: 300,
  },
  {
    sku: 'RI-HOODIE-001',
    product_name: 'Reefer\'s Inn Hoodie Gray',
    category: 'HOODIE',
    brand: 'Reefer\'s Inn',
    sizes: [
      { size: 'M', quantity: 20, crate: 'C-1' },
      { size: 'L', quantity: 30, crate: 'C-1' },
      { size: 'XL', quantity: 25, crate: 'C-2' },
    ],
    color: 'Gray',
    price: 650,
    sale_price: 550,
  },
];

async function main() {
  console.log('🚀 Starting inventory import...\n');

  try {
    // Use the specific workspace for ashai.system@gmail.com user
    const CORRECT_WORKSPACE_ID = 'cmhojdrie0002aby35loabmqb';

    let workspace = await prisma.workspace.findUnique({
      where: { id: CORRECT_WORKSPACE_ID },
    });

    if (!workspace) {
      throw new Error('User workspace not found!');
    }

    console.log(`✅ Using workspace: ${workspace.name} (ID: ${workspace.id})\n`);

    // Get or create client
    let client = await prisma.client.findFirst({
      where: { workspace_id: workspace.id },
    });

    if (!client) {
      console.log('👤 Creating demo client...');
      client = await prisma.client.create({
        data: {
          workspace_id: workspace.id,
          name: 'Reefer\'s Inn Store',
          contact_person: 'Store Manager',
          email: 'store@reefersinn.com',
          phone: '+63-123-456-7890',
          address: 'Manila, Philippines',
        },
      });
      console.log(`✅ Created client: ${client.name} (ID: ${client.id})\n`);
    } else {
      console.log(`✅ Using client: ${client.name} (ID: ${client.id})\n`);
    }

    // Import products
    let totalUnits = 0;
    let productsImported = 0;

    for (const product of SAMPLE_PRODUCTS) {
      console.log(`\n📦 Importing: ${product.product_name}`);

      // Create order for this product
      const order = await prisma.order.create({
        data: {
          workspace_id: workspace.id,
          client_id: client.id,
          order_number: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          po_number: `PO-${product.sku}`,
          design_name: product.product_name,
          order_type: 'NEW',
          status: 'completed',
          total_amount: 0, // Will calculate
        },
      });

      console.log(`   Created order: ${order.order_number}`);

      // Create finished units for each size
      for (const sizeData of product.sizes) {
        console.log(`   - Size ${sizeData.size}: ${sizeData.quantity} units (Crate ${sizeData.crate})`);

        // Create multiple units
        for (let i = 1; i <= sizeData.quantity; i++) {
          await prisma.finishedUnit.create({
            data: {
              workspace_id: workspace.id,
              order_id: order.id,
              sku: product.sku,
              size_code: sizeData.size,
              color: product.color,
              serial: `${product.sku}-${sizeData.size}-${String(i).padStart(4, '0')}`,
              product_image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
              crate_number: sizeData.crate,
              category: product.category,
              brand: product.brand,
              price: product.price,
              sale_price: product.sale_price,
              packed: false,
            },
          });
          totalUnits++;
        }
      }

      productsImported++;
      console.log(`   ✅ Imported ${product.sizes.reduce((sum, s) => sum + s.quantity, 0)} units`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 IMPORT COMPLETE!');
    console.log('='.repeat(60));
    console.log(`✅ Products imported: ${productsImported}`);
    console.log(`✅ Total units created: ${totalUnits}`);
    console.log(`✅ Workspace: ${workspace.name}`);
    console.log(`✅ Client: ${client.name}`);
    console.log('\n📍 View inventory at:');
    console.log('   https://ash-ikbbkqd5r-ash-ais-projects.vercel.app/inventory/finished-goods');
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
