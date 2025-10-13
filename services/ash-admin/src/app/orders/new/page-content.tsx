'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

// Import all the new order intake components
import { ClientBrandSection } from '@/components/order-intake/client-brand-section'
import { ProductDesignSection } from '@/components/order-intake/product-design-section'
import { QuantitiesSizeSection } from '@/components/order-intake/quantities-size-section'
import { VariantsAddonsSection } from '@/components/order-intake/variants-addons-section'
import { DatesSLAsSection } from '@/components/order-intake/dates-slas-section'
import { CommercialsSection } from '@/components/order-intake/commercials-section'
import { ProductionRouteSection } from '@/components/order-intake/production-route-section'
import { FilesNotesSection } from '@/components/order-intake/files-notes-section'
import { SubmitSection } from '@/components/order-intake/submit-section'
import { OrderDetailsSection } from '@/components/order-intake/order-details-section'
import { GraphicEditingSection } from '@/components/order-intake/graphic-editing-section'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'

// Types
interface Client {
  id: string
  name: string
  company?: string
  email?: string
  phone?: string
  brands: Array<{
    id: string
    name: string
    code: string
  }>
}

interface DesignFile {
  id: string
  file: File
  name: string
  size: string
  type: string
  preview?: string
  uploadProgress?: number
  uploaded?: boolean
  ashleyValidation?: any
}

interface SizeCurve {
  [key: string]: number
}

interface ColorVariant {
  id: string
  name: string
  hexCode: string
  percentage: number
  quantity: number
}

interface UploadedFile {
  id: string
  file: File
  name: string
  size: string
  type: string
  category: string
  preview?: string
  uploadProgress?: number
  uploaded?: boolean
  ashleyAnalysis?: any
}

interface CommercialsData {
  unitPrice: number
  subtotal: number
  addOnsCost: number
  colorVariantsCost: number
  rushSurcharge: number
  quantityDiscount: number
  depositPercentage: number
  paymentTerms: string
  taxInclusive: boolean
  currency: string
  finalTotal: number
  depositAmount: number
  balanceAmount: number
}

