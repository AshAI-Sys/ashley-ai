import { NextResponse } from 'next/server'

// Mock 3PL providers with rate cards
const providers = {
  'LALAMOVE': {
    name: 'Lalamove',
    base_rate: 150,
    per_kg_rate: 25,
    per_km_rate: 8,
    max_weight: 30,
    same_day: true,
    cod_available: true,
    cod_fee_percent: 2.5
  },
  'GRAB_EXPRESS': {
    name: 'GrabExpress',
    base_rate: 120,
    per_kg_rate: 20,
    per_km_rate: 10,
    max_weight: 20,
    same_day: true,
    cod_available: true,
    cod_fee_percent: 3.0
  },
  'LBC': {
    name: 'LBC Express',
    base_rate: 100,
    per_kg_rate: 15,
    per_km_rate: 5,
    max_weight: 50,
    same_day: false,
    cod_available: true,
    cod_fee_percent: 2.0,
    next_day: true
  },
  'JRS': {
    name: 'JRS Express',
    base_rate: 90,
    per_kg_rate: 12,
    per_km_rate: 4,
    max_weight: 50,
    same_day: false,
    cod_available: true,
    cod_fee_percent: 2.5,
    next_day: true
  },
  '2GO': {
    name: '2GO Express',
    base_rate: 85,
    per_kg_rate: 10,
    per_km_rate: 3,
    max_weight: 100,
    same_day: false,
    cod_available: false,
    next_day: false,
    standard_delivery: true
  }
}

// Simple distance calculation (in production, use Google Maps API)
function calculateDistance(origin, destination) {
  // Mock distance calculation - in production use Google Maps Distance Matrix API
  const originCoords = getCoordinates(origin.city)
  const destCoords = getCoordinates(destination.city)

  if (!originCoords || !destCoords) {
    return 15 // Default 15km for unknown locations
  }

  const R = 6371 // Earth's radius in km
  const dLat = (destCoords.lat - originCoords.lat) * Math.PI / 180
  const dLon = (destCoords.lng - originCoords.lng) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(originCoords.lat * Math.PI / 180) * Math.cos(destCoords.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(R * c)
}

// Mock coordinates for major Philippine cities
function getCoordinates(city) {
  const coords = {
    'manila': { lat: 14.5995, lng: 120.9842 },
    'quezon city': { lat: 14.6760, lng: 121.0437 },
    'makati': { lat: 14.5547, lng: 121.0244 },
    'cebu': { lat: 10.3157, lng: 123.8854 },
    'davao': { lat: 7.1907, lng: 125.4553 },
    'caloocan': { lat: 14.6507, lng: 120.9668 },
    'taguig': { lat: 14.5176, lng: 121.0509 },
    'pasig': { lat: 14.5764, lng: 121.0851 }
  }
  return coords[city.toLowerCase()]
}

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      origin_address,
      destination_address,
      total_weight_kg,
      total_volume_m3,
      cod_amount,
      service_type, // 'SAME_DAY', 'NEXT_DAY', 'STANDARD'
      preferred_providers
    } = body

    // Calculate distance
    const distance_km = calculateDistance(origin_address, destination_address)

    // Generate quotes from available providers
    const quotes = []

    for (const [provider_code, provider] of Object.entries(providers)) {
      // Skip if weight exceeds provider limit
      if (total_weight_kg > provider.max_weight) continue

      // Skip if service type not available
      if (service_type === 'SAME_DAY' && !provider.same_day) continue
      if (service_type === 'NEXT_DAY' && !provider.next_day && !provider.same_day) continue

      // Skip if COD requested but not available
      if (cod_amount > 0 && !provider.cod_available) continue

      // Calculate base cost
      let total_cost = provider.base_rate
      total_cost += total_weight_kg * provider.per_kg_rate
      total_cost += distance_km * provider.per_km_rate

      // Add COD fee
      let cod_fee = 0
      if (cod_amount > 0 && provider.cod_available) {
        cod_fee = (cod_amount * provider.cod_fee_percent) / 100
        total_cost += cod_fee
      }

      // Add volume surcharge if large
      let volume_surcharge = 0
      if (total_volume_m3 > 0.1) { // > 100L
        volume_surcharge = Math.ceil(total_volume_m3 * 50)
        total_cost += volume_surcharge
      }

      // Estimate delivery time
      let estimated_delivery_hours = 48
      if (provider.same_day && service_type === 'SAME_DAY') {
        estimated_delivery_hours = distance_km <= 20 ? 4 : 8
      } else if (provider.next_day) {
        estimated_delivery_hours = 24
      }

      const quote = {
        provider_code,
        provider_name: provider.name,
        total_cost: Math.round(total_cost),
        base_rate: provider.base_rate,
        weight_charge: Math.round(total_weight_kg * provider.per_kg_rate),
        distance_charge: Math.round(distance_km * provider.per_km_rate),
        cod_fee,
        volume_surcharge,
        estimated_delivery_hours,
        estimated_delivery_date: new Date(Date.now() + estimated_delivery_hours * 60 * 60 * 1000),
        service_features: {
          same_day: provider.same_day,
          next_day: provider.next_day || false,
          cod_available: provider.cod_available,
          max_weight: provider.max_weight,
          tracking: true,
          insurance: true
        },
        booking_expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      }

      quotes.push(quote)
    }

    // Sort by cost (cheapest first)
    quotes.sort((a, b) => a.total_cost - b.total_cost)

    // Ashley AI recommendations
    const ashley_analysis = {
      recommended_provider: quotes[0]?.provider_code,
      cost_range: quotes.length > 0 ? {
        min: quotes[0].total_cost,
        max: quotes[quotes.length - 1].total_cost,
        savings: quotes.length > 1 ? quotes[quotes.length - 1].total_cost - quotes[0].total_cost : 0
      } : null,
      risk_assessment: distance_km > 50 ? 'MEDIUM' : 'LOW',
      optimization_tips: [
        distance_km > 30 && 'Consider consolidating shipments for distant destinations',
        total_weight_kg < 5 && 'Small package - motorcycle delivery recommended',
        cod_amount > 10000 && 'High value COD - verify recipient identity'
      ].filter(Boolean)
    }

    return NextResponse.json({
      success: true,
      quotes,
      metadata: {
        distance_km,
        total_weight_kg,
        cod_amount,
        service_type,
        quote_expires_at: new Date(Date.now() + 30 * 60 * 1000)
      },
      ashley_analysis
    })

  } catch (error) {
    console.error('3PL Quote error:', error)
    return NextResponse.json(
      { error: 'Failed to get delivery quotes', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    // Return available providers and their capabilities
    const providerList = Object.entries(providers).map(([code, provider]) => ({
      code,
      name: provider.name,
      max_weight: provider.max_weight,
      same_day: provider.same_day,
      next_day: provider.next_day || false,
      cod_available: provider.cod_available,
      base_rate: provider.base_rate
    }))

    return NextResponse.json({
      success: true,
      providers: providerList,
      service_areas: [
        'Metro Manila',
        'Cebu',
        'Davao',
        'Major Cities Nationwide'
      ]
    })

  } catch (error) {
    console.error('Get providers error:', error)
    return NextResponse.json(
      { error: 'Failed to get providers', details: error.message },
      { status: 500 }
    )
  }
}