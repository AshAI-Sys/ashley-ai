import { NextRequest, NextResponse } from 'next/server'

// Mock data - In production, this would use Prisma to interact with the database
const mockCutIssues: any[] = []

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const order_id = searchParams.get('order_id')
    const batch_id = searchParams.get('batch_id')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')
    
    let filteredIssues = [...mockCutIssues]

    // Filter by order if specified
    if (order_id) {
      filteredIssues = filteredIssues.filter(issue => issue.order_id === order_id)
    }

    // Filter by batch if specified
    if (batch_id) {
      filteredIssues = filteredIssues.filter(issue => issue.batch_id === batch_id)
    }

    // Filter by date range
    if (start_date) {
      filteredIssues = filteredIssues.filter(issue => 
        new Date(issue.created_at) >= new Date(start_date)
      )
    }
    if (end_date) {
      filteredIssues = filteredIssues.filter(issue => 
        new Date(issue.created_at) <= new Date(end_date)
      )
    }

    // Sort by creation date (newest first)
    filteredIssues.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json({
      success: true,
      data: filteredIssues,
      total: filteredIssues.length
    })

  } catch (error) {
    console.error('Error fetching cut issues:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch cut issues',
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
    const requiredFields = ['order_id', 'batch_id', 'qty_issued', 'uom']
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

    // Validate quantity
    if (body.qty_issued <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Quantity issued must be greater than 0' 
        },
        { status: 400 }
      )
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

    // In production, you would:
    // 1. Check if batch has sufficient quantity
    // 2. Create CutIssue record using Prisma
    // 3. Update FabricBatch qty_on_hand
    // 4. Create MaterialTransaction record
    // 5. Generate Ashley AI analysis

    // Mock fabric batch lookup to validate available quantity
    const mockFabricBatch = {
      id: body.batch_id,
      lot_no: 'LOT-2025-001',
      qty_on_hand: 45.5,
      uom: body.uom
    }

    if (body.qty_issued > mockFabricBatch.qty_on_hand) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Insufficient fabric quantity. Available: ${mockFabricBatch.qty_on_hand} ${body.uom}` 
        },
        { status: 400 }
      )
    }

    // Create new cut issue record
    const newCutIssue = {
      id: (mockCutIssues.length + 1).toString(),
      workspace_id: 'ws_1', // Would come from auth context
      order_id: body.order_id,
      batch_id: body.batch_id,
      qty_issued: parseFloat(body.qty_issued),
      uom: body.uom,
      issued_by: body.issued_by || 'current_user', // Would come from auth context
      created_at: new Date().toISOString(),
      
      // Related data that would be fetched in production
      order: {
        order_number: 'TCAS-2025-000001',
        brand: { name: 'Trendy Casual', code: 'TCAS' }
      },
      batch: {
        lot_no: mockFabricBatch.lot_no,
        gsm: 280,
        width_cm: 160,
        color: 'Navy Blue'
      },
      
      // Ashley AI analysis
      ashley_analysis: {
        estimated_pieces: calculateEstimatedPieces(body.qty_issued, body.uom),
        efficiency_score: 85,
        recommendations: [
          'Optimal fabric usage for this order type',
          'Consider pre-shrinking fabric for better yield'
        ],
        risk_factors: [],
        utilization_forecast: 'Good'
      }
    }

    // Add to mock data
    mockCutIssues.push(newCutIssue)

    // In production: Update fabric batch quantity
    // await prisma.fabricBatch.update({
    //   where: { id: body.batch_id },
    //   data: {
    //     qty_on_hand: { decrement: body.qty_issued }
    //   }
    // })

    // In production: Create material transaction
    // await prisma.materialTransaction.create({
    //   data: {
    //     workspace_id: 'ws_1',
    //     material_inventory_id: body.batch_id,
    //     transaction_type: 'OUT',
    //     quantity: body.qty_issued,
    //     reference_type: 'ORDER',
    //     reference_id: body.order_id,
    //     notes: `Fabric issued to cutting for order ${body.order_id}`,
    //     created_by: 'current_user'
    //   }
    // })

    return NextResponse.json({
      success: true,
      data: newCutIssue,
      message: 'Fabric issued to cutting successfully',
      ashley_insights: newCutIssue.ashley_analysis
    })

  } catch (error) {
    console.error('Error creating cut issue:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to issue fabric to cutting' 
      },
      { status: 500 }
    )
  }
}

function calculateEstimatedPieces(quantity: number, uom: string): number {
  // Ashley AI estimation based on average garment requirements
  const averageGarmentWeight = 0.3 // kg for medium garment
  const averageGarmentLength = 0.8 // meters for medium garment
  
  if (uom === 'KG') {
    return Math.floor(quantity / averageGarmentWeight)
  } else {
    return Math.floor(quantity / averageGarmentLength)
  }
}