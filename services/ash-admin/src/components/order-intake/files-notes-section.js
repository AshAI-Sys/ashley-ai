'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Upload,
  X,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Download,
  Eye,
  Sparkles,
  AlertCircle,
  CheckCircle,
  FileImage
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export function FilesNotesSection({
  uploadedFiles,
  specialInstructions,
  onFilesChange,
  onInstructionsChange
}) {
  const [dragActive, setDragActive] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const fileInputRef = useRef(null)

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
  }

  const handleFiles = async (files) => {
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Max size is 10MB.`)
        return false
      }
      return true
    })

    const newFiles = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      category: getCategoryFromType(file.type),
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      uploadProgress: 0,
      uploaded: false
    }))

    const updatedFiles = [...uploadedFiles, ...newFiles]
    onFilesChange(updatedFiles)

    // Simulate upload
    for (const newFile of newFiles) {
      await simulateUpload(newFile, updatedFiles)
    }
  }

  const simulateUpload = async (file, allFiles) => {
    for (let progress = 0; progress <= 100; progress += 20) {
      await new Promise(resolve => setTimeout(resolve, 200))

      const updatedFiles = allFiles.map(f =>
        f.id === file.id ? { ...f, uploadProgress: progress } : f
      )
      onFilesChange(updatedFiles)
    }

    // Mark as uploaded and analyze
    const uploadedFile = { ...file, uploaded: true, uploadProgress: 100 }
    const finalFiles = allFiles.map(f =>
      f.id === file.id ? uploadedFile : f
    )
    onFilesChange(finalFiles)

    // Run Ashley AI analysis for design files
    if (file.category === 'design') {
      await runAshleyAnalysis(file, finalFiles)
    }
  }

  const runAshleyAnalysis = async (file, allFiles) => {
    setAnalyzing(true)

    // Simulate Ashley AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000))

    const analysis = {
      requirements: [
        'High-resolution vector format detected',
        'Color profile suitable for fabric printing',
        'Design size: 12" x 8" recommended'
      ],
      suggestions: [
        'Consider adding bleed area for edge-to-edge printing',
        'Optimize color count for cost efficiency',
        'Test print recommended for color accuracy'
      ],
      warnings: file.name.toLowerCase().includes('.jpg') ? [
        'JPEG format may cause quality loss - Vector format preferred'
      ] : [],
      feasible: true
    }

    const analyzedFiles = allFiles.map(f =>
      f.id === file.id ? { ...f, ashleyAnalysis: analysis } : f
    )
    onFilesChange(analyzedFiles)
    setAnalyzing(false)

    toast.success(`Ashley AI analysis complete for ${file.name}`)
  }

  const removeFile = (fileId) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId)
    onFilesChange(updatedFiles)
    toast.success('File removed')
  }

  const getCategoryFromType = (type) => {
    if (type.startsWith('image/')) return 'design'
    if (type.includes('pdf')) return 'document'
    if (type.includes('spreadsheet') || type.includes('excel')) return 'spreadsheet'
    return 'other'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (category, type) => {
    switch (category) {
      case 'design':
        return type.includes('svg') ? FileImage : Image
      case 'document':
        return FileText
      case 'spreadsheet':
        return FileSpreadsheet
      default:
        return File
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          I. Files & Special Instructions
          <Badge variant="outline">Optional</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Zone */}
        <div>
          <Label className="mb-3 block">Design Files & Documents</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Design Files
            </h3>
            <p className="text-gray-600 mb-4">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Supports: PNG, JPG, SVG, PDF, AI, PSD (Max 10MB each)
            </p>

            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto"
            >
              Browse Files
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.svg,.pdf,.ai,.psd,.eps"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div>
            <Label className="mb-3 block">Uploaded Files ({uploadedFiles.length})</Label>
            <div className="space-y-3">
              {uploadedFiles.map((file) => {
                const FileIcon = getFileIcon(file.category, file.type)

                return (
                  <div
                    key={file.id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-start gap-3">
                      <FileIcon className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 truncate">
                              {file.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {file.size} • {file.category}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            {file.preview && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(file.preview)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {!file.uploaded && (
                          <div className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Uploading...</span>
                              <span>{file.uploadProgress}%</span>
                            </div>
                            <Progress value={file.uploadProgress} className="h-2" />
                          </div>
                        )}

                        {file.uploaded && file.ashleyAnalysis && (
                          <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Sparkles className="w-4 h-4 text-purple-600" />
                              <span className="font-medium text-purple-900">Ashley AI Analysis</span>
                              {file.ashleyAnalysis.feasible ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>

                            <div className="space-y-2 text-sm">
                              {file.ashleyAnalysis.requirements.length > 0 && (
                                <div>
                                  <span className="font-medium text-purple-800">Requirements:</span>
                                  <ul className="mt-1 space-y-1">
                                    {file.ashleyAnalysis.requirements.map((req, i) => (
                                      <li key={i} className="text-purple-700 flex items-start gap-1">
                                        <span className="text-green-500 mt-1">✓</span>
                                        {req}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {file.ashleyAnalysis.suggestions.length > 0 && (
                                <div>
                                  <span className="font-medium text-purple-800">Suggestions:</span>
                                  <ul className="mt-1 space-y-1">
                                    {file.ashleyAnalysis.suggestions.map((sug, i) => (
                                      <li key={i} className="text-purple-700 flex items-start gap-1">
                                        <span className="text-blue-500 mt-1">•</span>
                                        {sug}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {file.ashleyAnalysis.warnings.length > 0 && (
                                <div>
                                  <span className="font-medium text-red-800">Warnings:</span>
                                  <ul className="mt-1 space-y-1">
                                    {file.ashleyAnalysis.warnings.map((warn, i) => (
                                      <li key={i} className="text-red-700 flex items-start gap-1">
                                        <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                        {warn}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Ashley AI File Analysis Status */}
        {analyzing && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
              <span className="text-purple-900 font-medium">
                Ashley AI is analyzing uploaded design files...
              </span>
            </div>
          </div>
        )}

        {/* Special Instructions */}
        <div>
          <Label htmlFor="instructions" className="mb-3 block">
            Special Instructions & Notes
          </Label>
          <Textarea
            id="instructions"
            value={specialInstructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
            placeholder="Enter any special requirements, color matching instructions, placement notes, or other important details..."
            className="min-h-32"
          />
          <p className="text-sm text-gray-500 mt-2">
            Include any specific requirements for colors, placement, materials, or finishing touches.
          </p>
        </div>

        {/* File Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">File Guidelines</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <strong>Vector files:</strong> AI, EPS, SVG (preferred for scalability)</p>
            <p>• <strong>Raster files:</strong> PNG, PSD (minimum 300 DPI)</p>
            <p>• <strong>Documents:</strong> PDF for tech packs and specifications</p>
            <p>• <strong>Color mode:</strong> CMYK for printing, RGB for digital mockups</p>
            <p>• <strong>Resolution:</strong> Minimum 300 DPI for print quality</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}