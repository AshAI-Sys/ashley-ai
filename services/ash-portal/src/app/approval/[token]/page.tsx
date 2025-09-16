'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ash-ai/ui/card'
import { Button } from '@ash-ai/ui/button'
import { Badge } from '@ash-ai/ui/badge'
import { Separator } from '@ash-ai/ui/separator'
import { Textarea } from '@ash-ai/ui/textarea'
import { Input } from '@ash-ai/ui/input'
import { Label } from '@ash-ai/ui/label'
import { 
  CheckCircle,
  XCircle,
  MessageCircle,
  Eye,
  Download,
  Image,
  FileText,
  Palette,
  Clock,
  AlertCircle,
  Send,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Paperclip,
  Star,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface ApprovalData {
  id: string
  status: string
  version: number
  comments: string
  expires_at: string
  created_at: string
  design_asset: {
    id: string
    name: string
    method: string
    order: {
      order_number: string
      client: {
        name: string
      }
    }
    brand: {
      name: string
      code: string
    }
  }
  design_version: {
    id: string
    version: number
    files: string
    placements: string
    palette: string
    meta: string
  }
  client: {
    name: string
    email: string
  }
}

export default function ClientApprovalPage() {
  const params = useParams()
  const router = useRouter()
  const [approvalData, setApprovalData] = useState<ApprovalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [decision, setDecision] = useState<'approved' | 'changes_requested' | ''>('')
  const [feedback, setFeedback] = useState('')
  const [approverName, setApproverName] = useState('')
  const [mockupZoom, setMockupZoom] = useState(100)
  const [selectedVariant, setSelectedVariant] = useState(0)
  const [attachments, setAttachments] = useState<File[]>([])
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (params.token) {
      fetchApprovalData(params.token as string)
    }
  }, [params.token])

  const fetchApprovalData = async (token: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/portal/approval/${token}`)
      const data = await response.json()
      
      if (data.success) {
        setApprovalData(data.data)
        
        // Pre-fill client name if available
        if (data.data.client.name) {
          setApproverName(data.data.client.name)
        }
      } else {
        toast.error(data.message || 'Failed to load approval request')
        router.push('/error')
      }
    } catch (error) {
      console.error('Failed to fetch approval data:', error)
      toast.error('Failed to load approval request')
      router.push('/error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitDecision = async () => {
    if (!approvalData || !decision) {
      toast.error('Please select approve or request changes')
      return
    }

    if (decision === 'changes_requested' && !feedback.trim()) {
      toast.error('Please provide feedback for requested changes')
      return
    }

    if (!approverName.trim()) {
      toast.error('Please provide your name')
      return
    }

    try {
      setSubmitting(true)
      
      // Create form data for file upload if there are attachments
      const formData = new FormData()
      formData.append('decision', decision)
      formData.append('feedback', feedback)
      formData.append('approver_name', approverName)
      
      attachments.forEach((file, index) => {
        formData.append(`attachment_${index}`, file)
      })

      const response = await fetch(`/api/portal/approval/${params.token}/submit`, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(
          decision === 'approved' 
            ? 'Design approved successfully!' 
            : 'Feedback submitted successfully!'
        )
        
        // Refresh the page to show updated status
        await fetchApprovalData(params.token as string)
      } else {
        toast.error(result.message || 'Failed to submit decision')
      }
    } catch (error) {
      console.error('Failed to submit decision:', error)
      toast.error('Failed to submit decision')
    } finally {
      setSubmitting(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files)
      setAttachments(prev => [...prev, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SENT': return 'bg-blue-100 text-blue-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'CHANGES_REQUESTED': return 'bg-yellow-100 text-yellow-800'
      case 'EXPIRED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'SILKSCREEN': return 'bg-purple-100 text-purple-800'
      case 'SUBLIMATION': return 'bg-cyan-100 text-cyan-800'
      case 'DTF': return 'bg-orange-100 text-orange-800'
      case 'EMBROIDERY': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading approval request...</p>
        </div>
      </div>
    )
  }

  if (!approvalData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Approval Not Found</h2>
            <p className="text-muted-foreground mb-6">
              This approval link is invalid or has expired.
            </p>
            <Button onClick={() => window.close()}>Close</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const files = JSON.parse(approvalData.design_version.files)
  const placements = JSON.parse(approvalData.design_version.placements)
  const palette = approvalData.design_version.palette ? JSON.parse(approvalData.design_version.palette) : []
  const isExpired = new Date(approvalData.expires_at) < new Date()
  const isCompleted = approvalData.status !== 'SENT'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Design Approval</h1>
              <p className="text-gray-600 mt-1">
                {approvalData.design_asset.name} • {approvalData.design_asset.order.order_number}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(approvalData.status)}>
                {approvalData.status.replace('_', ' ')}
              </Badge>
              <Badge className={getMethodColor(approvalData.design_asset.method)}>
                {approvalData.design_asset.method}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Expiry Warning */}
        {isExpired && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">This approval request has expired</p>
                  <p className="text-sm text-red-600">
                    Expired on {new Date(approvalData.expires_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Status */}
        {isCompleted && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                {approvalData.status === 'APPROVED' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <MessageCircle className="w-5 h-5 text-yellow-600" />
                )}
                <div>
                  <p className="font-medium text-green-800">
                    {approvalData.status === 'APPROVED' 
                      ? 'Thank you! This design has been approved.' 
                      : 'Thank you for your feedback! Changes have been requested.'}
                  </p>
                  <p className="text-sm text-green-600">
                    Submitted on {new Date(approvalData.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Design Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Design Mockup
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setMockupZoom(Math.max(50, mockupZoom - 25))}
                      disabled={mockupZoom <= 50}
                    >
                      <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-mono px-2">{mockupZoom}%</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setMockupZoom(Math.min(200, mockupZoom + 25))}
                      disabled={mockupZoom >= 200}
                    >
                      <ZoomIn className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {files.mockup_url && !imageError ? (
                  <div className="text-center">
                    <img 
                      src={files.mockup_url}
                      alt="Design mockup"
                      className="max-w-full h-auto mx-auto rounded-lg shadow-lg transition-transform duration-200"
                      style={{ 
                        transform: `scale(${mockupZoom / 100})`,
                        transformOrigin: 'center top'
                      }}
                      onError={() => setImageError(true)}
                    />
                    <div className="mt-4 flex justify-center gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={files.mockup_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 mr-1" />
                          View Full Size
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <a href={files.mockup_url} download>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Design preview not available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Design Details */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Placements */}
              {placements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Design Placements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {placements.map((placement: any, index: number) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium capitalize">
                              {placement.area.replace('_', ' ')}
                            </h4>
                            <span className="text-sm text-gray-600">
                              {placement.width_cm} × {placement.height_cm} cm
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            Position: X {placement.offset_x}cm, Y {placement.offset_y}cm
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Color Palette */}
              {palette.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Colors Used
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {palette.map((color: string, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 border border-gray-300 rounded flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-sm font-mono">{color}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Decision Form */}
            {!isCompleted && !isExpired && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Your Decision</CardTitle>
                  <CardDescription>
                    Please review the design carefully and provide your approval or feedback.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Approver Name */}
                  <div>
                    <Label htmlFor="approver_name">Your Name *</Label>
                    <Input
                      id="approver_name"
                      value={approverName}
                      onChange={(e) => setApproverName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Decision Buttons */}
                  <div className="space-y-3">
                    <Label>Your Decision *</Label>
                    <div className="flex gap-3">
                      <Button
                        size="lg"
                        variant={decision === 'approved' ? 'default' : 'outline'}
                        className={`flex-1 ${decision === 'approved' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        onClick={() => setDecision('approved')}
                      >
                        <ThumbsUp className="w-5 h-5 mr-2" />
                        Approve Design
                      </Button>
                      <Button
                        size="lg"
                        variant={decision === 'changes_requested' ? 'default' : 'outline'}
                        className={`flex-1 ${decision === 'changes_requested' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
                        onClick={() => setDecision('changes_requested')}
                      >
                        <ThumbsDown className="w-5 h-5 mr-2" />
                        Request Changes
                      </Button>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div>
                    <Label htmlFor="feedback">
                      {decision === 'changes_requested' ? 'What changes would you like? *' : 'Additional Comments (Optional)'}
                    </Label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder={
                        decision === 'changes_requested'
                          ? "Please be specific about what changes you'd like to see..."
                          : "Any additional comments or notes..."
                      }
                      rows={4}
                      className={decision === 'changes_requested' ? 'border-yellow-300' : ''}
                    />
                  </div>

                  {/* File Attachments */}
                  <div>
                    <Label>Attachments (Optional)</Label>
                    <div className="space-y-3">
                      <div>
                        <input
                          type="file"
                          multiple
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <Button variant="outline" asChild>
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <Paperclip className="w-4 h-4 mr-2" />
                            Add Files
                          </label>
                        </Button>
                      </div>
                      
                      {attachments.length > 0 && (
                        <div className="space-y-2">
                          {attachments.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <span className="text-sm">{file.name}</span>
                                <span className="text-xs text-gray-500">
                                  ({formatFileSize(file.size)})
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeAttachment(index)}
                              >
                                <XCircle className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    size="lg"
                    onClick={handleSubmitDecision}
                    disabled={submitting || !decision || !approverName.trim() || (decision === 'changes_requested' && !feedback.trim())}
                    className="w-full"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {submitting 
                      ? 'Submitting...' 
                      : decision === 'approved' 
                        ? 'Submit Approval' 
                        : 'Submit Feedback'
                    }
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>Order Number:</strong><br />
                  {approvalData.design_asset.order.order_number}
                </div>
                <Separator />
                <div>
                  <strong>Client:</strong><br />
                  {approvalData.design_asset.order.client.name}
                </div>
                <Separator />
                <div>
                  <strong>Brand:</strong><br />
                  {approvalData.design_asset.brand.name}
                </div>
                <Separator />
                <div>
                  <strong>Print Method:</strong><br />
                  <Badge className={getMethodColor(approvalData.design_asset.method)} variant="outline">
                    {approvalData.design_asset.method}
                  </Badge>
                </div>
                <Separator />
                <div>
                  <strong>Design Version:</strong><br />
                  v{approvalData.version}
                </div>
                <Separator />
                <div>
                  <strong>Approval Sent:</strong><br />
                  {new Date(approvalData.created_at).toLocaleDateString()}
                </div>
                {approvalData.expires_at && (
                  <>
                    <div>
                      <strong>Expires:</strong><br />
                      <span className={isExpired ? 'text-red-600' : 'text-gray-900'}>
                        {new Date(approvalData.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-3">
                  If you have questions about this design or need clarification, please contact us:
                </p>
                <div className="space-y-2">
                  <p><strong>Email:</strong> support@ashleyai.com</p>
                  <p><strong>Phone:</strong> +63 123 456 7890</p>
                </div>
              </CardContent>
            </Card>

            {/* Quality Assurance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Quality Promise
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>AI-validated print quality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Color accuracy guaranteed</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Professional production standards</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}