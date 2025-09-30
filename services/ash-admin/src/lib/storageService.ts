import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomBytes } from 'crypto'
import path from 'path'
import fs from 'fs/promises'

export interface UploadOptions {
  folder?: string
  fileName?: string
  contentType?: string
  makePublic?: boolean
}

export interface UploadResult {
  key: string
  url: string
  size: number
  contentType: string
}

export class StorageService {
  private s3Client: S3Client | null = null
  private bucket: string
  private provider: 'local' | 'aws' | 'cloudflare'
  private uploadDir: string

  constructor() {
    this.provider = (process.env.ASH_STORAGE_PROVIDER as any) || 'local'
    this.bucket = process.env.ASH_AWS_BUCKET || 'ash-ai-files'
    this.uploadDir = process.env.UPLOAD_DIR || './uploads'

    // Initialize S3 client for AWS or Cloudflare R2
    if (this.provider === 'aws' || this.provider === 'cloudflare') {
      const endpoint = this.provider === 'cloudflare'
        ? process.env.CLOUDFLARE_R2_ENDPOINT
        : undefined

      this.s3Client = new S3Client({
        region: process.env.ASH_AWS_REGION || 'ap-southeast-1',
        endpoint,
        credentials: {
          accessKeyId: process.env.ASH_AWS_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.ASH_AWS_SECRET_ACCESS_KEY || '',
        },
      })
    }
  }

  /**
   * Generate a unique file key with optional folder structure
   */
  private generateFileKey(originalName: string, folder?: string): string {
    const ext = path.extname(originalName)
    const randomId = randomBytes(16).toString('hex')
    const timestamp = Date.now()
    const fileName = `${timestamp}-${randomId}${ext}`

    return folder ? `${folder}/${fileName}` : fileName
  }

  /**
   * Upload a file to storage (S3, Cloudflare R2, or local filesystem)
   */
  async upload(
    file: Buffer | Uint8Array,
    originalName: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const fileKey = options.fileName || this.generateFileKey(originalName, options.folder)
    const contentType = options.contentType || this.guessContentType(originalName)

    if (this.provider === 'local') {
      return this.uploadLocal(file, fileKey, contentType)
    } else if (this.s3Client) {
      return this.uploadS3(file, fileKey, contentType, options.makePublic)
    } else {
      throw new Error('Storage provider not configured')
    }
  }

  /**
   * Upload to local filesystem
   */
  private async uploadLocal(
    file: Buffer | Uint8Array,
    fileKey: string,
    contentType: string
  ): Promise<UploadResult> {
    const filePath = path.join(this.uploadDir, fileKey)
    const dir = path.dirname(filePath)

    // Ensure directory exists
    await fs.mkdir(dir, { recursive: true })

    // Write file
    await fs.writeFile(filePath, file)

    return {
      key: fileKey,
      url: `/uploads/${fileKey}`,
      size: file.length,
      contentType,
    }
  }

  /**
   * Upload to S3 or Cloudflare R2
   */
  private async uploadS3(
    file: Buffer | Uint8Array,
    fileKey: string,
    contentType: string,
    makePublic?: boolean
  ): Promise<UploadResult> {
    if (!this.s3Client) {
      throw new Error('S3 client not initialized')
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
      Body: file,
      ContentType: contentType,
      ACL: makePublic ? 'public-read' : 'private',
    })

    await this.s3Client.send(command)

    // Generate URL
    const url = makePublic
      ? this.getPublicUrl(fileKey)
      : await this.getSignedUrl(fileKey, 3600) // 1 hour expiry

    return {
      key: fileKey,
      url,
      size: file.length,
      contentType,
    }
  }

  /**
   * Get a signed URL for private file access
   */
  async getSignedUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    if (this.provider === 'local') {
      return `/uploads/${fileKey}`
    }

    if (!this.s3Client) {
      throw new Error('S3 client not initialized')
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fileKey,
    })

    return getSignedUrl(this.s3Client, command, { expiresIn })
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(fileKey: string): string {
    if (this.provider === 'local') {
      return `/uploads/${fileKey}`
    }

    if (this.provider === 'cloudflare') {
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
      return `https://${accountId}.r2.cloudflarestorage.com/${this.bucket}/${fileKey}`
    }

    // AWS S3
    const region = process.env.ASH_AWS_REGION || 'ap-southeast-1'
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${fileKey}`
  }

  /**
   * Delete a file from storage
   */
  async delete(fileKey: string): Promise<boolean> {
    try {
      if (this.provider === 'local') {
        const filePath = path.join(this.uploadDir, fileKey)
        await fs.unlink(filePath)
        return true
      }

      if (!this.s3Client) {
        throw new Error('S3 client not initialized')
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      })

      await this.s3Client.send(command)
      return true
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }

  /**
   * Check if a file exists
   */
  async exists(fileKey: string): Promise<boolean> {
    try {
      if (this.provider === 'local') {
        const filePath = path.join(this.uploadDir, fileKey)
        await fs.access(filePath)
        return true
      }

      if (!this.s3Client) {
        throw new Error('S3 client not initialized')
      }

      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: fileKey,
      })

      await this.s3Client.send(command)
      return true
    } catch {
      return false
    }
  }

  /**
   * Guess content type from file extension
   */
  private guessContentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.zip': 'application/zip',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.xml': 'application/xml',
      '.ai': 'application/postscript',
      '.psd': 'image/vnd.adobe.photoshop',
    }

    return mimeTypes[ext] || 'application/octet-stream'
  }
}

// Singleton instance
export const storageService = new StorageService()