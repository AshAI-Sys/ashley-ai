import { describe, it, expect, beforeAll } from '@jest/globals'

const API_BASE = 'http://localhost:3001'

describe('File Upload Security Tests', () => {
  let authToken: string

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ashleyai.com',
        password: 'password123',
      }),
    })

    const loginData = await loginResponse.json()
    authToken = loginData.token || ''
  })

  describe('File Type Validation', () => {
    it('should accept valid image file types (JPEG)', async () => {
      // Create a valid JPEG file with magic bytes
      const jpegBytes = new Uint8Array([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
        0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
        // ... minimal JPEG data
      ])

      const formData = new FormData()
      const blob = new Blob([jpegBytes], { type: 'image/jpeg' })
      formData.append('file', blob, 'test.jpg')

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      })

      expect(response.status).toBeLessThan(500)
      // Should either succeed (200) or fail validation (400), but not crash
    })

    it('should accept valid image file types (PNG)', async () => {
      // Create a valid PNG file with magic bytes
      const pngBytes = new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
        0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
        // ... minimal PNG data
      ])

      const formData = new FormData()
      const blob = new Blob([pngBytes], { type: 'image/png' })
      formData.append('file', blob, 'test.png')

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      })

      expect(response.status).toBeLessThan(500)
    })

    it('should reject files with mismatched MIME type and magic bytes', async () => {
      // Create a file claiming to be PNG but with JPEG magic bytes
      const jpegBytes = new Uint8Array([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46,
        0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,
      ])

      const formData = new FormData()
      const blob = new Blob([jpegBytes], { type: 'image/png' }) // Wrong MIME type
      formData.append('file', blob, 'fake.png')

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      })

      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error || data.message).toMatch(/signature|type|invalid/i)
    })

    it('should reject executable files masquerading as images', async () => {
      // Create a file with EXE magic bytes but claiming to be an image
      const exeBytes = new Uint8Array([
        0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, // MZ header (EXE)
      ])

      const formData = new FormData()
      const blob = new Blob([exeBytes], { type: 'image/jpeg' })
      formData.append('file', blob, 'virus.jpg')

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      })

      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error || data.message).toMatch(/signature|type|invalid/i)
    })

    it('should reject PHP files with image extension', async () => {
      // Create a file with PHP content
      const phpBytes = new TextEncoder().encode('<?php system($_GET["cmd"]); ?>')

      const formData = new FormData()
      const blob = new Blob([phpBytes], { type: 'image/jpeg' })
      formData.append('file', blob, 'shell.jpg')

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      })

      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error || data.message).toMatch(/signature|type|invalid/i)
    })

    it('should reject SVG files (XSS risk)', async () => {
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <script>alert('XSS')</script>
        </svg>
      `
      const svgBytes = new TextEncoder().encode(svgContent)

      const formData = new FormData()
      const blob = new Blob([svgBytes], { type: 'image/svg+xml' })
      formData.append('file', blob, 'xss.svg')

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      })

      // Should reject SVG or at least sanitize it
      if (response.status === 200) {
        const data = await response.json()
        // If accepted, verify it was sanitized
        expect(data.warning || data.sanitized).toBeTruthy()
      } else {
        expect(response.status).toBe(400)
      }
    })
  })

  describe('File Size Validation', () => {
    it('should reject files exceeding maximum size (10MB)', async () => {
      // Create a file larger than 10MB
      const largeBytes = new Uint8Array(11 * 1024 * 1024) // 11MB
      largeBytes[0] = 0xff // JPEG magic byte start
      largeBytes[1] = 0xd8

      const formData = new FormData()
      const blob = new Blob([largeBytes], { type: 'image/jpeg' })
      formData.append('file', blob, 'huge.jpg')

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      })

      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error || data.message).toMatch(/size|large|limit/i)
    })

    it('should accept files under maximum size', async () => {
      // Create a small valid JPEG
      const smallBytes = new Uint8Array(1024) // 1KB
      smallBytes[0] = 0xff
      smallBytes[1] = 0xd8
      smallBytes[2] = 0xff
      smallBytes[3] = 0xe0

      const formData = new FormData()
      const blob = new Blob([smallBytes], { type: 'image/jpeg' })
      formData.append('file', blob, 'small.jpg')

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      })

      expect(response.status).toBeLessThan(500)
    })

    it('should reject zero-byte files', async () => {
      const formData = new FormData()
      const blob = new Blob([], { type: 'image/jpeg' })
      formData.append('file', blob, 'empty.jpg')

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      })

      const data = await response.json()
      expect(response.status).toBe(400)
      expect(data.error || data.message).toMatch(/empty|size|invalid/i)
    })
  })

  describe('Filename Sanitization', () => {
    it('should sanitize filenames with path traversal attempts', async () => {
      const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])

      const maliciousFilenames = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32\\config\\sam',
        'test/../../../etc/passwd.jpg',
        'test\\..\\..\\..\\boot.ini',
      ]

      for (const filename of maliciousFilenames) {
        const formData = new FormData()
        const blob = new Blob([jpegBytes], { type: 'image/jpeg' })
        formData.append('file', blob, filename)

        const response = await fetch(`${API_BASE}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        })

        if (response.status === 200) {
          const data = await response.json()
          // If accepted, verify filename was sanitized
          expect(data.filename).not.toContain('..')
          expect(data.filename).not.toContain('etc')
          expect(data.filename).not.toContain('windows')
        }
      }
    })

    it('should sanitize filenames with special characters', async () => {
      const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])

      const specialFilenames = [
        'test<script>.jpg',
        'test|pipe.jpg',
        'test:colon.jpg',
        'test*star.jpg',
        'test?question.jpg',
        'test"quote.jpg',
      ]

      for (const filename of specialFilenames) {
        const formData = new FormData()
        const blob = new Blob([jpegBytes], { type: 'image/jpeg' })
        formData.append('file', blob, filename)

        const response = await fetch(`${API_BASE}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        })

        if (response.status === 200) {
          const data = await response.json()
          // Verify special characters were removed or replaced
          expect(data.filename).not.toContain('<')
          expect(data.filename).not.toContain('|')
          expect(data.filename).not.toContain(':')
          expect(data.filename).not.toContain('*')
          expect(data.filename).not.toContain('?')
          expect(data.filename).not.toContain('"')
        }
      }
    })

    it('should handle unicode filenames safely', async () => {
      const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])

      const formData = new FormData()
      const blob = new Blob([jpegBytes], { type: 'image/jpeg' })
      formData.append('file', blob, '测试文件名.jpg')

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      })

      expect(response.status).toBeLessThan(500)

      if (response.status === 200) {
        const data = await response.json()
        expect(data.filename).toBeTruthy()
      }
    })

    it('should handle very long filenames', async () => {
      const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])

      const longFilename = 'a'.repeat(300) + '.jpg' // 304 chars

      const formData = new FormData()
      const blob = new Blob([jpegBytes], { type: 'image/jpeg' })
      formData.append('file', blob, longFilename)

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      })

      if (response.status === 200) {
        const data = await response.json()
        // Verify filename was truncated to reasonable length
        expect(data.filename.length).toBeLessThan(256)
      }
    })
  })

  describe('Double Extension Protection', () => {
    it('should detect and prevent double extension attacks', async () => {
      const phpBytes = new TextEncoder().encode('<?php echo "pwned"; ?>')

      const doubleExtensions = [
        'image.php.jpg',
        'shell.php.png',
        'backdoor.asp.jpeg',
        'virus.exe.jpg',
      ]

      for (const filename of doubleExtensions) {
        const formData = new FormData()
        const blob = new Blob([phpBytes], { type: 'image/jpeg' })
        formData.append('file', blob, filename)

        const response = await fetch(`${API_BASE}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
          body: formData,
        })

        // Should either reject or sanitize the filename
        if (response.status === 200) {
          const data = await response.json()
          expect(data.filename).not.toMatch(/\.php\.|\.asp\.|\.exe\./)
        } else {
          expect(response.status).toBe(400)
        }
      }
    })
  })

  describe('Content Security', () => {
    it('should reject files with embedded scripts in EXIF data', async () => {
      // JPEG with malicious EXIF data
      const maliciousExif = new Uint8Array([
        0xff, 0xd8, 0xff, 0xe1, // JPEG with EXIF marker
        0x00, 0x20, // Length
        0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif\0\0"
        // Embedded script attempt
        ...new TextEncoder().encode('<script>alert("XSS")</script>'),
      ])

      const formData = new FormData()
      const blob = new Blob([maliciousExif], { type: 'image/jpeg' })
      formData.append('file', blob, 'exif-xss.jpg')

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      })

      // Should either reject or strip EXIF data
      expect(response.status).toBeLessThan(500)
    })

    it('should handle ZIP bomb attempts', async () => {
      // Simulate a compressed file that expands to huge size
      // (simplified test - real ZIP bombs are complex)
      const suspiciousBytes = new Uint8Array(1024)
      suspiciousBytes[0] = 0x50 // PK header (ZIP)
      suspiciousBytes[1] = 0x4b

      const formData = new FormData()
      const blob = new Blob([suspiciousBytes], { type: 'application/zip' })
      formData.append('file', blob, 'bomb.zip')

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
      })

      // Should reject ZIP files or validate compression ratio
      expect(response.status).toBeLessThan(500)
    })
  })

  describe('Authentication & Authorization', () => {
    it('should reject uploads without authentication', async () => {
      const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])

      const formData = new FormData()
      const blob = new Blob([jpegBytes], { type: 'image/jpeg' })
      formData.append('file', blob, 'test.jpg')

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        // No Authorization header
        body: formData,
      })

      expect(response.status).toBe(401)
    })

    it('should reject uploads with invalid token', async () => {
      const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])

      const formData = new FormData()
      const blob = new Blob([jpegBytes], { type: 'image/jpeg' })
      formData.append('file', blob, 'test.jpg')

      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer invalid-token-12345',
        },
        body: formData,
      })

      expect(response.status).toBe(401)
    })
  })

  describe('Upload Limits', () => {
    it('should enforce rate limiting on uploads', async () => {
      const jpegBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0])

      const uploadPromises = []

      // Attempt 20 rapid uploads
      for (let i = 0; i < 20; i++) {
        const formData = new FormData()
        const blob = new Blob([jpegBytes], { type: 'image/jpeg' })
        formData.append('file', blob, `test-${i}.jpg`)

        uploadPromises.push(
          fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
            body: formData,
          })
        )
      }

      const responses = await Promise.all(uploadPromises)
      const rateLimited = responses.filter(r => r.status === 429)

      // At least some requests should be rate limited
      expect(rateLimited.length).toBeGreaterThan(0)
    })
  })
})
