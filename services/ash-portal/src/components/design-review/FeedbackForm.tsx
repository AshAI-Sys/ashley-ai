'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@ash-ai/ui/card'
import { Button } from '@ash-ai/ui/button'
import { Textarea } from '@ash-ai/ui/textarea'
import { Input } from '@ash-ai/ui/input'
import { Label } from '@ash-ai/ui/label'
import { Badge } from '@ash-ai/ui/badge'
import { 
  MessageCircle, 
  Paperclip, 
  X, 
  FileText, 
  Image as ImageIcon,
  Send,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle
} from 'lucide-react'

interface FeedbackFormProps {
  designName: string
  version: number
  onSubmit: (data: FeedbackData) => void
  submitting?: boolean
  disabled?: boolean
  className?: string
}

interface FeedbackData {
  rating?: number
  feedback: string
  change_requests?: string[]
  attachments: File[]
  priority: 'low' | 'normal' | 'high' | 'urgent'
}

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low Priority', color: 'bg-gray-100 text-gray-800', icon: '🔵' },
  { value: 'normal', label: 'Normal', color: 'bg-blue-100 text-blue-800', icon: '🟡' },
  { value: 'high', label: 'High Priority', color: 'bg-orange-100 text-orange-800', icon: '🟠' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800', icon: '🔴' }
]

const QUICK_FEEDBACK_OPTIONS = [
  "The colors look great!",
  "Perfect size and placement",
  "Love the overall design",
  "Please make the text larger",
  "Can we change the color scheme?",
  "The logo needs to be bigger",
  "Move the design to the center",
  "Use a different font style",
  "Add more contrast",
  "Remove the background element"
]

export function FeedbackForm({ 
  designName, 
  version, 
  onSubmit, 
  submitting = false, 
  disabled = false,
  className = '' 
}: FeedbackFormProps) {
  const [rating, setRating] = useState<number | undefined>()
  const [feedback, setFeedback] = useState('')
  const [changeRequests, setChangeRequests] = useState<string[]>([])
  const [newChangeRequest, setNewChangeRequest] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [priority, setPriority] = useState<'low' | 'normal' | 'high' | 'urgent'>('normal')

  const handleSubmit = () => {
    if (!feedback.trim()) return

    const data: FeedbackData = {
      rating,
      feedback: feedback.trim(),
      change_requests: changeRequests.filter(req => req.trim()),
      attachments,
      priority
    }

    onSubmit(data)
  }

  const addChangeRequest = () => {
    if (newChangeRequest.trim()) {
      setChangeRequests(prev => [...prev, newChangeRequest.trim()])
      setNewChangeRequest('')
    }
  }

  const removeChangeRequest = (index: number) => {
    setChangeRequests(prev => prev.filter((_, i) => i !== index))
  }

  const addQuickFeedback = (text: string) => {
    if (feedback.trim()) {
      setFeedback(prev => prev + '\n' + text)
    } else {
      setFeedback(text)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files).filter(file => {
        // Limit file size to 10MB
        if (file.size > 10 * 1024 * 1024) {
          alert(`File "${file.name}" is too large. Maximum size is 10MB.`)
          return false
        }
        return true
      })
      setAttachments(prev => [...prev, ...newFiles])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isSubmitDisabled = disabled || submitting || !feedback.trim()
  const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === priority)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Your Feedback
          <Badge variant="outline">v{version}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating */}
        <div>
          <Label className="text-base font-medium mb-3 block">
            How do you feel about this design? (Optional)
          </Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(rating === star ? undefined : star)}
                className={`p-2 rounded transition-colors ${
                  rating && rating >= star 
                    ? 'text-yellow-500 hover:text-yellow-600' 
                    : 'text-gray-300 hover:text-yellow-400'
                }`}
                disabled={disabled}
              >
                <Star className={`w-6 h-6 ${rating && rating >= star ? 'fill-current' : ''}`} />
              </button>
            ))}
          </div>
          {rating && (
            <p className="text-sm text-muted-foreground mt-2">
              {rating === 1 && "We'll work on improvements"}
              {rating === 2 && "Thanks for the feedback"}
              {rating === 3 && "Good to know your thoughts"}
              {rating === 4 && "Great! We're glad you like it"}
              {rating === 5 && "Awesome! We're thrilled you love it"}
            </p>
          )}
        </div>

        {/* Quick Feedback Options */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Quick Feedback</Label>
          <div className="flex flex-wrap gap-2">
            {QUICK_FEEDBACK_OPTIONS.map((option, index) => (
              <Button
                key={index}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addQuickFeedback(option)}
                disabled={disabled}
                className="text-xs"
              >
                {option}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Feedback */}
        <div>
          <Label htmlFor="feedback" className="text-base font-medium">
            Your Comments *
          </Label>
          <Textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Please share your thoughts about this design. Be as specific as possible to help us understand what you'd like to see..."
            rows={6}
            disabled={disabled}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {feedback.length}/1000 characters
          </p>
        </div>

        {/* Change Requests */}
        <div>
          <Label className="text-base font-medium mb-2 block">
            Specific Change Requests (Optional)
          </Label>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newChangeRequest}
                onChange={(e) => setNewChangeRequest(e.target.value)}
                placeholder="e.g., Make the logo 20% bigger"
                disabled={disabled}
                onKeyPress={(e) => e.key === 'Enter' && addChangeRequest()}
              />
              <Button 
                type="button"
                onClick={addChangeRequest}
                disabled={disabled || !newChangeRequest.trim()}
                size="sm"
              >
                Add
              </Button>
            </div>
            
            {changeRequests.length > 0 && (
              <div className="space-y-2">
                {changeRequests.map((request, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <span className="text-sm">{request}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeChangeRequest(index)}
                      disabled={disabled}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Priority */}
        <div>
          <Label className="text-base font-medium mb-3 block">
            Priority Level
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {PRIORITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPriority(option.value as any)}
                disabled={disabled}
                className={`
                  p-3 border rounded-lg text-center transition-colors
                  ${priority === option.value 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="text-lg mb-1">{option.icon}</div>
                <div className="text-xs font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* File Attachments */}
        <div>
          <Label className="text-base font-medium mb-2 block">
            Attachments (Optional)
          </Label>
          <div className="space-y-3">
            <div>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                disabled={disabled}
                className="hidden"
                id="file-upload"
              />
              <Button variant="outline" asChild disabled={disabled}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Add Files
                </label>
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Max 10MB per file. Images, PDFs, and documents only.
              </p>
            </div>
            
            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border rounded">
                    <div className="flex items-center gap-2">
                      {file.type.startsWith('image/') ? (
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-gray-500" />
                      )}
                      <div>
                        <div className="text-sm font-medium">{file.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAttachment(index)}
                      disabled={disabled}
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            size="lg"
            className="w-full"
          >
            <Send className="w-5 h-5 mr-2" />
            {submitting ? 'Submitting Feedback...' : 'Submit Feedback'}
          </Button>
          
          {selectedPriority && priority !== 'normal' && (
            <div className={`mt-3 p-3 rounded-lg ${selectedPriority.color}`}>
              <div className="flex items-center gap-2">
                {priority === 'urgent' && <AlertTriangle className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {priority === 'high' && 'High priority feedback will be reviewed within 4 hours'}
                  {priority === 'urgent' && 'Urgent feedback will be reviewed immediately'}
                  {priority === 'low' && 'Low priority feedback will be reviewed within 24 hours'}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}