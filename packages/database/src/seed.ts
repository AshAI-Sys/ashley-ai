import { prisma } from './index'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-apparel' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Demo Apparel Manufacturing',
      slug: 'demo-apparel',
      settings: JSON.stringify({
        timezone: 'Asia/Manila',
        currency: 'PHP',
        business_type: 'apparel_manufacturing'
      })
    }
  })

  console.log(`✅ Created workspace: ${workspace.name}`)

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { 
      workspace_id_email: {
        workspace_id: workspace.id,
        email: 'admin@demo.com'
      }
    },
    update: {},
    create: {
      id: uuidv4(),
      workspace_id: workspace.id,
      email: 'admin@demo.com',
      password_hash: hashedPassword,
      first_name: 'System',
      last_name: 'Administrator',
      role: 'Admin',
      permissions: JSON.stringify([]),
      requires_2fa: true,
      is_active: true
    }
  })

  console.log(`✅ Created admin user: ${adminUser.email}`)

  // Create manager user
  const managerUser = await prisma.user.upsert({
    where: {
      workspace_id_email: {
        workspace_id: workspace.id,
        email: 'manager@demo.com'
      }
    },
    update: {},
    create: {
      id: uuidv4(),
      workspace_id: workspace.id,
      email: 'manager@demo.com',
      password_hash: hashedPassword,
      first_name: 'Production',
      last_name: 'Manager',
      role: 'Manager',
      permissions: JSON.stringify([]),
      requires_2fa: true,
      is_active: true
    }
  })

  console.log(`✅ Created manager user: ${managerUser.email}`)

  // Create demo clients
  const client1 = await prisma.client.create({
    data: {
      id: uuidv4(),
      workspace_id: workspace.id,
      name: 'Trendy Threads Co.',
      contact_person: 'Maria Santos',
      email: 'maria@trendythreads.ph',
      phone: '+63-917-123-4567',
      address: JSON.stringify({
        street: '123 Fashion Ave',
        city: 'Makati',
        region: 'NCR',
        postal_code: '1200',
        country: 'Philippines'
      }),
      payment_terms: 30,
      credit_limit: 500000.00,
      portal_settings: JSON.stringify({
        allow_reorders: true,
        auto_approve_reprints: false
      })
    }
  })

  const client2 = await prisma.client.create({
    data: {
      id: uuidv4(),
      workspace_id: workspace.id,
      name: 'Urban Style PH',
      contact_person: 'Jose Cruz',
      email: 'jose@urbanstyle.ph',
      phone: '+63-917-987-6543',
      address: JSON.stringify({
        street: '456 Style Street',
        city: 'Quezon City',
        region: 'NCR',
        postal_code: '1100',
        country: 'Philippines'
      }),
      payment_terms: 15,
      credit_limit: 300000.00
    }
  })

  console.log(`✅ Created demo clients: ${client1.name}, ${client2.name}`)

  // Create brands for clients
  const brand1 = await prisma.brand.create({
    data: {
      id: uuidv4(),
      workspace_id: workspace.id,
      client_id: client1.id,
      name: 'Trendy Casual',
      code: 'TCAS',
      settings: JSON.stringify({
        preferred_colors: ['#FF5733', '#33FF57', '#3357FF'],
        size_chart: 'US_STANDARD'
      })
    }
  })

  const brand2 = await prisma.brand.create({
    data: {
      id: uuidv4(),
      workspace_id: workspace.id,
      client_id: client1.id,
      name: 'Trendy Sports',
      code: 'TSPT',
      settings: JSON.stringify({
        preferred_colors: ['#000000', '#FFFFFF', '#FF0000'],
        size_chart: 'ATHLETIC'
      })
    }
  })

  const brand3 = await prisma.brand.create({
    data: {
      id: uuidv4(),
      workspace_id: workspace.id,
      client_id: client2.id,
      name: 'Urban Streetwear',
      code: 'URBN',
      settings: JSON.stringify({
        preferred_colors: ['#1A1A1A', '#CCCCCC', '#FFD700'],
        size_chart: 'OVERSIZED'
      })
    }
  })

  console.log(`✅ Created demo brands: ${brand1.name}, ${brand2.name}, ${brand3.name}`)

  // Create sample orders
  const order1 = await prisma.order.create({
    data: {
      id: uuidv4(),
      workspace_id: workspace.id,
      client_id: client1.id,
      brand_id: brand1.id,
      order_number: 'TCAS-2025-000001',
      status: 'confirmed',
      total_amount: 45000.00,
      currency: 'PHP',
      delivery_date: new Date('2024-02-15'),
      notes: 'Rush order for Valentine\'s collection'
    }
  })

  // Create line items for order 1
  await prisma.orderLineItem.createMany({
    data: [
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        order_id: order1.id,
        description: 'Cotton T-Shirt with Custom Print',
        quantity: 200,
        unit_price: 150.00,
        total_price: 30000.00,
        printing_method: 'silkscreen',
        garment_type: 'T-Shirt',
        size_breakdown: JSON.stringify({
          'XS': 20,
          'S': 50,
          'M': 70,
          'L': 40,
          'XL': 20
        })
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        order_id: order1.id,
        description: 'Hooded Sweatshirt with Embroidery',
        quantity: 50,
        unit_price: 300.00,
        total_price: 15000.00,
        printing_method: 'embroidery',
        garment_type: 'Hoodie',
        size_breakdown: JSON.stringify({
          'S': 10,
          'M': 20,
          'L': 15,
          'XL': 5
        })
      }
    ]
  })

  const order2 = await prisma.order.create({
    data: {
      id: uuidv4(),
      workspace_id: workspace.id,
      client_id: client2.id,
      brand_id: brand3.id,
      order_number: 'URBN-2025-000001',
      status: 'in_progress',
      total_amount: 72000.00,
      currency: 'PHP',
      delivery_date: new Date('2024-03-01'),
      notes: 'Spring collection launch'
    }
  })

  // Create line items for order 2
  await prisma.orderLineItem.createMany({
    data: [
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        order_id: order2.id,
        description: 'Premium Polo Shirt - DTF Print',
        quantity: 150,
        unit_price: 280.00,
        total_price: 42000.00,
        printing_method: 'dtf',
        garment_type: 'Polo',
        size_breakdown: JSON.stringify({
          'S': 30,
          'M': 60,
          'L': 45,
          'XL': 15
        })
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        order_id: order2.id,
        description: 'Athletic Shorts - Sublimation',
        quantity: 100,
        unit_price: 300.00,
        total_price: 30000.00,
        printing_method: 'sublimation',
        garment_type: 'Shorts',
        size_breakdown: JSON.stringify({
          'XS': 10,
          'S': 25,
          'M': 35,
          'L': 25,
          'XL': 5
        })
      }
    ]
  })

  console.log(`✅ Created demo orders: ${order1.order_number}, ${order2.order_number}`)

  // Create sample design assets (Stage 2)
  const designAsset1 = await prisma.designAsset.create({
    data: {
      id: uuidv4(),
      workspace_id: workspace.id,
      brand_id: brand1.id,
      order_id: order1.id,
      name: 'Valentine Collection Logo',
      method: 'SILKSCREEN',
      status: 'APPROVED',
      current_version: 2,
      is_best_seller: true,
      created_by: adminUser.id,
      tags: JSON.stringify(['valentine', 'romantic', 'love'])
    }
  })

  const designAsset2 = await prisma.designAsset.create({
    data: {
      id: uuidv4(),
      workspace_id: workspace.id,
      brand_id: brand3.id,
      order_id: order2.id,
      name: 'Spring Urban Streetwear Design',
      method: 'DTF',
      status: 'PENDING_APPROVAL',
      current_version: 1,
      created_by: adminUser.id,
      tags: JSON.stringify(['spring', 'urban', 'streetwear'])
    }
  })

  // Create design versions
  await prisma.designVersion.createMany({
    data: [
      {
        id: uuidv4(),
        asset_id: designAsset1.id,
        version: 1,
        files: JSON.stringify({
          mockup_url: 'https://example.com/valentine-v1-mockup.jpg',
          prod_url: 'https://example.com/valentine-v1-production.ai',
          separations: [
            'https://example.com/valentine-red.png',
            'https://example.com/valentine-pink.png'
          ]
        }),
        placements: JSON.stringify([
          {
            area: 'front',
            width_cm: 25,
            height_cm: 20,
            offset_x: 0,
            offset_y: 5
          }
        ]),
        palette: JSON.stringify(['#FF1744', '#FF8A95', '#FFFFFF']),
        meta: JSON.stringify({
          dpi: 300,
          notes: 'Initial concept with hearts and romantic elements'
        }),
        created_by: adminUser.id
      },
      {
        id: uuidv4(),
        asset_id: designAsset1.id,
        version: 2,
        files: JSON.stringify({
          mockup_url: 'https://example.com/valentine-v2-mockup.jpg',
          prod_url: 'https://example.com/valentine-v2-production.ai',
          separations: [
            'https://example.com/valentine-v2-red.png',
            'https://example.com/valentine-v2-pink.png',
            'https://example.com/valentine-v2-white.png'
          ]
        }),
        placements: JSON.stringify([
          {
            area: 'front',
            width_cm: 28,
            height_cm: 22,
            offset_x: 0,
            offset_y: 4
          }
        ]),
        palette: JSON.stringify(['#FF1744', '#FF8A95', '#FFFFFF']),
        meta: JSON.stringify({
          dpi: 300,
          notes: 'Revised version with client feedback - larger size and cleaner separations'
        }),
        created_by: adminUser.id
      },
      {
        id: uuidv4(),
        asset_id: designAsset2.id,
        version: 1,
        files: JSON.stringify({
          mockup_url: 'https://example.com/urban-spring-mockup.jpg',
          prod_url: 'https://example.com/urban-spring-dtf.png'
        }),
        placements: JSON.stringify([
          {
            area: 'front',
            width_cm: 30,
            height_cm: 35,
            offset_x: 0,
            offset_y: 0
          }
        ]),
        palette: JSON.stringify(['#1A1A1A', '#FFD700', '#CCCCCC']),
        meta: JSON.stringify({
          dpi: 300,
          notes: 'Full-color DTF design for spring collection launch'
        }),
        created_by: adminUser.id
      }
    ]
  })

  // Create design approvals
  await prisma.designApproval.createMany({
    data: [
      {
        id: uuidv4(),
        asset_id: designAsset1.id,
        version: 1,
        status: 'CHANGES_REQUESTED',
        client_id: client1.id,
        approver_name: 'Maria Santos',
        approver_email: client1.email,
        approver_signed_at: new Date('2024-01-20T10:30:00Z'),
        comments: 'Please make the logo 20% larger and adjust the color intensity',
        portal_token: 'sample_token_1_' + Buffer.from(Math.random().toString()).toString('hex')
      },
      {
        id: uuidv4(),
        asset_id: designAsset1.id,
        version: 2,
        status: 'APPROVED',
        client_id: client1.id,
        approver_name: 'Maria Santos',
        approver_email: client1.email,
        approver_signed_at: new Date('2024-01-25T14:45:00Z'),
        comments: 'Perfect! This version looks great. Ready for production.',
        portal_token: 'sample_token_2_' + Buffer.from(Math.random().toString()).toString('hex')
      },
      {
        id: uuidv4(),
        asset_id: designAsset2.id,
        version: 1,
        status: 'SENT',
        client_id: client2.id,
        approver_email: client2.email,
        portal_token: 'sample_token_3_' + Buffer.from(Math.random().toString()).toString('hex'),
        expires_at: new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours from now
      }
    ]
  })

  // Create Ashley design checks
  await prisma.designCheck.createMany({
    data: [
      {
        id: uuidv4(),
        asset_id: designAsset1.id,
        version: 1,
        method: 'SILKSCREEN',
        result: 'WARN',
        issues: JSON.stringify([
          {
            code: 'DPI_LOW',
            message: 'Some elements may appear pixelated at final print size',
            placement_ref: 'front'
          }
        ]),
        metrics: JSON.stringify({
          min_dpi: 180,
          expected_ink_g: 2.5,
          color_count: 2,
          complexity_score: 7.2
        })
      },
      {
        id: uuidv4(),
        asset_id: designAsset1.id,
        version: 2,
        method: 'SILKSCREEN',
        result: 'PASS',
        issues: JSON.stringify([]),
        metrics: JSON.stringify({
          min_dpi: 300,
          expected_ink_g: 3.1,
          color_count: 3,
          complexity_score: 8.5,
          print_quality_score: 9.2
        })
      },
      {
        id: uuidv4(),
        asset_id: designAsset2.id,
        version: 1,
        method: 'DTF',
        result: 'PASS',
        issues: JSON.stringify([]),
        metrics: JSON.stringify({
          min_dpi: 300,
          expected_ink_g: 8.7,
          white_ink_coverage: 45.2,
          durability_score: 8.8
        })
      }
    ]
  })

  console.log(`✅ Created demo design assets: ${designAsset1.name}, ${designAsset2.name}`)

  // Create employees
  const employees = await prisma.employee.createMany({
    data: [
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        employee_number: 'EMP-001',
        first_name: 'Juan',
        last_name: 'Dela Cruz',
        position: 'Cutting Operator',
        department: 'Cutting',
        hire_date: new Date('2023-01-15'),
        salary_type: 'daily',
        base_salary: 650.00
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        employee_number: 'EMP-002',
        first_name: 'Maria',
        last_name: 'Garcia',
        position: 'Sewing Machine Operator',
        department: 'Sewing',
        hire_date: new Date('2023-02-01'),
        salary_type: 'piece_rate',
        piece_rate: 15.00
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        employee_number: 'EMP-003',
        first_name: 'Roberto',
        last_name: 'Reyes',
        position: 'Screen Printer',
        department: 'Printing',
        hire_date: new Date('2023-01-20'),
        salary_type: 'daily',
        base_salary: 750.00
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        employee_number: 'EMP-004',
        first_name: 'Ana',
        last_name: 'Villanueva',
        position: 'Quality Inspector',
        department: 'QC',
        hire_date: new Date('2023-03-01'),
        salary_type: 'monthly',
        base_salary: 25000.00
      }
    ]
  })

  console.log(`✅ Created ${employees.count} demo employees`)

  // Create assets (machines and vehicles)
  const assets = await prisma.asset.createMany({
    data: [
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        name: 'Brother Industrial Sewing Machine',
        asset_number: 'MACH-001',
        type: 'machine',
        category: 'Sewing Equipment',
        location: 'Production Floor A',
        purchase_date: new Date('2022-06-15'),
        purchase_cost: 85000.00,
        status: 'active'
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        name: 'Screen Printing Press - 6 Color',
        asset_number: 'MACH-002',
        type: 'machine',
        category: 'Printing Equipment',
        location: 'Printing Room',
        purchase_date: new Date('2022-08-20'),
        purchase_cost: 250000.00,
        status: 'active'
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        name: 'Delivery Truck - Hyundai H100',
        asset_number: 'VEH-001',
        type: 'vehicle',
        category: 'Delivery Vehicle',
        location: 'Parking Area',
        purchase_date: new Date('2022-10-10'),
        purchase_cost: 800000.00,
        status: 'active'
      }
    ]
  })

  console.log(`✅ Created ${assets.count} demo assets`)

  // Create routing templates
  const silkscreenTemplate = await prisma.routingTemplate.create({
    data: {
      id: uuidv4(),
      workspace_id: workspace.id,
      name: 'Standard Silkscreen Process',
      description: 'Standard routing for silkscreen printed garments',
      printing_method: 'silkscreen'
    }
  })

  await prisma.routingTemplateStep.createMany({
    data: [
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        routing_template_id: silkscreenTemplate.id,
        step_name: 'Order Processing',
        step_order: 1,
        department: 'Admin',
        estimated_hours: 0.5,
        requires_qc: false
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        routing_template_id: silkscreenTemplate.id,
        step_name: 'Fabric Cutting',
        step_order: 2,
        department: 'Cutting',
        estimated_hours: 2.0,
        requires_qc: true
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        routing_template_id: silkscreenTemplate.id,
        step_name: 'Screen Printing',
        step_order: 3,
        department: 'Printing',
        estimated_hours: 4.0,
        requires_qc: true
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        routing_template_id: silkscreenTemplate.id,
        step_name: 'Sewing',
        step_order: 4,
        department: 'Sewing',
        estimated_hours: 8.0,
        requires_qc: false
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        routing_template_id: silkscreenTemplate.id,
        step_name: 'Quality Control',
        step_order: 5,
        department: 'QC',
        estimated_hours: 1.0,
        requires_qc: false
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        routing_template_id: silkscreenTemplate.id,
        step_name: 'Finishing & Packing',
        step_order: 6,
        department: 'Finishing',
        estimated_hours: 2.0,
        requires_qc: true
      }
    ]
  })

  console.log(`✅ Created routing template: ${silkscreenTemplate.name}`)

  // ===== STAGE 3: CUTTING DATA =====
  
  // Create fabric batches
  const fabricBatch1 = await prisma.fabricBatch.create({
    data: {
      id: uuidv4(),
      workspace_id: workspace.id,
      brand_id: brand1.id,
      lot_no: 'TCAS-LOT-001',
      uom: 'KG',
      qty_on_hand: 45.5,
      gsm: 280,
      width_cm: 160,
      received_at: new Date()
    }
  })

  const fabricBatch2 = await prisma.fabricBatch.create({
    data: {
      id: uuidv4(),
      workspace_id: workspace.id,
      brand_id: brand3.id,
      lot_no: 'URBN-LOT-001',
      uom: 'M',
      qty_on_hand: 120.0,
      gsm: 180,
      width_cm: 150,
      received_at: new Date()
    }
  })

  console.log(`✅ Created fabric batches: ${fabricBatch1.lot_no}, ${fabricBatch2.lot_no}`)

  // Create cut issues
  const cutIssue1 = await prisma.cutIssue.create({
    data: {
      id: uuidv4(),
      workspace_id: workspace.id,
      order_id: order1.id,
      batch_id: fabricBatch1.id,
      qty_issued: 15.2,
      uom: 'KG',
      issued_by: adminUser.id
    }
  })

  console.log(`✅ Created fabric issue: ${cutIssue1.id}`)

  // Create cut lay
  const cutLay1 = await prisma.cutLay.create({
    data: {
      id: uuidv4(),
      workspace_id: workspace.id,
      order_id: order1.id,
      marker_name: 'Hoodie Marker V2',
      marker_width_cm: 160,
      lay_length_m: 25.5,
      plies: 12,
      gross_used: 15.0,
      offcuts: 0.8,
      defects: 0.2,
      uom: 'KG',
      created_by: adminUser.id
    }
  })

  // Create cut outputs for the lay
  await prisma.cutOutput.createMany({
    data: [
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        cut_lay_id: cutLay1.id,
        size_code: 'M',
        qty: 48
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        cut_lay_id: cutLay1.id,
        size_code: 'L',
        qty: 48
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        cut_lay_id: cutLay1.id,
        size_code: 'XL',
        qty: 24
      }
    ]
  })

  console.log(`✅ Created cut lay with outputs: ${cutLay1.marker_name}`)

  // Create bundles from the lay
  const bundles = await prisma.bundle.createMany({
    data: [
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        order_id: order1.id,
        size_code: 'M',
        qty: 20,
        lay_id: cutLay1.id,
        qr_code: 'ash://bundle/TCAS-M-001',
        status: 'CREATED'
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        order_id: order1.id,
        size_code: 'M',
        qty: 20,
        lay_id: cutLay1.id,
        qr_code: 'ash://bundle/TCAS-M-002',
        status: 'CREATED'
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        order_id: order1.id,
        size_code: 'M',
        qty: 8,
        lay_id: cutLay1.id,
        qr_code: 'ash://bundle/TCAS-M-003',
        status: 'CREATED'
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        order_id: order1.id,
        size_code: 'L',
        qty: 20,
        lay_id: cutLay1.id,
        qr_code: 'ash://bundle/TCAS-L-001',
        status: 'IN_SEWING'
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        order_id: order1.id,
        size_code: 'L',
        qty: 20,
        lay_id: cutLay1.id,
        qr_code: 'ash://bundle/TCAS-L-002',
        status: 'CREATED'
      },
      {
        id: uuidv4(),
        workspace_id: workspace.id,
        order_id: order1.id,
        size_code: 'XL',
        qty: 20,
        lay_id: cutLay1.id,
        qr_code: 'ash://bundle/TCAS-XL-001',
        status: 'DONE'
      }
    ]
  })

  console.log(`✅ Created ${bundles.count} bundles from cut lay`)

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })