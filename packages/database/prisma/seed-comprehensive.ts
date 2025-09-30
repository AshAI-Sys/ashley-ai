import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const WORKSPACE_ID = 'demo-workspace-1'

// Helper function to generate random dates
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper function to add days to date
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

async function main() {
  console.log('🌱 Starting comprehensive database seed...\n')

  // ============================================
  // WORKSPACE & USER
  // ============================================
  console.log('📁 Creating workspace and users...')

  const workspace = await prisma.workspace.upsert({
    where: { slug: 'demo-workspace' },
    update: {},
    create: {
      id: WORKSPACE_ID,
      name: 'Ashley AI Manufacturing',
      slug: 'demo-workspace',
      is_active: true,
    },
  })

  const adminUser = await prisma.user.upsert({
    where: {
      workspace_id_email: {
        workspace_id: WORKSPACE_ID,
        email: 'admin@ashleyai.com'
      }
    },
    update: {},
    create: {
      email: 'admin@ashleyai.com',
      password_hash: '$2a$10$demoHashForDevelopment',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      workspace_id: WORKSPACE_ID,
      position: 'System Administrator',
      department: 'IT',
      is_active: true,
    },
  })
  console.log('✅ Workspace and admin user created\n')

  // ============================================
  // STAGE 1: CLIENTS & BRANDS
  // ============================================
  console.log('👥 Stage 1: Creating clients and brands...')

  const clients = await Promise.all([
    prisma.client.create({
      data: {
        workspace_id: WORKSPACE_ID,
        name: 'Manila Shirts Co.',
        contact_person: 'Juan Dela Cruz',
        email: 'orders@manilashirts.com',
        phone: '+63 917 123 4567',
        address: JSON.stringify({
          street: '123 Quezon Avenue',
          city: 'Manila',
          state: 'Metro Manila',
          postal_code: '1100',
          country: 'Philippines'
        }),
        tax_id: 'TIN-123-456-789',
        payment_terms: 30,
        credit_limit: 500000,
        is_active: true,
      },
    }),
    prisma.client.create({
      data: {
        workspace_id: WORKSPACE_ID,
        name: 'Cebu Sports Apparel',
        contact_person: 'Maria Santos',
        email: 'procurement@cebusports.ph',
        phone: '+63 932 987 6543',
        address: JSON.stringify({
          street: '456 Osmeña Boulevard',
          city: 'Cebu City',
          state: 'Cebu',
          postal_code: '6000',
          country: 'Philippines'
        }),
        tax_id: 'TIN-987-654-321',
        payment_terms: 45,
        credit_limit: 750000,
        is_active: true,
      },
    }),
    prisma.client.create({
      data: {
        workspace_id: WORKSPACE_ID,
        name: 'Davao Uniform Solutions',
        contact_person: 'Pedro Ramos',
        email: 'info@davaouniform.com',
        phone: '+63 912 345 6789',
        address: JSON.stringify({
          street: '789 J.P. Laurel Avenue',
          city: 'Davao City',
          state: 'Davao del Sur',
          postal_code: '8000',
          country: 'Philippines'
        }),
        tax_id: 'TIN-555-666-777',
        payment_terms: 60,
        credit_limit: 1000000,
        is_active: true,
      },
    }),
    prisma.client.create({
      data: {
        workspace_id: WORKSPACE_ID,
        name: 'BGC Corporate Wear',
        contact_person: 'Ana Reyes',
        email: 'supplier@bgccorp.com',
        phone: '+63 928 111 2222',
        address: JSON.stringify({
          street: '5th Ave, BGC',
          city: 'Taguig',
          state: 'Metro Manila',
          postal_code: '1634',
          country: 'Philippines'
        }),
        tax_id: 'TIN-888-999-000',
        payment_terms: 15,
        credit_limit: 300000,
        is_active: true,
      },
    }),
    prisma.client.create({
      data: {
        workspace_id: WORKSPACE_ID,
        name: 'Island Fashion Group',
        contact_person: 'Carlos Tan',
        email: 'orders@islandfashion.ph',
        phone: '+63 945 777 8888',
        address: JSON.stringify({
          street: '101 Ayala Avenue',
          city: 'Makati',
          state: 'Metro Manila',
          postal_code: '1200',
          country: 'Philippines'
        }),
        tax_id: 'TIN-222-333-444',
        payment_terms: 30,
        credit_limit: 600000,
        is_active: true,
      },
    }),
  ])

  const brands = await Promise.all([
    prisma.brand.create({
      data: {
        workspace_id: WORKSPACE_ID,
        client_id: clients[0].id,
        name: 'Manila Classic',
        code: 'MNLC',
        is_active: true,
      },
    }),
    prisma.brand.create({
      data: {
        workspace_id: WORKSPACE_ID,
        client_id: clients[0].id,
        name: 'Manila Pro',
        code: 'MNLP',
        is_active: true,
      },
    }),
    prisma.brand.create({
      data: {
        workspace_id: WORKSPACE_ID,
        client_id: clients[1].id,
        name: 'Cebu Athletes',
        code: 'CBAT',
        is_active: true,
      },
    }),
    prisma.brand.create({
      data: {
        workspace_id: WORKSPACE_ID,
        client_id: clients[2].id,
        name: 'Davao Elite',
        code: 'DVEL',
        is_active: true,
      },
    }),
    prisma.brand.create({
      data: {
        workspace_id: WORKSPACE_ID,
        client_id: clients[3].id,
        name: 'BGC Executive',
        code: 'BGCE',
        is_active: true,
      },
    }),
    prisma.brand.create({
      data: {
        workspace_id: WORKSPACE_ID,
        client_id: clients[4].id,
        name: 'Island Style',
        code: 'ISST',
        is_active: true,
      },
    }),
  ])
  console.log(`✅ Created ${clients.length} clients and ${brands.length} brands\n`)

  // ============================================
  // STAGE 10: EMPLOYEES (needed for production)
  // ============================================
  console.log('👷 Stage 10: Creating employees...')

  const employees = await Promise.all([
    // Cutting operators
    prisma.employee.create({
      data: {
        workspace_id: WORKSPACE_ID,
        employee_number: 'EMP-001',
        first_name: 'Jose',
        last_name: 'Cruz',
        email: 'jose.cruz@ashleyai.com',
        password_hash: '$2a$10$demoHashForDevelopment',
        role: 'operator',
        position: 'Cutting Operator',
        department: 'Cutting',
        hire_date: new Date('2023-01-15'),
        salary_type: 'DAILY',
        base_salary: 600,
        is_active: true,
      },
    }),
    prisma.employee.create({
      data: {
        workspace_id: WORKSPACE_ID,
        employee_number: 'EMP-002',
        first_name: 'Maria',
        last_name: 'Lopez',
        email: 'maria.lopez@ashleyai.com',
        password_hash: '$2a$10$demoHashForDevelopment',
        role: 'supervisor',
        position: 'Cutting Supervisor',
        department: 'Cutting',
        hire_date: new Date('2022-06-01'),
        salary_type: 'MONTHLY',
        base_salary: 25000,
        is_active: true,
      },
    }),
    // Sewing operators
    prisma.employee.create({
      data: {
        workspace_id: WORKSPACE_ID,
        employee_number: 'EMP-003',
        first_name: 'Ana',
        last_name: 'Garcia',
        email: 'ana.garcia@ashleyai.com',
        password_hash: '$2a$10$demoHashForDevelopment',
        role: 'operator',
        position: 'Sewing Operator',
        department: 'Sewing',
        hire_date: new Date('2023-03-20'),
        salary_type: 'PIECE',
        base_salary: 0,
        piece_rate: 12.50,
        is_active: true,
      },
    }),
    prisma.employee.create({
      data: {
        workspace_id: WORKSPACE_ID,
        employee_number: 'EMP-004',
        first_name: 'Rosa',
        last_name: 'Mendoza',
        email: 'rosa.mendoza@ashleyai.com',
        password_hash: '$2a$10$demoHashForDevelopment',
        role: 'operator',
        position: 'Sewing Operator',
        department: 'Sewing',
        hire_date: new Date('2022-11-10'),
        salary_type: 'PIECE',
        base_salary: 0,
        piece_rate: 12.50,
        is_active: true,
      },
    }),
    // QC inspectors
    prisma.employee.create({
      data: {
        workspace_id: WORKSPACE_ID,
        employee_number: 'EMP-005',
        first_name: 'Pedro',
        last_name: 'Santos',
        email: 'pedro.santos@ashleyai.com',
        password_hash: '$2a$10$demoHashForDevelopment',
        role: 'employee',
        position: 'QC Inspector',
        department: 'Quality Control',
        hire_date: new Date('2023-02-01'),
        salary_type: 'DAILY',
        base_salary: 650,
        is_active: true,
      },
    }),
    // Warehouse staff
    prisma.employee.create({
      data: {
        workspace_id: WORKSPACE_ID,
        employee_number: 'EMP-006',
        first_name: 'Juan',
        last_name: 'Reyes',
        email: 'juan.reyes@ashleyai.com',
        password_hash: '$2a$10$demoHashForDevelopment',
        role: 'employee',
        position: 'Warehouse Staff',
        department: 'Warehouse',
        hire_date: new Date('2023-05-15'),
        salary_type: 'DAILY',
        base_salary: 580,
        is_active: true,
      },
    }),
    // Printing operators
    prisma.employee.create({
      data: {
        workspace_id: WORKSPACE_ID,
        employee_number: 'EMP-007',
        first_name: 'Luis',
        last_name: 'Fernandez',
        email: 'luis.fernandez@ashleyai.com',
        password_hash: '$2a$10$demoHashForDevelopment',
        role: 'operator',
        position: 'Printing Operator',
        department: 'Printing',
        hire_date: new Date('2023-04-10'),
        salary_type: 'HOURLY',
        base_salary: 85,
        is_active: true,
      },
    }),
    prisma.employee.create({
      data: {
        workspace_id: WORKSPACE_ID,
        employee_number: 'EMP-008',
        first_name: 'Carmen',
        last_name: 'Torres',
        email: 'carmen.torres@ashleyai.com',
        password_hash: '$2a$10$demoHashForDevelopment',
        role: 'employee',
        position: 'Embroidery Specialist',
        department: 'Printing',
        hire_date: new Date('2022-09-01'),
        salary_type: 'HOURLY',
        base_salary: 95,
        is_active: true,
      },
    }),
  ])
  console.log(`✅ Created ${employees.length} employees\n`)

  // ============================================
  // ORDERS WITH VARIOUS STATUSES
  // ============================================
  console.log('📦 Stage 1: Creating orders at various stages...')

  const now = new Date()
  const orders = await Promise.all([
    // Order 1: In Production (full workflow)
    prisma.order.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_number: 'ORD-2024-001',
        client_id: clients[0].id,
        brand_id: brands[0].id,
        total_amount: 125000,
        currency: 'PHP',
        status: 'in_production',
        delivery_date: addDays(now, 30),
        notes: 'Cotton crew neck t-shirts with custom print - Rush order',
      },
    }),
    // Order 2: Pending Approval
    prisma.order.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_number: 'ORD-2024-002',
        client_id: clients[1].id,
        brand_id: brands[2].id,
        total_amount: 89500,
        currency: 'PHP',
        status: 'pending_approval',
        delivery_date: addDays(now, 45),
        notes: 'Polo shirts with embroidered logo',
      },
    }),
    // Order 3: Completed
    prisma.order.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_number: 'ORD-2024-003',
        client_id: clients[2].id,
        brand_id: brands[3].id,
        total_amount: 67500,
        currency: 'PHP',
        status: 'completed',
        delivery_date: addDays(now, -5),
        notes: 'Custom printed hoodies - Delivered',
      },
    }),
    // Order 4: Draft
    prisma.order.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_number: 'ORD-2024-004',
        client_id: clients[3].id,
        brand_id: brands[4].id,
        total_amount: 45000,
        currency: 'PHP',
        status: 'draft',
        delivery_date: addDays(now, 60),
        notes: 'Corporate uniforms - Pending approval',
      },
    }),
    // Order 5: In Cutting
    prisma.order.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_number: 'ORD-2024-005',
        client_id: clients[4].id,
        brand_id: brands[5].id,
        total_amount: 98000,
        currency: 'PHP',
        status: 'in_production',
        delivery_date: addDays(now, 40),
        notes: 'Sports jerseys with sublimation print',
      },
    }),
    // Order 6: Ready for QC
    prisma.order.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_number: 'ORD-2024-006',
        client_id: clients[0].id,
        brand_id: brands[1].id,
        total_amount: 156000,
        currency: 'PHP',
        status: 'in_production',
        delivery_date: addDays(now, 25),
        notes: 'Premium polo shirts - High priority',
      },
    }),
    // Order 7: In Sewing
    prisma.order.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_number: 'ORD-2024-007',
        client_id: clients[1].id,
        brand_id: brands[2].id,
        total_amount: 72000,
        currency: 'PHP',
        status: 'in_production',
        delivery_date: addDays(now, 35),
        notes: 'Athletic wear with DTF printing',
      },
    }),
    // Order 8: Confirmed
    prisma.order.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_number: 'ORD-2024-008',
        client_id: clients[2].id,
        brand_id: brands[3].id,
        total_amount: 118000,
        currency: 'PHP',
        status: 'confirmed',
        delivery_date: addDays(now, 50),
        notes: 'School uniforms - Bulk order',
      },
    }),
  ])
  console.log(`✅ Created ${orders.length} orders\n`)

  // ============================================
  // ORDER LINE ITEMS
  // ============================================
  console.log('📋 Creating order line items...')

  await Promise.all([
    // Order 1 line items
    prisma.orderLineItem.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_id: orders[0].id,
        sku: 'MNLC-TS-001',
        garment_type: 'Crew Neck T-Shirt',
        description: 'Premium cotton, custom print on front and back',
        quantity: 500,
        unit_price: 250,
        total_price: 125000,
        printing_method: 'SILKSCREEN',
        size_breakdown: JSON.stringify({ XS: 50, S: 100, M: 150, L: 120, XL: 50, XXL: 30 }),
      },
    }),
    // Order 2 line items
    prisma.orderLineItem.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_id: orders[1].id,
        sku: 'CBAT-POLO-001',
        garment_type: 'Polo Shirt',
        description: 'Pique fabric, embroidered logo on chest',
        quantity: 300,
        unit_price: 298.33,
        total_price: 89500,
        printing_method: 'EMBROIDERY',
        size_breakdown: JSON.stringify({ S: 60, M: 100, L: 80, XL: 40, XXL: 20 }),
      },
    }),
    // Order 3 line items
    prisma.orderLineItem.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_id: orders[2].id,
        sku: 'DVEL-HOOD-001',
        garment_type: 'Hoodie',
        description: 'Fleece material, custom printed design',
        quantity: 200,
        unit_price: 337.50,
        total_price: 67500,
        printing_method: 'DTF',
        size_breakdown: JSON.stringify({ S: 40, M: 70, L: 50, XL: 30, XXL: 10 }),
      },
    }),
  ])
  console.log('✅ Order line items created\n')

  // ============================================
  // STAGE 2: DESIGN ASSETS & APPROVALS
  // ============================================
  console.log('🎨 Stage 2: Creating design assets and approvals...')

  const designs = await Promise.all([
    prisma.designAsset.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_id: orders[0].id,
        design_number: 'DSN-2024-001',
        title: 'Manila Classic Brand Logo',
        file_url: 'https://example.com/designs/mnlc-logo.ai',
        file_type: 'vector',
        print_method: 'SILKSCREEN',
        placement: JSON.stringify({ front: 'center_chest', back: 'full_back' }),
        colors: JSON.stringify(['#FF0000', '#FFFFFF', '#000000']),
        approval_status: 'APPROVED',
      },
    }),
    prisma.designAsset.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_id: orders[1].id,
        design_number: 'DSN-2024-002',
        title: 'Cebu Athletes Embroidery',
        file_url: 'https://example.com/designs/cebu-embroidery.dst',
        file_type: 'embroidery',
        print_method: 'EMBROIDERY',
        placement: JSON.stringify({ front: 'left_chest' }),
        colors: JSON.stringify(['#0000FF', '#FFD700']),
        approval_status: 'PENDING',
      },
    }),
    prisma.designAsset.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_id: orders[4].id,
        design_number: 'DSN-2024-003',
        title: 'Sports Jersey Full Print',
        file_url: 'https://example.com/designs/jersey-sublimation.png',
        file_type: 'raster',
        print_method: 'SUBLIMATION',
        placement: JSON.stringify({ front: 'all_over', back: 'all_over' }),
        colors: JSON.stringify(['#00FF00', '#FFFF00', '#000000']),
        approval_status: 'APPROVED',
      },
    }),
  ])
  console.log(`✅ Created ${designs.length} design assets\n`)

  // ============================================
  // STAGE 3: CUTTING OPERATIONS
  // ============================================
  console.log('✂️ Stage 3: Creating cutting operations...')

  // Fabric batches
  const fabricBatches = await Promise.all([
    prisma.fabricBatch.create({
      data: {
        workspace_id: WORKSPACE_ID,
        lot_no: 'FAB-COTTON-001',
        supplier: 'Manila Textile Mills',
        fabric_type: 'Cotton Jersey',
        color: 'White',
        gsm: 180,
        width_inches: 60,
        qty_on_hand: 500,
        unit_of_measure: 'yards',
        cost_per_unit: 85,
      },
    }),
    prisma.fabricBatch.create({
      data: {
        workspace_id: WORKSPACE_ID,
        lot_no: 'FAB-PIQUE-001',
        supplier: 'Cebu Fabric Co.',
        fabric_type: 'Pique Cotton',
        color: 'Navy Blue',
        gsm: 220,
        width_inches: 58,
        qty_on_hand: 350,
        unit_of_measure: 'yards',
        cost_per_unit: 95,
      },
    }),
    prisma.fabricBatch.create({
      data: {
        workspace_id: WORKSPACE_ID,
        lot_no: 'FAB-FLEECE-001',
        supplier: 'Davao Textiles',
        fabric_type: 'Fleece',
        color: 'Gray',
        gsm: 280,
        width_inches: 62,
        qty_on_hand: 280,
        unit_of_measure: 'yards',
        cost_per_unit: 125,
      },
    }),
  ])

  // Cut lays
  const cutLays = await Promise.all([
    prisma.cutLay.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_id: orders[0].id,
        fabric_batch_id: fabricBatches[0].id,
        lay_number: 'LAY-001',
        marker_length: 4.5,
        marker_width: 60,
        no_of_plies: 50,
        gross_used: 225,
        offcuts: 15,
        defects: 5,
        net_used: 205,
        efficiency_pct: 91.11,
      },
    }),
    prisma.cutLay.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_id: orders[4].id,
        fabric_batch_id: fabricBatches[1].id,
        lay_number: 'LAY-002',
        marker_length: 3.8,
        marker_width: 58,
        no_of_plies: 40,
        gross_used: 152,
        offcuts: 10,
        defects: 3,
        net_used: 139,
        efficiency_pct: 91.45,
      },
    }),
  ])

  // Bundles with QR codes
  const bundles = await Promise.all([
    prisma.bundle.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_id: orders[0].id,
        cut_lay_id: cutLays[0].id,
        bundle_number: 'BDL-001',
        qr_code: 'QR-BDL-001-2024',
        size: 'M',
        quantity: 50,
        status: 'IN_SEWING',
      },
    }),
    prisma.bundle.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_id: orders[0].id,
        cut_lay_id: cutLays[0].id,
        bundle_number: 'BDL-002',
        qr_code: 'QR-BDL-002-2024',
        size: 'L',
        quantity: 50,
        status: 'IN_PRINTING',
      },
    }),
    prisma.bundle.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_id: orders[0].id,
        cut_lay_id: cutLays[0].id,
        bundle_number: 'BDL-003',
        qr_code: 'QR-BDL-003-2024',
        size: 'S',
        quantity: 50,
        status: 'CUT',
      },
    }),
  ])
  console.log(`✅ Created ${fabricBatches.length} fabric batches, ${cutLays.length} cut lays, ${bundles.length} bundles\n`)

  // ============================================
  // STAGE 4: PRINTING OPERATIONS
  // ============================================
  console.log('🖨️ Stage 4: Creating printing operations...')

  const machines = await Promise.all([
    prisma.machine.create({
      data: {
        workspace_id: WORKSPACE_ID,
        name: 'Silkscreen Press 1',
        machine_type: 'SILKSCREEN_PRESS',
        model: 'SP-6000',
        serial_number: 'SP-6000-001',
        status: 'OPERATIONAL',
      },
    }),
    prisma.machine.create({
      data: {
        workspace_id: WORKSPACE_ID,
        name: 'Embroidery Machine 1',
        machine_type: 'EMBROIDERY',
        model: 'EMB-12H',
        serial_number: 'EMB-12H-001',
        status: 'OPERATIONAL',
      },
    }),
    prisma.machine.create({
      data: {
        workspace_id: WORKSPACE_ID,
        name: 'DTF Printer 1',
        machine_type: 'DTF_PRINTER',
        model: 'DTF-PRO-60',
        serial_number: 'DTF-PRO-60-001',
        status: 'OPERATIONAL',
      },
    }),
  ])

  const printRuns = await Promise.all([
    prisma.printRun.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_id: orders[0].id,
        run_number: 'PRT-001',
        print_method: 'SILKSCREEN',
        machine_id: machines[0].id,
        operator_id: employees[6].id,
        qty_input: 150,
        qty_good: 145,
        qty_reject: 5,
        status: 'COMPLETED',
        started_at: addDays(now, -5),
        completed_at: addDays(now, -4),
      },
    }),
    prisma.printRun.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_id: orders[1].id,
        run_number: 'PRT-002',
        print_method: 'EMBROIDERY',
        machine_id: machines[1].id,
        operator_id: employees[7].id,
        qty_input: 100,
        qty_good: 95,
        qty_reject: 5,
        status: 'IN_PROGRESS',
        started_at: addDays(now, -2),
      },
    }),
  ])
  console.log(`✅ Created ${machines.length} machines, ${printRuns.length} print runs\n`)

  // ============================================
  // STAGE 5: SEWING OPERATIONS
  // ============================================
  console.log('🧵 Stage 5: Creating sewing operations...')

  const sewingOps = await Promise.all([
    prisma.sewingOperation.create({
      data: {
        workspace_id: WORKSPACE_ID,
        operation_name: 'Attach Sleeves',
        operation_code: 'SEW-001',
        product_type: 'T-Shirt',
        smv: 0.8,
        description: 'Attach both sleeves to body',
        machine_type: 'Overlock',
      },
    }),
    prisma.sewingOperation.create({
      data: {
        workspace_id: WORKSPACE_ID,
        operation_name: 'Hem Bottom',
        operation_code: 'SEW-002',
        product_type: 'T-Shirt',
        smv: 0.5,
        description: 'Hem bottom of garment',
        machine_type: 'Coverstitch',
      },
    }),
    prisma.sewingOperation.create({
      data: {
        workspace_id: WORKSPACE_ID,
        operation_name: 'Attach Collar',
        operation_code: 'SEW-003',
        product_type: 'Polo',
        smv: 1.2,
        description: 'Attach collar to neckline',
        machine_type: 'Single Needle',
      },
    }),
  ])

  const sewingRuns = await Promise.all([
    prisma.sewingRun.create({
      data: {
        workspace_id: WORKSPACE_ID,
        bundle_id: bundles[0].id,
        operation_id: sewingOps[0].id,
        operator_id: employees[2].id,
        qty_input: 50,
        qty_good: 48,
        qty_reject: 2,
        actual_minutes: 45,
        earned_minutes: 38.4,
        efficiency_pct: 85.33,
        completed_at: addDays(now, -3),
      },
    }),
    prisma.sewingRun.create({
      data: {
        workspace_id: WORKSPACE_ID,
        bundle_id: bundles[0].id,
        operation_id: sewingOps[1].id,
        operator_id: employees[3].id,
        qty_input: 48,
        qty_good: 47,
        qty_reject: 1,
        actual_minutes: 28,
        earned_minutes: 23.5,
        efficiency_pct: 83.93,
        completed_at: addDays(now, -2),
      },
    }),
  ])
  console.log(`✅ Created ${sewingOps.length} sewing operations, ${sewingRuns.length} sewing runs\n`)

  // ============================================
  // STAGE 6: QUALITY CONTROL
  // ============================================
  console.log('✔️ Stage 6: Creating QC inspections...')

  const defectCodes = await Promise.all([
    prisma.qCDefectCode.create({
      data: {
        workspace_id: WORKSPACE_ID,
        code: 'DEF-001',
        name: 'Loose Thread',
        category: 'STITCHING',
        severity: 'MINOR',
        description: 'Thread not properly trimmed',
      },
    }),
    prisma.qCDefectCode.create({
      data: {
        workspace_id: WORKSPACE_ID,
        code: 'DEF-002',
        name: 'Skipped Stitch',
        category: 'STITCHING',
        severity: 'MAJOR',
        description: 'Missing stitches in seam',
      },
    }),
    prisma.qCDefectCode.create({
      data: {
        workspace_id: WORKSPACE_ID,
        code: 'DEF-003',
        name: 'Print Misalignment',
        category: 'PRINTING',
        severity: 'CRITICAL',
        description: 'Print not aligned correctly',
      },
    }),
  ])

  const qcInspections = await Promise.all([
    prisma.qCInspection.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_id: orders[0].id,
        inspection_number: 'QC-001',
        inspection_type: 'FINAL',
        inspector_id: employees[4].id,
        lot_size: 145,
        sample_size: 32,
        accept_number: 2,
        reject_number: 3,
        defects_found: 1,
        result: 'PASS',
        inspection_date: addDays(now, -1),
      },
    }),
    prisma.qCInspection.create({
      data: {
        workspace_id: WORKSPACE_ID,
        order_id: orders[1].id,
        inspection_number: 'QC-002',
        inspection_type: 'INLINE',
        inspector_id: employees[4].id,
        lot_size: 95,
        sample_size: 20,
        accept_number: 1,
        reject_number: 2,
        defects_found: 0,
        result: 'PASS',
        inspection_date: now,
      },
    }),
  ])
  console.log(`✅ Created ${defectCodes.length} defect codes, ${qcInspections.length} QC inspections\n`)

  // ============================================
  // STAGE 9: FINANCE
  // ============================================
  console.log('💰 Stage 9: Creating financial records...')

  const invoices = await Promise.all([
    prisma.invoice.create({
      data: {
        workspace_id: WORKSPACE_ID,
        invoice_number: 'INV-2024-001',
        order_id: orders[2].id,
        client_id: clients[2].id,
        invoice_date: addDays(now, -10),
        due_date: addDays(now, 20),
        subtotal: 60267.86,
        tax_amount: 7232.14,
        total_amount: 67500,
        tax_mode: 'VAT_INCLUSIVE',
        status: 'PAID',
        currency: 'PHP',
      },
    }),
    prisma.invoice.create({
      data: {
        workspace_id: WORKSPACE_ID,
        invoice_number: 'INV-2024-002',
        order_id: orders[0].id,
        client_id: clients[0].id,
        invoice_date: addDays(now, -3),
        due_date: addDays(now, 27),
        subtotal: 111607.14,
        tax_amount: 13392.86,
        total_amount: 125000,
        tax_mode: 'VAT_INCLUSIVE',
        status: 'PENDING',
        currency: 'PHP',
      },
    }),
  ])

  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        workspace_id: WORKSPACE_ID,
        invoice_id: invoices[0].id,
        payment_number: 'PAY-2024-001',
        payment_date: addDays(now, -8),
        amount: 67500,
        payment_method: 'BANK_TRANSFER',
        reference_number: 'BT-20241215-001',
        status: 'COMPLETED',
        currency: 'PHP',
      },
    }),
  ])

  const expenses = await Promise.all([
    prisma.expense.create({
      data: {
        workspace_id: WORKSPACE_ID,
        expense_number: 'EXP-2024-001',
        description: 'Fabric purchase - Cotton jersey',
        amount: 42500,
        expense_date: addDays(now, -15),
        category: 'RAW_MATERIALS',
        payment_method: 'BANK_TRANSFER',
        status: 'APPROVED',
        currency: 'PHP',
      },
    }),
    prisma.expense.create({
      data: {
        workspace_id: WORKSPACE_ID,
        expense_number: 'EXP-2024-002',
        description: 'Machine maintenance - Embroidery',
        amount: 8500,
        expense_date: addDays(now, -7),
        category: 'MAINTENANCE',
        payment_method: 'CASH',
        status: 'APPROVED',
        currency: 'PHP',
      },
    }),
  ])
  console.log(`✅ Created ${invoices.length} invoices, ${payments.length} payments, ${expenses.length} expenses\n`)

  // ============================================
  // STAGE 11: MAINTENANCE
  // ============================================
  console.log('🔧 Stage 11: Creating assets and work orders...')

  const assets = await Promise.all([
    prisma.asset.create({
      data: {
        workspace_id: WORKSPACE_ID,
        name: 'Industrial Sewing Machine #1',
        asset_number: 'AST-001',
        type: 'PRODUCTION_EQUIPMENT',
        category: 'SEWING',
        location: 'Sewing Floor - Line 1',
        purchase_date: new Date('2023-01-15'),
        purchase_cost: 45000,
        status: 'OPERATIONAL',
      },
    }),
    prisma.asset.create({
      data: {
        workspace_id: WORKSPACE_ID,
        name: 'Cutting Table #2',
        asset_number: 'AST-002',
        type: 'PRODUCTION_EQUIPMENT',
        category: 'CUTTING',
        location: 'Cutting Department',
        purchase_date: new Date('2022-08-20'),
        purchase_cost: 28000,
        status: 'OPERATIONAL',
      },
    }),
    prisma.asset.create({
      data: {
        workspace_id: WORKSPACE_ID,
        name: 'Forklift #1',
        asset_number: 'AST-003',
        type: 'VEHICLE',
        category: 'WAREHOUSE',
        location: 'Warehouse',
        purchase_date: new Date('2021-05-10'),
        purchase_cost: 185000,
        status: 'OPERATIONAL',
      },
    }),
  ])

  const workOrders = await Promise.all([
    prisma.workOrder.create({
      data: {
        workspace_id: WORKSPACE_ID,
        work_order_number: 'WO-2024-001',
        asset_id: assets[0].id,
        title: 'Routine maintenance and oil change',
        description: 'Perform scheduled maintenance on sewing machine',
        type: 'PREVENTIVE',
        priority: 'MEDIUM',
        assigned_to_id: employees[5].id,
        status: 'COMPLETED',
        scheduled_date: addDays(now, -5),
        completed_date: addDays(now, -4),
      },
    }),
    prisma.workOrder.create({
      data: {
        workspace_id: WORKSPACE_ID,
        work_order_number: 'WO-2024-002',
        asset_id: assets[2].id,
        title: 'Replace worn tires',
        description: 'Forklift tires showing excessive wear',
        type: 'CORRECTIVE',
        priority: 'HIGH',
        assigned_to_id: employees[5].id,
        status: 'IN_PROGRESS',
        scheduled_date: now,
      },
    }),
  ])
  console.log(`✅ Created ${assets.length} assets, ${workOrders.length} work orders\n`)

  // ============================================
  // SUMMARY
  // ============================================
  console.log('📊 SEEDING SUMMARY')
  console.log('==================')
  console.log(`✅ Clients: ${clients.length}`)
  console.log(`✅ Brands: ${brands.length}`)
  console.log(`✅ Employees: ${employees.length}`)
  console.log(`✅ Orders: ${orders.length}`)
  console.log(`✅ Designs: ${designs.length}`)
  console.log(`✅ Fabric Batches: ${fabricBatches.length}`)
  console.log(`✅ Cut Lays: ${cutLays.length}`)
  console.log(`✅ Bundles: ${bundles.length}`)
  console.log(`✅ Machines: ${machines.length}`)
  console.log(`✅ Print Runs: ${printRuns.length}`)
  console.log(`✅ Sewing Operations: ${sewingOps.length}`)
  console.log(`✅ Sewing Runs: ${sewingRuns.length}`)
  console.log(`✅ QC Defect Codes: ${defectCodes.length}`)
  console.log(`✅ QC Inspections: ${qcInspections.length}`)
  console.log(`✅ Invoices: ${invoices.length}`)
  console.log(`✅ Payments: ${payments.length}`)
  console.log(`✅ Expenses: ${expenses.length}`)
  console.log(`✅ Assets: ${assets.length}`)
  console.log(`✅ Work Orders: ${workOrders.length}`)
  console.log('\n🎉 Comprehensive database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })