'use client'

import React, { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  FileImage, 
  File, 
  X, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Upload
} from 'lucide-react'
import { toast } from 'react-hot-toast'

export interface FileUpload {
  file: File | null
  url: string
  uploaded: boolean
  uploading: boolean
  error: string | null
  type: 'mockup' | 'production' | 'separation' | 'embroidery'
  id?: string
}

interface FileUploadZoneProps {
  files: FileUpload[]
  onFilesChange: (files: FileUpload[]) => void
  fileType: 'mockups' | 'production' | 'separations' | 'embroidery'
  title: string
  description?: string
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSize?: number // in MB
  className?: string
}

export default function FileUploadZone({
  files,
  onFilesChange,
  fileType,
  title,
  description,
  accept,
  multiple = false,
  maxFiles = 10,
  maxSize = 50,
  className = ''
}: FileUploadZoneProps) {

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    // Check file type based on fileType
    const validTypes: { [key: string]: string[] } = {
      mockups: ['image/png', 'image/jpeg', 'image/jpg'],
      production: ['application/pdf', 'image/png', 'image/jpeg'],
      separations: ['image/png', 'image/jpeg', 'application/pdf'],
      embroidery: ['application/octet-stream']
    }

    const isValidType = validTypes[fileType]?.includes(file.type) ||
      (fileType === 'embroidery' && (file.name.endsWith('.dst') || file.name.endsWith('.emb')))

    if (!isValidType) {
      return `Invalid file type for ${fileType}`
    }

    return null
  }

  const handleFileUpload = useCallback(async (file: File) => {
    // Validate file
    const validationError = validateFile(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    // Check max files limit
    if (files.length >= maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`)
      return
    }

    const fileUpload: FileUpload = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      url: '',
      uploaded: false,
      uploading: true,
      error: null,
      type: fileType === 'mockups' ? 'mockup' : 
            fileType === 'production' ? 'production' :
            fileType === 'separations' ? 'separation' : 'embroidery'
    }

    // Add uploading file to list
    const newFiles = [...files, fileUpload]
    onFilesChange(newFiles)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', fileType)

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        // Update with successful upload
        const updatedFiles = newFiles.map(f => 
          f.id === fileUpload.id 
            ? { ...f, url: result.url, uploaded: true, uploading: false }
            : f
        )
        onFilesChange(updatedFiles)
        toast.success('File uploaded successfully')
      } else {
        throw new Error(result.message || 'Upload failed')
      }
    } catch (error) {
      // Update with error
      const updatedFiles = newFiles.map(f => 
        f.id === fileUpload.id 
          ? { ...f, uploading: false, error: error instanceof Error ? error.message : 'Upload failed' }
          : f
      )
      onFilesChange(updatedFiles)
      toast.error('Failed to upload file')
    }
  }, [files, onFilesChange, fileType, maxFiles, maxSize])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    
    droppedFiles.forEach(file => {
      handleFileUpload(file)
    })
  }, [handleFileUpload])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    selectedFiles.forEach(file => {
      handleFileUpload(file)
    })
    // Clear input value to allow selecting same file again
    e.target.value = ''
  }

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId)
    onFilesChange(updatedFiles)
  }

  const retryUpload = (fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (file && file.file) {
      const updatedFiles = files.filter(f => f.id !== fileId)
      onFilesChange(updatedFiles)
      handleFileUpload(file.file)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <h4 className="font-medium text-sm mb-1">{title}</h4>
        {description && (
          <p className="text-xs text-muted-foreground mb-3">{description}</p>
        )}
        
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors cursor-pointer"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById(`file-input-${fileType}`)?.click()}
        >
          <div className="text-center">
            <FileImage className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 mb-1">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Max {maxFiles} files, {maxSize}MB each
            </p>
            <input
              id={`file-input-${fileType}`}
              type="file"
              className="hidden"
              multiple={multiple}
              accept={accept}
              onChange={handleFileSelect}
            />
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileUpload) => (
            <div key={fileUpload.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <File className="w-4 h-4 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">
                    {fileUpload.file?.name || 'Unknown file'}
                  </p>
                  {fileUpload.uploading && (
                    <Progress value={50} className="h-1 mt-1" />
                  )}
                  {fileUpload.error && (
                    <p className="text-xs text-red-600 mt-1">{fileUpload.error}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {fileUpload.uploading && (
                  <Clock className="w-4 h-4 text-blue-500 animate-spin" />
                )}
                {fileUpload.uploaded && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {fileUpload.error && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => retryUpload(fileUpload.id!)}
                      className="text-xs px-2 py-1 h-6"
                    >
                      Retry
                    </Button>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(fileUpload.id!)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Summary */}
      {files.length > 0 && (
        <div className="text-xs text-muted-foreground flex justify-between">
          <span>
            {files.filter(f => f.uploaded).length} of {files.length} files uploaded
          </span>
          <span>
            {files.length}/{maxFiles} files
          </span>
        </div>
      )}
    </div>
  )
}