'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  QrCode, 
  Scan,
  Play,
  CheckCircle,
  AlertCircle,
  Package,
  User,
  Settings,
  Clock,
  DollarSign,
  ArrowLeft,
  Camera,
  Search,
  GitBranch
} from 'lucide-react'
import Link from 'next/link'

interface Bundle {
  id: string
  order_id: string
  size_code: string
  qty: number
  qr_code: string
  status: 'CREATED' | 'IN_SEWING' | 'DONE' | 'REJECTED'
  order: {
    order_number: string
    brand: { name: string; code: string }
    line_items: Array<{ description: string; garment_type?: string }>
  }
  lay?: {
    id: string
    marker_name?: string
  }
  created_at: string
}

interface SewingOperation {
  id: string
  product_type: string
  name: string
  standard_minutes: number
  piece_rate?: number
  depends_on?: string[]
}

interface Employee {
  id: string
  employee_number: string
  first_name: string
  last_name: string
  position: string
  department: string
}

interface BundleProgress {
  operation_name: string
  status: 'PENDING' | 'COMPLETED'
  completed_at?: string
}

export default function NewSewingRunPage() {
  const router = useRouter()
  const [step, setStep] = useState<'scan' | 'operation' | 'operator' | 'confirm'>('scan')
  const [loading, setLoading] = useState(false)
  const [qrInput, setQrInput] = useState('')
  const [scannedBundle, setScannedBundle] = useState<Bundle | null>(null)
  const [bundleProgress, setBundleProgress] = useState<BundleProgress[]>([])
  const [availableOperations, setAvailableOperations] = useState<SewingOperation[]>([])
  const [selectedOperation, setSelectedOperation] = useState<SewingOperation | null>(null)
  const [selectedOperator, setSelectedOperator] = useState<Employee | null>(null)
  const [operators, setOperators] = useState<Employee[]>([])
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    fetchOperators()
  }, [])

  const fetchOperators = async () => {
    try {
      const response = await fetch('/api/employees?department=SEWING')
      if (response.ok) {
        const data = await response.json()
        setOperators(data.data || [])
      } else {
        // Mock data
        setOperators([
          { id: '1', employee_number: 'EMP001', first_name: 'Maria', last_name: 'Santos', position: 'Sewing Operator', department: 'SEWING' },
          { id: '2', employee_number: 'EMP002', first_name: 'Carlos', last_name: 'Rodriguez', position: 'Senior Operator', department: 'SEWING' },
          { id: '3', employee_number: 'EMP003', first_name: 'Ana', last_name: 'Cruz', position: 'Sewing Operator', department: 'SEWING' },
          { id: '4', employee_number: 'EMP004', first_name: 'Juan', last_name: 'Dela Cruz', position: 'Team Leader', department: 'SEWING' }
        ])
      }
    } catch (error) {
      console.error('Failed to fetch operators:', error)
    }
  }

  const handleQRScan = async () => {
    if (!qrInput.trim()) return

    setLoading(true)
    try {
      // Fetch bundle data by QR code
      const response = await fetch(`/api/bundles/by-qr?qr_code=${encodeURIComponent(qrInput)}`)
      
      if (response.ok) {
        const data = await response.json()
        setScannedBundle(data.bundle)
        setBundleProgress(data.progress || [])
        await fetchAvailableOperations(data.bundle)
        setStep('operation')
      } else {
        // Mock data for demo
        const mockBundle: Bundle = {
          id: 'bundle-001',
          order_id: 'order-001',
          size_code: 'M',
          qty: 20,
          qr_code: qrInput,
          status: 'CREATED',
          order: {
            order_number: 'TCAS-2025-000001',
            brand: { name: 'Trendy Casual', code: 'TCAS' },
            line_items: [{ description: 'Premium Hoodie', garment_type: 'Hoodie' }]
          },
          lay: {
            id: 'lay-001',
            marker_name: 'Hoodie Marker V2'
          },
          created_at: new Date().toISOString()
        }
        
        const mockProgress: BundleProgress[] = [
          { operation_name: 'Join shoulders', status: 'COMPLETED', completed_at: new Date(Date.now() - 3600000).toISOString() }
        ]
        
        setScannedBundle(mockBundle)
        setBundleProgress(mockProgress)
        await fetchAvailableOperations(mockBundle)
        setStep('operation')
      }
    } catch (error) {
      console.error('Failed to scan QR code:', error)
      alert('Invalid QR code or bundle not found')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableOperations = async (bundle: Bundle) => {
    try {
      const garmentType = bundle.order.line_items[0]?.garment_type || 'Hoodie'
      const response = await fetch(`/api/sewing/operations?product_type=${garmentType}`)
      
      if (response.ok) {
        const data = await response.json()
        setAvailableOperations(data.data || [])
      } else {
        // Mock operations
        const mockOperations: SewingOperation[] = [
          { id: '1', product_type: 'Hoodie', name: 'Join shoulders', standard_minutes: 1.5, piece_rate: 2.25, depends_on: [] },
          { id: '2', product_type: 'Hoodie', name: 'Attach collar', standard_minutes: 2.0, piece_rate: 3.00, depends_on: ['Join shoulders'] },
          { id: '3', product_type: 'Hoodie', name: 'Set sleeves', standard_minutes: 3.5, piece_rate: 5.25, depends_on: ['Join shoulders'] },
          { id: '4', product_type: 'Hoodie', name: 'Side seams', standard_minutes: 2.8, piece_rate: 4.20, depends_on: ['Set sleeves'] },
          { id: '5', product_type: 'Hoodie', name: 'Hood assembly', standard_minutes: 4.0, piece_rate: 6.00, depends_on: ['Attach collar'] },
          { id: '6', product_type: 'Hoodie', name: 'Pocket attachment', standard_minutes: 1.8, piece_rate: 2.70, depends_on: ['Side seams'] },
          { id: '7', product_type: 'Hoodie', name: 'Hem bottom', standard_minutes: 1.2, piece_rate: 1.80, depends_on: ['Side seams'] }
        ]
        setAvailableOperations(mockOperations)
      }
    } catch (error) {
      console.error('Failed to fetch operations:', error)
    }
  }

  const isOperationAvailable = (operation: SewingOperation) => {
    if (!operation.depends_on || operation.depends_on.length === 0) return true
    
    return operation.depends_on.every(dep => 
      bundleProgress.some(progress => 
        progress.operation_name === dep && progress.status === 'COMPLETED'
      )
    )
  }

  const handleCreateRun = async () => {
    if (!scannedBundle || !selectedOperation || !selectedOperator) return

    setLoading(true)
    try {
      const runData = {
        order_id: scannedBundle.order_id,
        operation_name: selectedOperation.name,
        operator_id: selectedOperator.id,
        bundle_id: scannedBundle.id,
        routing_step_id: 'temp-routing-step' // In real implementation, this would be dynamic
      }

      const response = await fetch('/api/sewing/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(runData)
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/sewing/runs/${data.id}`)
      } else {
        // For demo, just redirect to sewing page
        router.push('/sewing')
      }
    } catch (error) {
      console.error('Failed to create sewing run:', error)
      alert('Failed to create sewing run')
    } finally {
      setLoading(false)
    }
  }

  const startCameraCapture = async () => {
    setIsScanning(true)
    // In a real implementation, this would start camera capture
    // For demo, we'll simulate after 2 seconds
    setTimeout(() => {
      setQrInput('ash://bundle/demo-001')
      setIsScanning(false)
      handleQRScan()
    }, 2000)
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sewing">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sewing
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Create Sewing Run</h1>
            <p className="text-muted-foreground">Scan bundle QR and assign operation</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'scan' ? 'text-blue-600' : step !== 'scan' ? 'text-green-600' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'scan' ? 'bg-blue-100 border-2 border-blue-600' : 
                step !== 'scan' ? 'bg-green-100 border-2 border-green-600' : 
                'bg-gray-100 border-2 border-gray-300'
              }`}>
                {step !== 'scan' ? <CheckCircle className="w-4 h-4" /> : <QrCode className="w-4 h-4" />}
              </div>
              <span className="font-medium">Scan Bundle</span>
            </div>
            
            <div className={`h-0.5 flex-1 ${step === 'operation' || step === 'operator' || step === 'confirm' ? 'bg-green-600' : 'bg-gray-300'}`} />
            
            <div className={`flex items-center gap-2 ${
              step === 'operation' ? 'text-blue-600' : 
              step === 'operator' || step === 'confirm' ? 'text-green-600' : 
              'text-muted-foreground'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'operation' ? 'bg-blue-100 border-2 border-blue-600' : 
                step === 'operator' || step === 'confirm' ? 'bg-green-100 border-2 border-green-600' : 
                'bg-gray-100 border-2 border-gray-300'
              }`}>
                {step === 'operator' || step === 'confirm' ? <CheckCircle className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
              </div>
              <span className="font-medium">Select Operation</span>
            </div>
            
            <div className={`h-0.5 flex-1 ${step === 'operator' || step === 'confirm' ? 'bg-green-600' : 'bg-gray-300'}`} />
            
            <div className={`flex items-center gap-2 ${
              step === 'operator' ? 'text-blue-600' : 
              step === 'confirm' ? 'text-green-600' : 
              'text-muted-foreground'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'operator' ? 'bg-blue-100 border-2 border-blue-600' : 
                step === 'confirm' ? 'bg-green-100 border-2 border-green-600' : 
                'bg-gray-100 border-2 border-gray-300'
              }`}>
                {step === 'confirm' ? <CheckCircle className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <span className="font-medium">Assign Operator</span>
            </div>
            
            <div className={`h-0.5 flex-1 ${step === 'confirm' ? 'bg-green-600' : 'bg-gray-300'}`} />
            
            <div className={`flex items-center gap-2 ${step === 'confirm' ? 'text-blue-600' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'confirm' ? 'bg-blue-100 border-2 border-blue-600' : 'bg-gray-100 border-2 border-gray-300'
              }`}>
                <Play className="w-4 h-4" />
              </div>
              <span className="font-medium">Confirm & Start</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {step === 'scan' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Scan Bundle QR Code
            </CardTitle>
            <CardDescription>
              Scan or enter the QR code from the printed bundle label
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qr_input">Bundle QR Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="qr_input"
                      value={qrInput}
                      onChange={(e) => setQrInput(e.target.value)}
                      placeholder="ash://bundle/..."
                      className="font-mono"
                    />
                    <Button 
                      variant="outline"
                      onClick={handleQRScan}
                      disabled={loading || !qrInput.trim()}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Lookup
                    </Button>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="my-4">
                    <span className="text-sm text-muted-foreground">OR</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={startCameraCapture}
                    disabled={isScanning}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {isScanning ? 'Scanning...' : 'Use Camera Scanner'}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="text-center p-8 border-2 border-dashed rounded-lg">
                  {isScanning ? (
                    <div className="space-y-4">
                      <Scan className="w-12 h-12 mx-auto text-blue-600 animate-pulse" />
                      <p className="text-sm text-muted-foreground">
                        Scanning for QR code...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <QrCode className="w-12 h-12 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        QR scanner will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Make sure the bundle QR code is clearly visible and not damaged. 
                If scanning fails, you can manually enter the code.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {step === 'operation' && scannedBundle && (
        <div className="space-y-6">
          {/* Bundle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Bundle Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Order</p>
                  <p className="font-medium">{scannedBundle.order.order_number}</p>
                  <p className="text-sm text-muted-foreground">{scannedBundle.order.brand.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Product</p>
                  <p className="font-medium">{scannedBundle.order.line_items[0]?.description}</p>
                  <p className="text-sm text-muted-foreground">Size: {scannedBundle.size_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                  <p className="font-medium">{scannedBundle.qty} pieces</p>
                  <Badge className={`${scannedBundle.status === 'CREATED' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'} mt-1`}>
                    {scannedBundle.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Status */}
          {bundleProgress.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Bundle Progress</CardTitle>
                <CardDescription>Operations completed on this bundle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {bundleProgress.map((progress, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-green-50">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{progress.operation_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {progress.completed_at ? new Date(progress.completed_at).toLocaleString() : 'Recently completed'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Operation Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Select Next Operation
              </CardTitle>
              <CardDescription>
                Choose the sewing operation to perform on this bundle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableOperations.map((operation) => {
                  const isAvailable = isOperationAvailable(operation)
                  
                  return (
                    <div 
                      key={operation.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedOperation?.id === operation.id 
                          ? 'border-blue-600 bg-blue-50' 
                          : isAvailable
                            ? 'border-gray-200 hover:border-gray-300'
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                      }`}
                      onClick={() => isAvailable && setSelectedOperation(operation)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`font-medium ${!isAvailable ? 'text-muted-foreground' : ''}`}>
                              {operation.name}
                            </h3>
                            {!isAvailable && (
                              <Badge variant="outline" className="text-orange-600 border-orange-600">
                                Blocked
                              </Badge>
                            )}
                            {selectedOperation?.id === operation.id && (
                              <Badge className="bg-blue-100 text-blue-800">
                                Selected
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span>{operation.standard_minutes} min SMV</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-muted-foreground" />
                              <span>₱{operation.piece_rate?.toFixed(2) || 'N/A'} per piece</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <GitBranch className="w-4 h-4 text-muted-foreground" />
                              <span>
                                {operation.depends_on && operation.depends_on.length > 0 
                                  ? `After: ${operation.depends_on.join(', ')}`
                                  : 'Starting operation'
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={() => setStep('operator')}
                  disabled={!selectedOperation}
                >
                  Continue to Operator Selection
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 'operator' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Assign Operator
            </CardTitle>
            <CardDescription>
              Select the operator who will perform this operation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {operators.map((operator) => (
                <div 
                  key={operator.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedOperator?.id === operator.id 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedOperator(operator)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        {operator.first_name} {operator.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {operator.employee_number} • {operator.position}
                      </p>
                    </div>
                    {selectedOperator?.id === operator.id && (
                      <Badge className="bg-blue-100 text-blue-800">
                        Selected
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('operation')}>
                Back to Operation
              </Button>
              <Button 
                onClick={() => setStep('confirm')}
                disabled={!selectedOperator}
              >
                Continue to Confirmation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'confirm' && scannedBundle && selectedOperation && selectedOperator && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Confirm & Start Run
            </CardTitle>
            <CardDescription>
              Review the details and start the sewing run
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Bundle Details</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Order:</span> {scannedBundle.order.order_number}</p>
                    <p><span className="font-medium">Product:</span> {scannedBundle.order.line_items[0]?.description}</p>
                    <p><span className="font-medium">Size:</span> {scannedBundle.size_code}</p>
                    <p><span className="font-medium">Quantity:</span> {scannedBundle.qty} pieces</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Operation</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedOperation.name}</p>
                    <p><span className="font-medium">SMV:</span> {selectedOperation.standard_minutes} minutes</p>
                    <p><span className="font-medium">Rate:</span> ₱{selectedOperation.piece_rate?.toFixed(2) || 'N/A'} per piece</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Operator</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {selectedOperator.first_name} {selectedOperator.last_name}</p>
                    <p><span className="font-medium">Employee #:</span> {selectedOperator.employee_number}</p>
                    <p><span className="font-medium">Position:</span> {selectedOperator.position}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Expected Earnings</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Total SMV:</span> {(selectedOperation.standard_minutes * scannedBundle.qty).toFixed(1)} minutes</p>
                    <p><span className="font-medium">Total Pay:</span> ₱{((selectedOperation.piece_rate || 0) * scannedBundle.qty).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Once started, the operator can track progress and mark pieces as completed or rejected.
                Time tracking will begin automatically.
              </AlertDescription>
            </Alert>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('operator')}>
                Back to Operator
              </Button>
              <Button 
                onClick={handleCreateRun}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                {loading ? 'Creating Run...' : 'Start Sewing Run'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}