export default function NewOrderPageContent() {
  const router = useRouter()

  // Loading and submission states
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Client data
  const [clients, setClients] = useState<Client[]>([])

  // Form state - Section A: Client & Brand
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedBrandId, setSelectedBrandId] = useState('')
  const [channel, setChannel] = useState('')

  // Form state - Section B: Product & Design
  const [garmentType, setGarmentType] = useState('')
  const [printingMethod, setPrintingMethod] = useState('')
  const [designFiles, setDesignFiles] = useState<DesignFile[]>([])

  // Form state - Section C: Quantities & Size Curve
  const [totalQuantity, setTotalQuantity] = useState(0)
  const [sizeCurve, setSizeCurve] = useState<SizeCurve>({
    XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0
  })

  // Form state - Section D: Variants & Add-ons
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([{
    id: '1',
    name: '',
    hexCode: '#000000',
    percentage: 100,
    quantity: 0
  }])
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [addOnsCost, setAddOnsCost] = useState(0)
  const [colorVariantsCost, setColorVariantsCost] = useState(0)

  // Form state - Section E: Dates & SLAs
  const [deliveryDate, setDeliveryDate] = useState('')
  const [rushSurchargePercent, setRushSurchargePercent] = useState(0)

  // Form state - Section F: Commercials
  const [commercials, setCommercials] = useState<CommercialsData>({
    unitPrice: 0,
    subtotal: 0,
    addOnsCost: 0,
    colorVariantsCost: 0,
    rushSurcharge: 0,
    quantityDiscount: 0,
    depositPercentage: 50,
    paymentTerms: 'net_15',
    taxInclusive: true,
    currency: 'PHP',
    finalTotal: 0,
    depositAmount: 0,
    balanceAmount: 0
  })

  // Form state - Section G: Production Route
  const [selectedRoute, setSelectedRoute] = useState('')

  // Form state - Section H: Files & Notes
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [specialInstructions, setSpecialInstructions] = useState('')

  // Form state - New Order Details fields
  const [poNumber, setPoNumber] = useState('')
  const [orderType, setOrderType] = useState('NEW')
  const [designName, setDesignName] = useState('')
  const [fabricType, setFabricType] = useState('')
  const [sizeDistributionType, setSizeDistributionType] = useState('')

  // Form state - Graphic Editing Section
  const [artistFilename, setArtistFilename] = useState('')
  const [mockupImageUrl, setMockupImageUrl] = useState('')
  const [notesRemarks, setNotesRemarks] = useState('')
  const [printLocations, setPrintLocations] = useState<any[]>([])

  // Load clients on component mount
  useEffect(() => {
    fetchClients()
    loadDraft()
  }, [])

  // Auto-save draft every time form data changes
  useEffect(() => {
    const draftData = {
      selectedClientId,
      selectedBrandId,
      channel,
      garmentType,
      printingMethod,
      totalQuantity,
      sizeCurve,
      colorVariants,
      selectedAddOns,
      deliveryDate,
      selectedRoute,
      specialInstructions,
      poNumber,
      orderType,
      designName,
      fabricType,
      sizeDistributionType,
      artistFilename,
      mockupImageUrl,
      notesRemarks,
      commercials,
      timestamp: new Date().toISOString()
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('orderFormDraft', JSON.stringify(draftData))
    }
  }, [
    selectedClientId,
    selectedBrandId,
    channel,
    garmentType,
    printingMethod,
    totalQuantity,
    sizeCurve,
    colorVariants,
    selectedAddOns,
    deliveryDate,
    selectedRoute,
    specialInstructions,
    poNumber,
    orderType,
    designName,
    fabricType,
    sizeDistributionType,
    artistFilename,
    mockupImageUrl,
    notesRemarks,
    commercials
  ])

  const loadDraft = () => {
    if (typeof window === 'undefined') return

    try {
      const savedDraft = localStorage.getItem('orderFormDraft')
      if (savedDraft) {
        const draft = JSON.parse(savedDraft)

        // Restore all form fields
        if (draft.selectedClientId) setSelectedClientId(draft.selectedClientId)
        if (draft.selectedBrandId) setSelectedBrandId(draft.selectedBrandId)
        if (draft.channel) setChannel(draft.channel)
        if (draft.garmentType) setGarmentType(draft.garmentType)
        if (draft.printingMethod) setPrintingMethod(draft.printingMethod)
        if (draft.totalQuantity) setTotalQuantity(draft.totalQuantity)
        if (draft.sizeCurve) setSizeCurve(draft.sizeCurve)
        if (draft.colorVariants) setColorVariants(draft.colorVariants)
        if (draft.selectedAddOns) setSelectedAddOns(draft.selectedAddOns)
        if (draft.deliveryDate) setDeliveryDate(draft.deliveryDate)
        if (draft.selectedRoute) setSelectedRoute(draft.selectedRoute)
        if (draft.specialInstructions) setSpecialInstructions(draft.specialInstructions)
        if (draft.poNumber) setPoNumber(draft.poNumber)
        if (draft.orderType) setOrderType(draft.orderType)
        if (draft.designName) setDesignName(draft.designName)
        if (draft.fabricType) setFabricType(draft.fabricType)
        if (draft.sizeDistributionType) setSizeDistributionType(draft.sizeDistributionType)
        if (draft.artistFilename) setArtistFilename(draft.artistFilename)
        if (draft.mockupImageUrl) setMockupImageUrl(draft.mockupImageUrl)
        if (draft.notesRemarks) setNotesRemarks(draft.notesRemarks)
        if (draft.commercials) setCommercials(draft.commercials)

        toast.success('Draft restored! Continue where you left off.')
      }
    } catch (error) {
      console.error('Failed to load draft:', error)
    }
  }

  const clearDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('orderFormDraft')
      toast.success('Draft cleared')
    }
  }

  const fetchClients = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/clients?include=brands')
      const data = await response.json()
      if (data.data && data.data.clients) {
        setClients(data.data.clients)
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error)
      toast.error('Failed to load clients')
    } finally {
      setLoading(false)
    }
  }

  // Event handlers
  const handleClientCreated = (newClient: Client) => {
    setClients(prev => [...prev, newClient])
  }

  const handlePricingUpdate = (addOnsTotal: number, colorVariantsTotal: number) => {
    setAddOnsCost(addOnsTotal)
    setColorVariantsCost(colorVariantsTotal)
  }

  const handleTimelineValidation = (validation: any) => {
    // Handle timeline validation results
    console.log('Timeline validation:', validation)
  }

  const handleRushSurcharge = (percent: number) => {
    setRushSurchargePercent(percent)
  }

  const handleRouteOptimized = (optimization: any) => {
    // Handle route optimization results
    console.log('Route optimization:', optimization)
  }

  // Form validation
  const validateForm = (): boolean => {
    const errors: string[] = []

    // Required field validations
    if (!selectedClientId) errors.push('Please select a client')
    if (!selectedBrandId) errors.push('Please select a brand')
    if (!garmentType) errors.push('Please select garment type')
    if (!printingMethod) errors.push('Please select printing method')
    if (totalQuantity === 0) errors.push('Please set total quantity')
    if (!deliveryDate) errors.push('Please set delivery date')
    if (commercials.unitPrice === 0) errors.push('Please set unit price')
    if (!selectedRoute) errors.push('Please select production route')

    // Size curve validation
    const sizeCurveTotal = Object.values(sizeCurve).reduce((sum, qty) => sum + qty, 0)
    if (sizeCurveTotal !== totalQuantity) {
      errors.push('Size breakdown must equal total quantity')
    }

    // Design files validation
    if (designFiles.length === 0) {
      errors.push('Please upload at least one design file')
    }

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
      return false
    }

    return true
  }

  // Form submission
  const handleSubmit = async (action: 'draft' | 'submit') => {
    if (action === 'submit' && !validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      const orderData = {
        // Client & Brand
        clientId: selectedClientId,
        brandId: selectedBrandId,
        channel,

        // Order Details (NEW)
        po_number: poNumber,
        order_type: orderType,
        design_name: designName,
        fabric_type: fabricType,
        size_distribution: JSON.stringify({ type: sizeDistributionType }),

        // Product & Design
        garment_type: garmentType,
        printing_method: printingMethod,
        design_files: designFiles.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type
        })),

        // Graphic Editing (NEW)
        artist_filename: artistFilename,
        mockup_url: mockupImageUrl,
        notes_remarks: notesRemarks,
        print_locations: JSON.stringify(printLocations),

        // Quantities & Sizes
        total_quantity: totalQuantity,
        size_breakdown: JSON.stringify(sizeCurve),

        // Variants & Add-ons
        color_variants: JSON.stringify(colorVariants),
        add_ons: selectedAddOns,
        add_ons_cost: addOnsCost,
        color_variants_cost: colorVariantsCost,

        // Dates & SLAs
        deliveryDate: deliveryDate,
        rush_surcharge_percent: rushSurchargePercent,

        // Commercials
        unitPrice: commercials.unitPrice,
        totalAmount: commercials.finalTotal,
        deposit_percentage: commercials.depositPercentage,
        payment_terms: commercials.paymentTerms,
        tax_inclusive: commercials.taxInclusive,
        currency: commercials.currency,

        // Production Route
        production_route: selectedRoute,

        // Files & Notes
        additional_files: uploadedFiles.map(f => ({
          name: f.name,
          category: f.category,
          size: f.size
        })),
        special_instructions: specialInstructions,

        // Status
        status: action === 'draft' ? 'DRAFT' : 'PENDING_APPROVAL'
      }

      console.log("Order data being sent:", orderData)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`Order ${action === 'draft' ? 'saved as draft' : 'submitted for processing'}`)
        // Clear draft on successful submission
        clearDraft()
        // API returns { success: true, data: { order: { id: ... } } }
        const orderId = result.data?.order?.id || result.id
        router.push(`/orders/${orderId}`)
      } else {
        toast.error(result.message || 'Failed to create order')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Failed to create order')
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate completion percentage
  const calculateProgress = (): number => {
    let completed = 0
    const total = 9 // Total sections

    if (selectedClientId && selectedBrandId) completed++
    if (garmentType && printingMethod && designFiles.length > 0) completed++
    if (totalQuantity > 0 && Object.values(sizeCurve).reduce((sum, qty) => sum + qty, 0) === totalQuantity) completed++
    if (colorVariants.length > 0) completed++
    if (deliveryDate) completed++
    if (commercials.unitPrice > 0) completed++
    if (selectedRoute) completed++
    completed++ // Files & Notes (optional)
    completed++ // Submit section (always available)

    return Math.round((completed / total) * 100)
  }

  const progress = calculateProgress()

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  const hasDraft = typeof window !== 'undefined' && localStorage.getItem('orderFormDraft')

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">New Production Order</h1>
            <p className="text-muted-foreground">Create a comprehensive production order with Ashley AI assistance</p>
          </div>

          {hasDraft && (
            <button
              onClick={clearDraft}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Clear Draft
            </button>
          )}
        </div>

        {/* Draft Indicator */}
        {hasDraft && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm text-blue-900 font-medium">
              Draft auto-saved • Your progress is preserved even if you navigate away
            </span>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Completion Progress</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">

          {/* A. Client & Brand */}
          <ClientBrandSection
            clients={clients}
            selectedClientId={selectedClientId}
            selectedBrandId={selectedBrandId}
            channel={channel}
            onClientChange={setSelectedClientId}
            onBrandChange={setSelectedBrandId}
            onChannelChange={setChannel}
            onClientCreated={handleClientCreated}
          />

          {/* A2. Order Details */}
          <OrderDetailsSection
            poNumber={poNumber}
            orderType={orderType}
            designName={designName}
            fabricType={fabricType}
            sizeDistributionType={sizeDistributionType}
            onPoNumberChange={setPoNumber}
            onOrderTypeChange={setOrderType}
            onDesignNameChange={setDesignName}
            onFabricTypeChange={setFabricType}
            onSizeDistributionTypeChange={setSizeDistributionType}
          />

          {/* B. Product & Design */}
          <ProductDesignSection
            garmentType={garmentType}
            printingMethod={printingMethod}
            designFiles={designFiles}
            onGarmentTypeChange={setGarmentType}
            onPrintingMethodChange={setPrintingMethod}
            onDesignFilesChange={setDesignFiles}
          />

          {/* B2. Graphic Editing Section */}
          <GraphicEditingSection
            artistFilename={artistFilename}
            mockupImageUrl={mockupImageUrl}
            notesRemarks={notesRemarks}
            printLocations={printLocations}
            onArtistFilenameChange={setArtistFilename}
            onMockupImageUrlChange={setMockupImageUrl}
            onNotesRemarksChange={setNotesRemarks}
            onPrintLocationsChange={setPrintLocations}
          />

          {/* C. Quantities & Size Curve */}
          <QuantitiesSizeSection
            totalQuantity={totalQuantity}
            sizeCurve={sizeCurve}
            onTotalQuantityChange={setTotalQuantity}
            onSizeCurveChange={setSizeCurve}
          />

          {/* D. Variants & Add-ons */}
          <VariantsAddonsSection
            totalQuantity={totalQuantity}
            colorVariants={colorVariants}
            selectedAddOns={selectedAddOns}
            onColorVariantsChange={setColorVariants}
            onAddOnsChange={setSelectedAddOns}
            onPricingUpdate={handlePricingUpdate}
          />

          {/* E. Dates & SLAs */}
          <DatesSLAsSection
            deliveryDate={deliveryDate}
            printingMethod={printingMethod}
            totalQuantity={totalQuantity}
            onDeliveryDateChange={setDeliveryDate}
            onTimelineValidation={handleTimelineValidation}
            onRushSurcharge={handleRushSurcharge}
          />

          {/* G. Production Route */}
          <ProductionRouteSection
            printingMethod={printingMethod}
            totalQuantity={totalQuantity}
            deliveryDate={deliveryDate}
            selectedRoute={selectedRoute}
            onRouteChange={setSelectedRoute}
            onRouteOptimized={handleRouteOptimized}
          />

          {/* H. Files & Notes */}
          <FilesNotesSection
            uploadedFiles={uploadedFiles}
            specialInstructions={specialInstructions}
            onFilesChange={setUploadedFiles}
            onInstructionsChange={setSpecialInstructions}
          />

          {/* I. Submit */}
          <SubmitSection
            formData={{
              selectedClientId,
              selectedBrandId,
              garmentType,
              printingMethod,
              totalQuantity,
              deliveryDate,
              commercials
            }}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* F. Commercials */}
          <CommercialsSection
            totalQuantity={totalQuantity}
            printingMethod={printingMethod}
            garmentType={garmentType}
            addOnsCost={addOnsCost}
            colorVariantsCost={colorVariantsCost}
            rushSurchargePercent={rushSurchargePercent}
            commercials={commercials}
            onCommercialsChange={setCommercials}
          />

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Total Quantity:</span>
                <span className="text-sm font-medium">{totalQuantity.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Design Files:</span>
                <span className="text-sm font-medium">{designFiles.length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Color Variants:</span>
                <span className="text-sm font-medium">{colorVariants.filter(v => v.quantity > 0).length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Add-ons:</span>
                <span className="text-sm font-medium">{selectedAddOns.length}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount:</span>
                <span>₱{commercials.finalTotal.toLocaleString()}</span>
              </div>

              <div className="text-xs text-muted-foreground">
                {commercials.taxInclusive ? 'Tax inclusive' : 'Plus 12% VAT'}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="flex justify-between mb-1">
                  <span>Form Completion:</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <Separator />

              <div className="text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={selectedClientId ? "default" : "secondary"} className="w-3 h-3 rounded-full p-0" />
                  <span>Client & Brand</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={garmentType && printingMethod ? "default" : "secondary"} className="w-3 h-3 rounded-full p-0" />
                  <span>Product & Design</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={totalQuantity > 0 ? "default" : "secondary"} className="w-3 h-3 rounded-full p-0" />
                  <span>Quantities & Sizes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={deliveryDate ? "default" : "secondary"} className="w-3 h-3 rounded-full p-0" />
                  <span>Delivery Date</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={commercials.unitPrice > 0 ? "default" : "secondary"} className="w-3 h-3 rounded-full p-0" />
                  <span>Pricing</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
