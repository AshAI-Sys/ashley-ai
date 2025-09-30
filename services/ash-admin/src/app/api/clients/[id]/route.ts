import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

// File-based storage for created clients (same as list endpoint)
const STORAGE_FILE = path.join(process.cwd(), '.next', 'created-clients.json')

// Demo clients data (same as list endpoint)
const demoClients = [
  {
    id: 'client-1',
    name: 'Manila Shirts Co.',
    company: 'Manila Shirts Corporation',
    email: 'orders@manilashirts.com',
    phone: '+63 917 123 4567',
    status: 'ACTIVE',
    createdAt: new Date('2024-01-15'),
    brands: [
      { id: 'brand-1', name: 'Manila Classic', code: 'MNLC' },
      { id: 'brand-2', name: 'Manila Pro', code: 'MNLP' }
    ],
    orders: [
      { id: 'order-1', status: 'IN_PROGRESS', totalAmount: 45000, createdAt: new Date('2024-03-01') },
      { id: 'order-2', status: 'COMPLETED', totalAmount: 32000, createdAt: new Date('2024-02-15') }
    ],
    _count: { orders: 12, brands: 2 }
  },
  {
    id: 'client-2',
    name: 'Cebu Sports Apparel',
    company: 'Cebu Sports Inc.',
    email: 'procurement@cebusports.ph',
    phone: '+63 932 987 6543',
    status: 'ACTIVE',
    createdAt: new Date('2024-02-20'),
    brands: [
      { id: 'brand-3', name: 'Cebu Athletes', code: 'CBAT' }
    ],
    orders: [
      { id: 'order-3', status: 'PENDING', totalAmount: 28000, createdAt: new Date('2024-03-10') }
    ],
    _count: { orders: 5, brands: 1 }
  },
  {
    id: 'client-3',
    name: 'Davao Uniform Solutions',
    company: 'Davao Uniform Solutions LLC',
    email: 'info@davaouniform.com',
    phone: '+63 912 345 6789',
    status: 'ACTIVE',
    createdAt: new Date('2024-01-30'),
    brands: [
      { id: 'brand-4', name: 'Davao Corporate', code: 'DVCR' },
      { id: 'brand-5', name: 'Davao Schools', code: 'DVSC' }
    ],
    orders: [],
    _count: { orders: 8, brands: 2 }
  }
]

const loadCreatedClients = (): any[] => {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.warn('Could not load created clients:', error)
  }
  return []
}

const saveCreatedClients = (clients: any[]): void => {
  try {
    const nextDir = path.dirname(STORAGE_FILE)
    if (!fs.existsSync(nextDir)) {
      fs.mkdirSync(nextDir, { recursive: true })
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(clients, null, 2))
  } catch (error) {
    console.warn('Could not save created clients:', error)
  }
}

// GET /api/clients/[id] - Get single client
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check demo clients first
    const demoClient = demoClients.find(c => c.id === params.id)
    if (demoClient) {
      return NextResponse.json({
        success: true,
        data: demoClient
      })
    }

    // Check file-based storage for created clients
    const createdClients = loadCreatedClients()
    const createdClient = createdClients.find((c: any) => c.id === params.id)

    if (createdClient) {
      return NextResponse.json({
        success: true,
        data: {
          ...createdClient,
          brands: [],
          orders: [],
          _count: { orders: 0, brands: 0 }
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Client not found' },
      { status: 404 }
    )
  } catch (error) {
    console.error('Failed to fetch client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client' },
      { status: 500 }
    )
  }
}

// PUT /api/clients/[id] - Update client
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const createdClients = loadCreatedClients()
    const clientIndex = createdClients.findIndex((c: any) => c.id === params.id)

    if (clientIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    // Update the client
    createdClients[clientIndex] = {
      ...createdClients[clientIndex],
      ...body,
      updated_at: new Date().toISOString()
    }

    saveCreatedClients(createdClients)

    return NextResponse.json({
      success: true,
      data: createdClients[clientIndex],
      message: 'Client updated successfully'
    })
  } catch (error) {
    console.error('Failed to update client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update client' },
      { status: 500 }
    )
  }
}

// DELETE /api/clients/[id] - Delete client
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const createdClients = loadCreatedClients()
    const filteredClients = createdClients.filter((c: any) => c.id !== params.id)

    if (filteredClients.length === createdClients.length) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      )
    }

    saveCreatedClients(filteredClients)

    return NextResponse.json({
      success: true,
      message: 'Client deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete client:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete client' },
      { status: 500 }
    )
  }
}