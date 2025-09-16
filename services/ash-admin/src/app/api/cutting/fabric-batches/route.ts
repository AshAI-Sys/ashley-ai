import { NextRequest, NextResponse } from 'next/server'

// Mock data - In production, this would come from your database
const mockFabricBatches = [
  {
    id: '1',
    lot_no: 'LOT-2025-001',
    uom: 'KG',
    qty_on_hand: 45.5,
    gsm: 280,
    width_cm: 160,
    color: 'Navy Blue',
    brand: { 
      id: '1',
      name: 'Trendy Casual', 
      code: 'TCAS' 
    },
    created_at: '2025-01-10T08:00:00Z',
    received_at: '2025-01-10T08:00:00Z',
    estimated_yield: 8.5 // pieces per KG
  },
  {
    id: '2',
    lot_no: 'LOT-2025-002',
    uom: 'M',
    qty_on_hand: 120.0,
    gsm: 180,
    width_cm: 150,
    color: 'White',
    brand: { 
      id: '2',
      name: 'Urban Streetwear', 
      code: 'URBN' 
    },
    created_at: '2025-01-09T14:30:00Z',
    received_at: '2025-01-09T14:30:00Z',
    estimated_yield: 2.8 // pieces per M
  },
  {
    id: '3',
    lot_no: 'LOT-2025-003',
    uom: 'KG',
    qty_on_hand: 28.3,
    gsm: 220,
    width_cm: 155,
    color: 'Black',
    brand: { 
      id: '1',
      name: 'Trendy Casual', 
      code: 'TCAS' 
    },
    created_at: '2025-01-08T11:15:00Z',
    received_at: '2025-01-08T11:15:00Z',
    estimated_yield: 7.2 // pieces per KG
  },
  {
    id: '4',
    lot_no: 'LOT-2025-004',
    uom: 'KG',
    qty_on_hand: 67.8,
    gsm: 320,
    width_cm: 165,
    color: 'Heather Grey',
    brand: { 
      id: '3',
      name: 'Premium Sports', 
      code: 'PREM' 
    },
    created_at: '2025-01-07T09:45:00Z',
    received_at: '2025-01-07T09:45:00Z',
    estimated_yield: 6.8 // pieces per KG
  }
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const brand_id = searchParams.get('brand_id')
    const search = searchParams.get('search')
    const min_qty = searchParams.get('min_qty')
    const uom_filter = searchParams.get('uom')
    
    let filteredBatches = [...mockFabricBatches]

    // Filter by brand if specified
    if (brand_id && brand_id !== 'all') {
      filteredBatches = filteredBatches.filter(batch => batch.brand.id === brand_id)
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase()
      filteredBatches = filteredBatches.filter(batch => 
        batch.lot_no.toLowerCase().includes(searchLower) ||
        batch.brand.name.toLowerCase().includes(searchLower) ||
        batch.color?.toLowerCase().includes(searchLower)
      )
    }

    // Filter by minimum quantity
    if (min_qty) {
      const minQuantity = parseFloat(min_qty)
      filteredBatches = filteredBatches.filter(batch => batch.qty_on_hand >= minQuantity)
    }

    // Filter by unit of measure
    if (uom_filter) {
      filteredBatches = filteredBatches.filter(batch => batch.uom === uom_filter)
    }

    // Sort by creation date (newest first)
    filteredBatches.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({
      success: true,
      data: filteredBatches,
      total: filteredBatches.length,
      filters_applied: {
        brand_id,
        search,
        min_qty,
        uom_filter
      }
    })

  } catch (error) {
    console.error('Error fetching fabric batches:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch fabric batches',
        data: []
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['lot_no', 'uom', 'qty_on_hand', 'brand_id']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          },
          { status: 400 }
        )
      }
    }

    // Validate UOM
    if (!['KG', 'M'].includes(body.uom)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid UOM. Must be KG or M' 
        },
        { status: 400 }
      )
    }

    // Validate quantity
    if (body.qty_on_hand <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Quantity on hand must be greater than 0' 
        },
        { status: 400 }
      )
    }

    // In production, save to database using Prisma
    const newBatch = {
      id: (mockFabricBatches.length + 1).toString(),
      lot_no: body.lot_no,
      uom: body.uom,
      qty_on_hand: parseFloat(body.qty_on_hand),
      gsm: body.gsm ? parseInt(body.gsm) : undefined,
      width_cm: body.width_cm ? parseInt(body.width_cm) : undefined,
      color: body.color,
      brand: {
        id: body.brand_id,
        name: body.brand_name || 'Unknown Brand',
        code: body.brand_code || 'UNK'
      },
      created_at: new Date().toISOString(),
      received_at: body.received_at || new Date().toISOString(),
      estimated_yield: calculateEstimatedYield(body.uom, body.gsm, body.width_cm)
    }

    // Add to mock data (in production, this would be a database insert)
    mockFabricBatches.push(newBatch)

    return NextResponse.json({
      success: true,
      data: newBatch,
      message: 'Fabric batch created successfully'
    })

  } catch (error) {
    console.error('Error creating fabric batch:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create fabric batch' 
      },
      { status: 500 }
    )
  }
}

function calculateEstimatedYield(uom: string, gsm?: number, width_cm?: number): number {
  // Ashley AI estimation logic
  const defaultGSM = gsm || 200
  const defaultWidth = width_cm || 150
  const averageGarmentArea = 2500 // cm² for medium garment
  
  if (uom === 'KG') {
    // kg to pieces conversion
    const areaPerKg = (1000 * 10000) / defaultGSM // cm² per kg
    return Math.round((areaPerKg / averageGarmentArea) * 100) / 100
  } else {
    // M to pieces conversion
    const areaPerM = defaultWidth * 100 // cm² per meter
    return Math.round((areaPerM / averageGarmentArea) * 100) / 100
  }
}