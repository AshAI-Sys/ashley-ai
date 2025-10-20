'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Upload, X, User } from 'lucide-react'
import Image from 'next/image'

interface ProfilePictureUploadProps {
  currentPicture?: string | null
  employeeId: string
  employeeName: string
  onUploadSuccess?: (url: string) => void
  onDeleteSuccess?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function ProfilePictureUpload({
  currentPicture,
  employeeId,
  employeeName,
  onUploadSuccess,
  onDeleteSuccess,
  size = 'md'
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentPicture || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload to server
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`/api/hr/employees/${employeeId}/profile-picture`, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      setPreview(data.profile_picture)
      onUploadSuccess?.(data.profile_picture)

      // Show success message
      alert('Profile picture uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload profile picture')
      setPreview(currentPicture || null)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove this profile picture?')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/hr/employees/${employeeId}/profile-picture`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Delete failed')
      }

      setPreview(null)
      onDeleteSuccess?.()
      alert('Profile picture removed successfully!')
    } catch (error) {
      console.error('Delete error:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete profile picture')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizeClasses[size]} relative rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200`}>
        {preview ? (
          <Image
            src={preview}
            alt={employeeName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <User className="w-1/2 h-1/2 text-gray-400" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || deleting}
            className="text-white"
          >
            <Camera className="w-6 h-6" />
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || deleting}
        >
          {uploading ? (
            <>
              <Upload className="w-3 h-3 mr-1 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-3 h-3 mr-1" />
              Upload
            </>
          )}
        </Button>

        {preview && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleDelete}
            disabled={uploading || deleting}
          >
            {deleting ? (
              <>
                <X className="w-3 h-3 mr-1 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <X className="w-3 h-3 mr-1" />
                Remove
              </>
            )}
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        Max 5MB • JPG, PNG, WebP
      </p>
    </div>
  )
}
