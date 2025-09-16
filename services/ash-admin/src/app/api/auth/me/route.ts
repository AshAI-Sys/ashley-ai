import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'No authorization token provided'
      }, { status: 401 })
    }

    // For demo purposes, accept any bearer token
    return NextResponse.json({
      success: true,
      user: {
        id: 'demo-user-1',
        email: 'demo@ashleyai.com',
        name: 'Demo User',
        role: 'admin'
      }
    }, { status: 200 })

  } catch (error) {
    console.error('Auth verification error:', error)
    return NextResponse.json({
      success: false,
      message: 'Server error'
    }, { status: 500 })
  }
}