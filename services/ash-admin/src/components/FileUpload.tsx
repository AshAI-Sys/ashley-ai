'use client'

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon, File } from 'lucide-react'
import toast from 'react-hot-toast'

interface FileUploadProps {
  onUpload: (url: string, publicId: string) => void
  accept?: string
  maxSizeMB?: number
  folder?: string
  type?: 'image' | 'document' | 'video'
  multiple?: boolean
  existingUrls?: string[]
  onRemove?: (url: string) => void
}

export function FileUpload({
  onUpload,
  accept = 'image/*',
  maxSizeMB = 10,
  folder = 'ashley-ai',
  type = 'image',
  multiple = false,
  existingUrls = [],
  onRemove,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [previewUrls, setPreviewUrls] = useState<string[]>(existingUrls)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const maxSize = maxSizeMB * 1024 * 1024 // Convert to bytes

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Check file size
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Max size is ${maxSizeMB}MB`)
        continue
      }

      await uploadFile(file)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const uploadFile = async (file: File) => {
    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)
      formData.append('type', type)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setUploadProgress(100)
      toast.success('File uploaded successfully!')

      // Add to previews
      setPreviewUrls(prev => [...prev, data.url])

      // Call onUpload callback
      onUpload(data.url, data.public_id)

    } catch (error: any) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload file')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemove = (url: string) => {
    setPreviewUrls(prev => prev.filter(u => u !== url))
    if (onRemove) {
      onRemove(url)
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading... {uploadProgress}%
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload {type === 'image' ? 'Photo' : 'File'}
            </>
          )}
        </button>
        <p className="text-sm text-gray-500">
          Max size: {maxSizeMB}MB
        </p>
      </div>

      {/* Preview Grid */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              {type === 'image' ? (
                <img
                  src={url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                  <File className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemove(url)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
