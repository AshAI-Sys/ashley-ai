/**
 * Seed Reefer's Inn T-Shirt Inventory Data
 * Creates sample finished goods inventory matching the screenshot
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedReefersInn() {
  console.log('🌱 Seeding Reefer\'s Inn inventory...');

  try {
    // Get or create workspace
    let workspace = await prisma.workspace.findFirst({
      where: { name: 'demo-workspace-1' }
    });

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: 'demo-workspace-1',
          slug: 'demo-workspace-1',
        }
      });
    }

    // Get or create client
    let client = await prisma.client.findFirst({
      where: { name: 'Reefer\'s Inn', workspace_id: workspace.id }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          workspace_id: workspace.id,
          name: 'Reefer\'s Inn',
          contact_person: 'John Doe',
          email: 'contact@reefersinn.com',
          phone: '+63 912 345 6789',
          address: 'Manila, Philippines',
        }
      });
    }

    // Create order for Reefer's Inn Black T-Shirt
    const order = await prisma.order.create({
      data: {
        workspace_id: workspace.id,
        client_id: client.id,
        order_number: 'ORD-REEFER-001',
        design_name: 'REEFER\'S INN (Black)',
        total_amount: 10250.00, // Total order amount
        status: 'PRODUCTION',
        delivery_date: new Date('2025-12-01'),
      }
    });

    console.log('✅ Order created:', order.order_number);

    // Create finished units for each size with crate numbers
    const sizes = [
      { size: 'SMALL', sku: 'R001US', crate: 'α16', qty: 6, price: 450.00, salePrice: 350.00 },
      { size: 'MEDIUM', sku: 'R001UM', crate: 'α16', qty: 0, price: 450.00, salePrice: null },
      { size: 'LARGE', sku: 'R001UL', crate: 'α16', qty: 0, price: 450.00, salePrice: null },
      { size: 'XL', sku: 'R001UXL', crate: 'α16', qty: 0, price: 450.00, salePrice: null },
      { size: '2XL', sku: 'R001U2XL', crate: 'G-9', qty: 5, price: 500.00, salePrice: 400.00 },
      { size: '3XL', sku: 'R001U3XL', crate: 'G-9', qty: 0, price: 500.00, salePrice: null },
    ];

    for (const sizeData of sizes) {
      if (sizeData.qty > 0) {
        // Create multiple units for available stock
        for (let i = 1; i <= sizeData.qty; i++) {
          await prisma.finishedUnit.create({
            data: {
              workspace_id: workspace.id,
              order_id: order.id,
              sku: sizeData.sku,
              size_code: sizeData.size,
              color: 'Black',
              serial: `${sizeData.sku}-${String(i).padStart(3, '0')}`,
              product_image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400', // Sample t-shirt image
              crate_number: sizeData.crate,
              category: 'T-SHIRT',
              price: sizeData.price,
              sale_price: sizeData.salePrice,
              packed: false,
            }
          });
        }
        console.log(`✅ Created ${sizeData.qty} units of ${sizeData.size} (${sizeData.sku})`);
      } else {
        // Create at least one unit for out of stock items
        await prisma.finishedUnit.create({
          data: {
            workspace_id: workspace.id,
            order_id: order.id,
            sku: sizeData.sku,
            size_code: sizeData.size,
            color: 'Black',
            serial: `${sizeData.sku}-001`,
            product_image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
            crate_number: sizeData.crate,
            category: 'T-SHIRT',
            price: sizeData.price,
            sale_price: sizeData.salePrice,
            packed: true, // Marked as packed (out of stock)
          }
        });
        console.log(`✅ Created 1 unit of ${sizeData.size} (${sizeData.sku}) - Packed/Out of Stock`);
      }
    }

    console.log('');
    console.log('🎉 Reefer\'s Inn inventory seeded successfully!');
    console.log('📦 Total sizes: 6 (SMALL, MEDIUM, LARGE, XL, 2XL, 3XL)');
    console.log('📍 Crate locations: α16, G-9');
    console.log('🔍 Available stock: 11 units (6 SMALL + 5 2XL)');
    console.log('❌ Out of stock: MEDIUM, LARGE, XL, 3XL');
    console.log('');
    console.log('🔗 View at: http://localhost:3001/inventory/finished-goods');
    console.log('');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedReefersInn()
  .then(() => {
    console.log('✅ Seed completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
