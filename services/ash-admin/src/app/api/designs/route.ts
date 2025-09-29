import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // Demo designs data
    const demoDesigns = [
      {
        id: 'design-1',
        name: 'Manila Shirts Classic Logo',
        designType: 'LOGO',
        status: 'APPROVED',
        orderId: 'order-1',
        order: {
          id: 'order-1',
          orderNumber: 'ORD-2024-001',
          client: { name: 'Manila Shirts Co.' }
        },
        version: 3,
        approvalStatus: 'APPROVED',
        approvalDate: new Date('2024-09-20'),
        createdAt: new Date('2024-09-15'),
        updatedAt: new Date('2024-09-20'),
        fileUrl: '/designs/manila-classic-logo-v3.png',
        thumbnailUrl: '/designs/thumbnails/manila-classic-logo-v3.jpg',
        specifications: {
          printMethod: 'silkscreen',
          colors: ['navy', 'white'],
          dimensions: { width: 10, height: 8 }
        }
      },
      {
        id: 'design-2',
        name: 'Cebu Fashion Polo Design',
        designType: 'EMBROIDERY',
        status: 'PENDING_APPROVAL',
        orderId: 'order-2',
        order: {
          id: 'order-2',
          orderNumber: 'ORD-2024-002',
          client: { name: 'Cebu Fashion House' }
        },
        version: 1,
        approvalStatus: 'PENDING_CLIENT',
        createdAt: new Date('2024-09-22'),
        updatedAt: new Date('2024-09-22'),
        fileUrl: '/designs/cebu-polo-embroidery-v1.dst',
        thumbnailUrl: '/designs/thumbnails/cebu-polo-embroidery-v1.jpg',
        specifications: {
          printMethod: 'embroidery',
          colors: ['gold', 'black'],
          dimensions: { width: 6, height: 4 }
        }
      },
      {
        id: 'design-3',
        name: 'Davao Hoodie Graphics',
        designType: 'GRAPHICS',
        status: 'IN_REVISION',
        orderId: 'order-3',
        order: {
          id: 'order-3',
          orderNumber: 'ORD-2024-003',
          client: { name: 'Davao Apparel Co.' }
        },
        version: 2,
        approvalStatus: 'REVISION_REQUESTED',
        createdAt: new Date('2024-09-18'),
        updatedAt: new Date('2024-09-25'),
        fileUrl: '/designs/davao-hoodie-graphics-v2.ai',
        thumbnailUrl: '/designs/thumbnails/davao-hoodie-graphics-v2.jpg',
        specifications: {
          printMethod: 'dtf',
          colors: ['multicolor'],
          dimensions: { width: 12, height: 10 }
        }
      }
    ];

    // Apply filters
    let filteredDesigns = demoDesigns.filter(design => {
      let matches = true;

      if (search) {
        matches = matches && (
          design.name.toLowerCase().includes(search.toLowerCase()) ||
          design.order.client.name.toLowerCase().includes(search.toLowerCase()) ||
          design.order.orderNumber.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (status) {
        matches = matches && design.status === status;
      }

      return matches;
    });

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedDesigns = filteredDesigns.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: {
        designs: paginatedDesigns,
        pagination: {
          page,
          limit,
          total: filteredDesigns.length,
          totalPages: Math.ceil(filteredDesigns.length / limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching designs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch designs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create demo design response
    const newDesign = {
      id: `design-${Date.now()}`,
      ...body,
      version: 1,
      status: 'DRAFT',
      approvalStatus: 'PENDING_REVIEW',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return NextResponse.json({
      success: true,
      data: { design: newDesign },
      message: 'Design created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating design:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create design' },
      { status: 500 }
    );
  }
}