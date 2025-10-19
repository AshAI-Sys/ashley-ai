/**
 * File Validator Utility - Unit Tests
 *
 * Comprehensive test suite for file validation utilities
 * Tests file size, MIME types, extensions, magic bytes, sanitization, and security
 *
 * Total: 40 tests
 */

import { describe, it, expect } from '@jest/globals'

// File validation utility functions
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_DOCUMENT_SIZE = 20 * 1024 * 1024 // 20MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]

const DANGEROUS_EXTENSIONS = ['.exe', '.bat', '.cmd', '.sh', '.js', '.vbs', '.scr', '.pif', '.app', '.jar']

// Magic bytes for file type verification
const MAGIC_BYTES: Record<string, string[]> = {
  'image/jpeg': ['FFD8FF'],
  'image/png': ['89504E47'],
  'image/gif': ['474946383761', '474946383961'], // GIF87a, GIF89a
  'application/pdf': ['25504446'],
  'application/zip': ['504B0304', '504B0506'], // ZIP, DOCX, XLSX are ZIP-based
}

interface ValidationResult {
  valid: boolean
  error?: string
  warnings?: string[]
}

interface FileInfo {
  name: string
  size: number
  type: string
  buffer?: Buffer
}

/**
 * Validate file size
 */
function validateFileSize(size: number, maxSize: number = MAX_FILE_SIZE): ValidationResult {
  if (size === 0) {
    return { valid: false, error: 'File is empty' }
  }

  if (size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(1)
    const actualMB = (size / (1024 * 1024)).toFixed(2)
    return {
      valid: false,
      error: `File size (${actualMB}MB) exceeds maximum allowed size (${maxMB}MB)`
    }
  }

  return { valid: true }
}

/**
 * Validate MIME type
 */
