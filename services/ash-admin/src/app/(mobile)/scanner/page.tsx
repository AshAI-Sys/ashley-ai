/**
 * Mobile Scanner Page
 * Production floor QR/Barcode scanning interface
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Scanner } from '@/components/mobile/Scanner'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Package, ArrowLeft, Loader2 } from 'lucide-react'

interface ScanResult {
  success: boolean
  type: 'bundle' | 'order' | 'finished_unit' | 'carton' | 'unknown'
  data?: any
  message?: string
}

export default function ScannerPage() {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [showScanner, setShowScanner] = useState(true)

  const handleScan = async (code: string, format: string) => {
    setIsProcessing(true)
    setShowScanner(false)

    try {
      // Call scan API to process the code
      const response = await fetch('/api/mobile/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, format }),
      })

      const result = await response.json()

      setScanResult(result)
    } catch (error) {
      console.error('Scan processing error:', error)
      setScanResult({
        success: false,
        type: 'unknown',
        message: 'Failed to process scan. Please try again.',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleScanAnother = () => {
    setScanResult(null)
    setShowScanner(true)
  }

  const handleViewDetails = () => {
    if (!scanResult?.data) return

    // Navigate to appropriate detail page based on type
    switch (scanResult.type) {
      case 'bundle':
        router.push(`/mobile/bundle/${scanResult.data.id}`)
        break
      case 'order':
        router.push(`/mobile/order/${scanResult.data.id}`)
        break
      case 'finished_unit':
        router.push(`/mobile/finished-unit/${scanResult.data.id}`)
        break
      case 'carton':
        router.push(`/mobile/carton/${scanResult.data.id}`)
        break
      default:
        break
    }
  }

  if (showScanner) {
    return (
      <Scanner
        onScan={handleScan}
        onClose={() => router.push('/mobile/dashboard')}
      />
    )
  }

  // Processing state
  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center text-white">
        <Loader2 className="w-16 h-16 animate-spin mb-4 text-blue-500" />
        <p className="text-lg font-semibold">Processing scan...</p>
        <p className="text-sm text-gray-400 mt-2">Please wait</p>
      </div>
    )
  }

  // Result display
  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/mobile/dashboard')}
          className="text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-lg font-semibold">Scan Result</h2>
        <div className="w-10" />
      </div>

      {/* Result Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {scanResult?.success ? (
          <>
            {/* Success Icon */}
            <CheckCircle className="w-20 h-20 text-green-500 mb-4" />

            <h3 className="text-2xl font-bold mb-2">Scan Successful!</h3>

            <div className="bg-gray-800 rounded-lg p-4 w-full max-w-md mb-6">
              <div className="flex items-center mb-3">
                <Package className="w-5 h-5 mr-2 text-blue-400" />
                <span className="text-sm text-gray-400 uppercase">
                  {scanResult.type.replace('_', ' ')}
                </span>
              </div>

              {/* Display relevant data based on type */}
              {scanResult.data && (
                <div className="space-y-2">
                  {scanResult.type === 'bundle' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bundle #</span>
                        <span className="font-semibold">{scanResult.data.bundle_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Size</span>
                        <span className="font-semibold">{scanResult.data.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Quantity</span>
                        <span className="font-semibold">{scanResult.data.quantity} pcs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status</span>
                        <span className={`font-semibold ${
                          scanResult.data.status === 'completed' ? 'text-green-500' : 'text-yellow-500'
                        }`}>
                          {scanResult.data.status?.toUpperCase()}
                        </span>
                      </div>
                    </>
                  )}

                  {scanResult.type === 'order' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Order #</span>
                        <span className="font-semibold">{scanResult.data.order_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Client</span>
                        <span className="font-semibold">{scanResult.data.client?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status</span>
                        <span className="font-semibold text-blue-400">
                          {scanResult.data.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    </>
                  )}

                  {scanResult.type === 'finished_unit' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">SKU</span>
                        <span className="font-semibold">{scanResult.data.sku}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Quantity</span>
                        <span className="font-semibold">{scanResult.data.quantity} pcs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Location</span>
                        <span className="font-semibold">{scanResult.data.warehouse_location || 'N/A'}</span>
                      </div>
                    </>
                  )}

                  {scanResult.type === 'carton' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Carton #</span>
                        <span className="font-semibold">{scanResult.data.carton_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Weight</span>
                        <span className="font-semibold">{scanResult.data.weight_kg} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Units</span>
                        <span className="font-semibold">{scanResult.data._count?.finished_units || 0}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {scanResult.message && (
              <p className="text-center text-gray-400 mb-6 max-w-md">
                {scanResult.message}
              </p>
            )}

            {/* Action Buttons */}
            <div className="w-full max-w-md space-y-3">
              <Button
                onClick={handleViewDetails}
                size="lg"
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
              >
                View Details
              </Button>
              <Button
                onClick={handleScanAnother}
                variant="outline"
                size="lg"
                className="w-full h-14 text-lg border-gray-600 text-white hover:bg-gray-800"
              >
                Scan Another
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Error Icon */}
            <XCircle className="w-20 h-20 text-red-500 mb-4" />

            <h3 className="text-2xl font-bold mb-2">Scan Failed</h3>

            <p className="text-center text-gray-400 mb-6 max-w-md">
              {scanResult?.message || 'Unable to identify the scanned code. Please try again.'}
            </p>

            {/* Action Buttons */}
            <div className="w-full max-w-md space-y-3">
              <Button
                onClick={handleScanAnother}
                size="lg"
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
              <Button
                onClick={() => router.push('/mobile/dashboard')}
                variant="outline"
                size="lg"
                className="w-full h-14 text-lg border-gray-600 text-white hover:bg-gray-800"
              >
                Back to Dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
