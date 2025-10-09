'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { QrCode, ArrowLeft, Package, Scissors, Calendar, Hash } from 'lucide-react'

export default function ScanBundlePage() {
  const router = useRouter()
  const [qrCode, setQrCode] = useState('')
  const [scannedBundle, setScannedBundle] = useState<any>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleScan = async () => {
    if (!qrCode.trim()) {
      setError('Please enter a QR code')
      return
    }

    setIsScanning(true)
    setError(null)

    try {
      const response = await fetch(`/api/cutting/bundles/scan?qrCode=${encodeURIComponent(qrCode)}`)

      if (!response.ok) {
        throw new Error('Bundle not found')
      }

      const data = await response.json()
      setScannedBundle(data.bundle)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan bundle')
      setScannedBundle(null)
    } finally {
      setIsScanning(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleScan()
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/cutting')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Cutting
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Scan Bundle</h1>
              <p className="text-muted-foreground">Scan QR code to view bundle details</p>
            </div>
          </div>
        </div>

        {/* Scanner Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter or scan QR code..."
                value={qrCode}
                onChange={(e) => setQrCode(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 font-mono"
                autoFocus
              />
              <Button onClick={handleScan} disabled={isScanning}>
                {isScanning ? 'Scanning...' : 'Scan'}
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bundle Details */}
        {scannedBundle && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Bundle Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">QR Code</label>
                    <p className="font-mono font-medium">{scannedBundle.qr_code}</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Bundle Number</label>
                    <p className="font-medium">{scannedBundle.bundle_number || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Size Code</label>
                    <p className="font-medium">{scannedBundle.size_code}</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Quantity</label>
                    <p className="font-medium">{scannedBundle.qty} pieces</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <div className="mt-1">
                      <Badge variant={
                        scannedBundle.status === 'DONE' ? 'default' :
                        scannedBundle.status === 'IN_SEWING' ? 'secondary' :
                        scannedBundle.status === 'REJECTED' ? 'destructive' :
                        'outline'
                      }>
                        {scannedBundle.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Order Number</label>
                    <p className="font-medium">{scannedBundle.order?.order_number || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Client</label>
                    <p className="font-medium">{scannedBundle.order?.client?.name || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Created</label>
                    <p className="font-medium">
                      {new Date(scannedBundle.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {scannedBundle.lay && (
                <div className="mt-6 pt-6 border-t space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Scissors className="w-4 h-4" />
                    Cut Lay Information
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Marker Name</label>
                      <p className="font-medium">{scannedBundle.lay.marker_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Lay Length</label>
                      <p className="font-medium">{scannedBundle.lay.lay_length_m}m</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Plies</label>
                      <p className="font-medium">{scannedBundle.lay.plies}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {!scannedBundle && !error && (
          <Card>
            <CardHeader>
              <CardTitle>How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>1. Use a QR code scanner to scan the bundle QR code, or manually enter the code</p>
              <p>2. The bundle details will appear below once scanned successfully</p>
              <p>3. You can scan multiple bundles by clearing the input and scanning again</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