function validateMimeType(mimeType: string, allowedTypes: string[]): ValidationResult {
  if (!mimeType) {
    return { valid: false, error: 'MIME type is required' }
  }

  if (!allowedTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `File type ${mimeType} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    }
  }

  return { valid: true }
}

/**
 * Validate file extension
 */
function validateExtension(filename: string, mimeType?: string): ValidationResult {
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'))

  if (!ext || ext === filename.toLowerCase()) {
    return { valid: false, error: 'File must have an extension' }
  }

  // Check for dangerous extensions
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return { valid: false, error: `File extension ${ext} is not allowed for security reasons` }
  }

  // Check for double extensions (e.g., file.pdf.exe)
  const parts = filename.toLowerCase().split('.')
  if (parts.length > 2) {
    const secondLastExt = '.' + parts[parts.length - 2]
    if (DANGEROUS_EXTENSIONS.includes(secondLastExt)) {
      return { valid: false, error: 'File has suspicious double extension' }
    }
  }

  // Verify extension matches MIME type if provided
  if (mimeType) {
    const expectedExtensions: Record<string, string[]> = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }

    const allowed = expectedExtensions[mimeType]
    if (allowed && !allowed.includes(ext)) {
      return {
        valid: false,
        error: `File extension ${ext} does not match MIME type ${mimeType}. Expected: ${allowed.join(' or ')}`
      }
    }
  }

  return { valid: true }
}

/**
 * Verify magic bytes match MIME type
 */
function verifyMagicBytes(buffer: Buffer, expectedMimeType: string): ValidationResult {
  const hex = buffer.toString('hex', 0, Math.min(buffer.length, 12)).toUpperCase()

  const expectedSignatures = MAGIC_BYTES[expectedMimeType]
  if (!expectedSignatures) {
    return { valid: true, warnings: ['No magic byte signature available for verification'] }
  }

  const matches = expectedSignatures.some(signature => hex.startsWith(signature))

  if (!matches) {
    return {
      valid: false,
      error: `File content does not match declared type ${expectedMimeType}. Possible file type spoofing.`
    }
  }

  return { valid: true }
}

/**
 * Sanitize filename
 */
function sanitizeFilename(filename: string): string {
  // Remove path traversal attempts
  let safe = filename.replace(/\.\./g, '')
  safe = safe.replace(/[\/\\]/g, '')

  // Remove control characters and special characters
  safe = safe.replace(/[\x00-\x1F\x7F]/g, '')
  safe = safe.replace(/[<>:"|?*]/g, '')

  // Limit length
  const MAX_FILENAME_LENGTH = 255
  if (safe.length > MAX_FILENAME_LENGTH) {
    const ext = safe.substring(safe.lastIndexOf('.'))
    const nameWithoutExt = safe.substring(0, safe.lastIndexOf('.'))
    safe = nameWithoutExt.substring(0, MAX_FILENAME_LENGTH - ext.length) + ext
  }

  // Ensure filename is not empty after sanitization
  if (!safe || safe.trim() === '') {
    safe = 'unnamed_file'
  }

  return safe
}

/**
 * Generate safe unique filename
 */
function generateSafeFilename(originalFilename: string): string {
  const sanitized = sanitizeFilename(originalFilename)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)

  const ext = sanitized.substring(sanitized.lastIndexOf('.'))
  const nameWithoutExt = sanitized.substring(0, sanitized.lastIndexOf('.'))

  return `${nameWithoutExt}_${timestamp}_${random}${ext}`
}

/**
 * Perform security checks on file
 */
function performSecurityChecks(fileInfo: FileInfo): ValidationResult {
  const warnings: string[] = []

  // Check for null bytes (can bypass some security filters)
  if (fileInfo.name.includes('\0')) {
    return { valid: false, error: 'Filename contains null bytes' }
  }

  // Check for embedded scripts in filenames
  const scriptPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i
  ]

  for (const pattern of scriptPatterns) {
    if (pattern.test(fileInfo.name)) {
      return { valid: false, error: 'Filename contains potentially malicious content' }
    }
  }

  // Check buffer if provided
  if (fileInfo.buffer) {
    const content = fileInfo.buffer.toString('utf-8', 0, Math.min(fileInfo.buffer.length, 1024))

    // Check for executable signatures
    if (content.startsWith('MZ') || content.startsWith('#!/')) {
      warnings.push('File may contain executable code')
    }

    // Check for script tags in uploads
    if (/<script/i.test(content) || /javascript:/i.test(content)) {
      warnings.push('File may contain embedded scripts')
    }
  }

  return { valid: true, warnings }
}

/**
 * Validate multiple files
 */
function validateMultipleFiles(
  files: FileInfo[],
  maxFiles: number = 10,
  totalMaxSize: number = 50 * 1024 * 1024 // 50MB total
): ValidationResult {
  if (files.length === 0) {
    return { valid: false, error: 'No files provided' }
  }

  if (files.length > maxFiles) {
    return { valid: false, error: `Too many files. Maximum ${maxFiles} files allowed` }
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  if (totalSize > totalMaxSize) {
    const maxMB = (totalMaxSize / (1024 * 1024)).toFixed(1)
    const actualMB = (totalSize / (1024 * 1024)).toFixed(2)
    return {
      valid: false,
      error: `Total file size (${actualMB}MB) exceeds maximum allowed (${maxMB}MB)`
    }
  }

  return { valid: true }
}

/**
 * Complete file validation
 */
function validateFile(fileInfo: FileInfo, category: 'image' | 'document' = 'image'): ValidationResult {
  // Sanitize filename first
  const sanitized = sanitizeFilename(fileInfo.name)
  if (sanitized !== fileInfo.name) {
    return {
      valid: false,
      error: 'Filename contains invalid characters or path traversal attempts'
    }
  }

  // Validate file size
  const maxSize = category === 'image' ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE
  const sizeResult = validateFileSize(fileInfo.size, maxSize)
  if (!sizeResult.valid) return sizeResult

  // Validate MIME type
  const allowedTypes = category === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES
  const mimeResult = validateMimeType(fileInfo.type, allowedTypes)
  if (!mimeResult.valid) return mimeResult

  // Validate extension
  const extResult = validateExtension(fileInfo.name, fileInfo.type)
  if (!extResult.valid) return extResult

  // Verify magic bytes if buffer provided
  if (fileInfo.buffer) {
    const magicResult = verifyMagicBytes(fileInfo.buffer, fileInfo.type)
    if (!magicResult.valid) return magicResult
  }

  // Security checks
  const securityResult = performSecurityChecks(fileInfo)
  if (!securityResult.valid) return securityResult

  return {
    valid: true,
    warnings: securityResult.warnings
  }
}

describe('File Validator Utility', () => {

  describe('validateFileSize() - File Size Validation', () => {
    it('should reject empty file', () => {
      const result = validateFileSize(0)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('File is empty')
    })

    it('should accept file within size limit', () => {
      const result = validateFileSize(5 * 1024 * 1024) // 5MB
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject file exceeding default limit', () => {
      const result = validateFileSize(15 * 1024 * 1024) // 15MB (exceeds 10MB default)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('exceeds maximum allowed size')
      expect(result.error).toContain('15.00MB')
    })

    it('should accept file within custom size limit', () => {
      const customMax = 20 * 1024 * 1024 // 20MB
      const result = validateFileSize(15 * 1024 * 1024, customMax)
      expect(result.valid).toBe(true)
    })

    it('should reject file exactly at boundary', () => {
      const maxSize = 10 * 1024 * 1024
      const result = validateFileSize(maxSize + 1, maxSize)
      expect(result.valid).toBe(false)
    })
  })

  describe('validateMimeType() - MIME Type Validation', () => {
    it('should accept allowed image MIME type', () => {
      const result = validateMimeType('image/jpeg', ALLOWED_IMAGE_TYPES)
      expect(result.valid).toBe(true)
    })

    it('should reject disallowed MIME type', () => {
      const result = validateMimeType('application/x-executable', ALLOWED_IMAGE_TYPES)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('not allowed')
    })

    it('should reject empty MIME type', () => {
      const result = validateMimeType('', ALLOWED_IMAGE_TYPES)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('MIME type is required')
    })

    it('should accept all allowed image types', () => {
      for (const mimeType of ALLOWED_IMAGE_TYPES) {
        const result = validateMimeType(mimeType, ALLOWED_IMAGE_TYPES)
        expect(result.valid).toBe(true)
      }
    })

    it('should accept allowed document MIME types', () => {
      const result = validateMimeType('application/pdf', ALLOWED_DOCUMENT_TYPES)
      expect(result.valid).toBe(true)
    })
  })

  describe('validateExtension() - Extension Validation', () => {
    it('should accept valid image extension', () => {
      const result = validateExtension('photo.jpg')
      expect(result.valid).toBe(true)
    })

    it('should reject file without extension', () => {
      const result = validateExtension('document')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('File must have an extension')
    })

    it('should reject dangerous executable extension', () => {
      const result = validateExtension('malware.exe')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('not allowed for security reasons')
    })

    it('should reject double extension attack', () => {
      const result = validateExtension('invoice.pdf.exe')
      expect(result.valid).toBe(false)
      // Can catch either the .exe itself or the double extension pattern
      expect(result.error).toMatch(/not allowed for security reasons|suspicious double extension/)
    })

    it('should reject extension mismatch with MIME type', () => {
      const result = validateExtension('photo.jpg', 'application/pdf')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('does not match MIME type')
    })

    it('should accept extension matching MIME type', () => {
      const result = validateExtension('document.pdf', 'application/pdf')
      expect(result.valid).toBe(true)
    })

    it('should handle case-insensitive extensions', () => {
      const result1 = validateExtension('PHOTO.JPG')
      const result2 = validateExtension('photo.jpg')
      expect(result1.valid).toBe(true)
      expect(result2.valid).toBe(true)
    })
  })

  describe('verifyMagicBytes() - File Signature Verification', () => {
    it('should verify JPEG magic bytes', () => {
      const buffer = Buffer.from('FFD8FFE0001049464946', 'hex')
      const result = verifyMagicBytes(buffer, 'image/jpeg')
      expect(result.valid).toBe(true)
    })

    it('should verify PNG magic bytes', () => {
      const buffer = Buffer.from('89504E470D0A1A0A', 'hex')
      const result = verifyMagicBytes(buffer, 'image/png')
      expect(result.valid).toBe(true)
    })

    it('should verify GIF87a magic bytes', () => {
      const buffer = Buffer.from('474946383761', 'hex')
      const result = verifyMagicBytes(buffer, 'image/gif')
      expect(result.valid).toBe(true)
    })

    it('should verify PDF magic bytes', () => {
      const buffer = Buffer.from('255044462D312E34', 'hex')
      const result = verifyMagicBytes(buffer, 'application/pdf')
      expect(result.valid).toBe(true)
    })

    it('should detect file type spoofing', () => {
      // PNG magic bytes but claimed as JPEG
      const buffer = Buffer.from('89504E470D0A1A0A', 'hex')
      const result = verifyMagicBytes(buffer, 'image/jpeg')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('does not match declared type')
      expect(result.error).toContain('spoofing')
    })

    it('should handle unknown MIME types gracefully', () => {
      const buffer = Buffer.from('00000000', 'hex')
      const result = verifyMagicBytes(buffer, 'application/unknown')
      expect(result.valid).toBe(true)
      expect(result.warnings).toContain('No magic byte signature available for verification')
    })
  })

  describe('sanitizeFilename() - Filename Sanitization', () => {
    it('should remove path traversal attempts', () => {
      const result = sanitizeFilename('../../../etc/passwd')
      expect(result).not.toContain('..')
      expect(result).not.toContain('/')
    })

    it('should remove backslashes', () => {
      const result = sanitizeFilename('..\\..\\windows\\system32')
      expect(result).not.toContain('\\')
      expect(result).not.toContain('..')
    })

    it('should remove special characters', () => {
      const result = sanitizeFilename('file<>:"|?*.txt')
      expect(result).not.toContain('<')
      expect(result).not.toContain('>')
      expect(result).not.toContain(':')
      expect(result).not.toContain('"')
      expect(result).not.toContain('|')
      expect(result).not.toContain('?')
    })

    it('should preserve valid filename', () => {
      const result = sanitizeFilename('my-photo_2024.jpg')
      expect(result).toBe('my-photo_2024.jpg')
    })

    it('should truncate very long filenames', () => {
      const longName = 'a'.repeat(300) + '.txt'
      const result = sanitizeFilename(longName)
      expect(result.length).toBeLessThanOrEqual(255)
      expect(result).toContain('.txt')
    })

    it('should handle empty filename', () => {
      const result = sanitizeFilename('')
      expect(result).toBe('unnamed_file')
    })

    it('should handle filename with only special characters', () => {
      const result = sanitizeFilename('<>:"|?*')
      expect(result).toBe('unnamed_file')
    })
  })

  describe('generateSafeFilename() - Unique Filename Generation', () => {
    it('should generate unique filename', () => {
      const result1 = generateSafeFilename('photo.jpg')
      const result2 = generateSafeFilename('photo.jpg')
      expect(result1).not.toBe(result2)
    })

    it('should preserve file extension', () => {
      const result = generateSafeFilename('document.pdf')
      expect(result).toContain('.pdf')
    })

    it('should sanitize original filename', () => {
      const result = generateSafeFilename('../../../malicious.jpg')
      expect(result).not.toContain('..')
      expect(result).not.toContain('/')
      expect(result).toContain('.jpg')
    })

    it('should include timestamp in filename', () => {
      const before = Date.now()
      const result = generateSafeFilename('file.txt')
      const after = Date.now()

      // Extract timestamp from filename (format: name_TIMESTAMP_RANDOM.ext)
      const parts = result.split('_')
      const timestamp = parseInt(parts[parts.length - 2])

      expect(timestamp).toBeGreaterThanOrEqual(before)
      expect(timestamp).toBeLessThanOrEqual(after)
    })
  })

  describe('performSecurityChecks() - Security Validation', () => {
    it('should detect null bytes in filename', () => {
      const fileInfo: FileInfo = {
        name: 'file\0.jpg',
        size: 1024,
        type: 'image/jpeg'
      }
      const result = performSecurityChecks(fileInfo)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('null bytes')
    })

    it('should detect script tags in filename', () => {
      const fileInfo: FileInfo = {
        name: 'photo<script>alert(1)</script>.jpg',
        size: 1024,
        type: 'image/jpeg'
      }
      const result = performSecurityChecks(fileInfo)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('malicious')
    })

    it('should detect javascript: in filename', () => {
      const fileInfo: FileInfo = {
        name: 'javascript:alert(1).jpg',
        size: 1024,
        type: 'image/jpeg'
      }
      const result = performSecurityChecks(fileInfo)
      expect(result.valid).toBe(false)
    })

    it('should warn about executable signatures', () => {
      const fileInfo: FileInfo = {
        name: 'file.jpg',
        size: 1024,
        type: 'image/jpeg',
        buffer: Buffer.from('MZ\x90\x00') // DOS executable header
      }
      const result = performSecurityChecks(fileInfo)
      expect(result.valid).toBe(true)
      expect(result.warnings).toContain('File may contain executable code')
    })

    it('should warn about embedded scripts in content', () => {
      const fileInfo: FileInfo = {
        name: 'file.html',
        size: 1024,
        type: 'text/html',
        buffer: Buffer.from('<html><script>alert(1)</script></html>')
      }
      const result = performSecurityChecks(fileInfo)
      expect(result.valid).toBe(true)
      expect(result.warnings).toContain('File may contain embedded scripts')
    })

    it('should pass clean file without warnings', () => {
      const fileInfo: FileInfo = {
        name: 'photo.jpg',
        size: 1024,
        type: 'image/jpeg',
        buffer: Buffer.from('FFD8FFE0', 'hex')
      }
      const result = performSecurityChecks(fileInfo)
      expect(result.valid).toBe(true)
      expect(result.warnings || []).toHaveLength(0)
    })
  })

  describe('validateMultipleFiles() - Batch Validation', () => {
    it('should reject empty file array', () => {
      const result = validateMultipleFiles([])
      expect(result.valid).toBe(false)
      expect(result.error).toBe('No files provided')
    })

    it('should accept multiple valid files', () => {
      const files: FileInfo[] = [
        { name: 'photo1.jpg', size: 1024 * 1024, type: 'image/jpeg' },
        { name: 'photo2.jpg', size: 1024 * 1024, type: 'image/jpeg' },
        { name: 'photo3.jpg', size: 1024 * 1024, type: 'image/jpeg' }
      ]
      const result = validateMultipleFiles(files)
      expect(result.valid).toBe(true)
    })

    it('should reject too many files', () => {
      const files: FileInfo[] = Array.from({ length: 15 }, (_, i) => ({
        name: `file${i}.jpg`,
        size: 1024,
        type: 'image/jpeg'
      }))
      const result = validateMultipleFiles(files, 10)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Too many files')
    })

    it('should reject total size exceeding limit', () => {
      const files: FileInfo[] = [
        { name: 'large1.jpg', size: 30 * 1024 * 1024, type: 'image/jpeg' },
        { name: 'large2.jpg', size: 30 * 1024 * 1024, type: 'image/jpeg' }
      ]
      const result = validateMultipleFiles(files)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Total file size')
      expect(result.error).toContain('exceeds maximum')
    })
  })

  describe('validateFile() - Complete Validation', () => {
    it('should validate complete image file successfully', () => {
      const fileInfo: FileInfo = {
        name: 'photo.jpg',
        size: 2 * 1024 * 1024, // 2MB
        type: 'image/jpeg',
        buffer: Buffer.from('FFD8FFE0', 'hex')
      }
      const result = validateFile(fileInfo, 'image')
      expect(result.valid).toBe(true)
    })

    it('should validate complete document file successfully', () => {
      const fileInfo: FileInfo = {
        name: 'document.pdf',
        size: 5 * 1024 * 1024, // 5MB
        type: 'application/pdf',
        buffer: Buffer.from('25504446', 'hex')
      }
      const result = validateFile(fileInfo, 'document')
      expect(result.valid).toBe(true)
    })

    it('should reject file with path traversal in filename', () => {
      const fileInfo: FileInfo = {
        name: '../../../malicious.jpg',
        size: 1024,
        type: 'image/jpeg'
      }
      const result = validateFile(fileInfo, 'image')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('path traversal')
    })

    it('should reject oversized image', () => {
      const fileInfo: FileInfo = {
        name: 'huge.jpg',
        size: 10 * 1024 * 1024, // 10MB (exceeds 5MB image limit)
        type: 'image/jpeg'
      }
      const result = validateFile(fileInfo, 'image')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('exceeds maximum')
    })

    it('should reject disallowed file type', () => {
      const fileInfo: FileInfo = {
        name: 'malware.exe',
        size: 1024,
        type: 'application/x-executable'
      }
      const result = validateFile(fileInfo, 'image')
      expect(result.valid).toBe(false)
    })

    it('should reject spoofed file type', () => {
      const fileInfo: FileInfo = {
        name: 'photo.jpg',
        size: 1024,
        type: 'image/jpeg',
        buffer: Buffer.from('89504E47', 'hex') // PNG magic bytes, not JPEG
      }
      const result = validateFile(fileInfo, 'image')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('spoofing')
    })
  })

  describe('Edge Cases and Performance', () => {
    it('should handle unicode filenames', () => {
      const result = sanitizeFilename('文档📄.pdf')
      expect(result).toBeTruthy()
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle very long filenames efficiently', () => {
      const longName = 'a'.repeat(500) + '.txt'
      const start = Date.now()
      const result = sanitizeFilename(longName)
      const duration = Date.now() - start

      expect(result.length).toBeLessThanOrEqual(255)
      expect(duration).toBeLessThan(10) // Should complete in under 10ms
    })

    it('should validate multiple files quickly', () => {
      const files: FileInfo[] = Array.from({ length: 100 }, (_, i) => ({
        name: `file${i}.jpg`,
        size: 1024,
        type: 'image/jpeg'
      }))

      const start = Date.now()
      for (const file of files) {
        validateFile(file, 'image')
      }
      const duration = Date.now() - start

      expect(duration).toBeLessThan(500) // 100 validations in under 500ms
    })
  })
})
