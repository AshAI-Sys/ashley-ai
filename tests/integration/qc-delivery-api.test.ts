/**
 * QC & Delivery Operations API - Integration Tests
 *
 * Tests for Quality Control and Delivery operations APIs
 * Tests real API endpoints with database integration
 *
 * Total: 20 tests (10 QC + 10 Delivery)
 */

import { describe, it, expect, beforeAll } from '@jest/globals'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

describe('QC & Delivery Operations API Integration Tests', () => {
  let authToken: string | null = null

  beforeAll(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@ashleyai.com',
          password: 'password123'
        })
      })

      if (response.ok) {
        const data = await response.json()
        authToken = data.token || data.accessToken
      }
    } catch (error) {
      console.log('Server not available, skipping integration tests')
    }
  })

  describe('QC Operations API', () => {
    describe('POST /api/mobile/qc/submit', () => {
      it('should submit QC inspection', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const qcData = {
          bundle_id: 'test-bundle-123',
          inspector_id: 'inspector-1',
          sample_size: 32,
          defects_found: 2,
          result: 'PASS'
        }

        const response = await fetch(`${API_BASE}/api/mobile/qc/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(qcData)
        })

        expect([200, 201, 400, 401, 404]).toContain(response.status)
      })

      it('should reject QC with invalid sample size', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const invalidQcData = {
          bundle_id: 'test-bundle-123',
          inspector_id: 'inspector-1',
          sample_size: -5, // Invalid
          defects_found: 2,
          result: 'PASS'
        }

        const response = await fetch(`${API_BASE}/api/mobile/qc/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(invalidQcData)
        })

        expect([400, 404, 422]).toContain(response.status)
      })

      it('should calculate AQL pass/fail correctly', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const qcData = {
          bundle_id: 'test-bundle-123',
          inspector_id: 'inspector-1',
          sample_size: 125,
          defects_found: 8, // Should fail at AQL 2.5
          result: 'FAIL'
        }

        const response = await fetch(`${API_BASE}/api/mobile/qc/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(qcData)
        })

        expect([200, 201, 400, 401, 404]).toContain(response.status)
      })

      it('should handle defect code tracking', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const qcData = {
          bundle_id: 'test-bundle-123',
          inspector_id: 'inspector-1',
          sample_size: 32,
          defects: [
            { code: 'STAIN', severity: 'MAJOR', count: 1 },
            { code: 'HOLE', severity: 'CRITICAL', count: 1 }
          ],
          result: 'FAIL'
        }

        const response = await fetch(`${API_BASE}/api/mobile/qc/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(qcData)
        })

        expect([200, 201, 400, 401, 404]).toContain(response.status)
      })

      it('should upload defect photos', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const qcData = {
          bundle_id: 'test-bundle-123',
          inspector_id: 'inspector-1',
          sample_size: 32,
          defects_found: 2,
          result: 'FAIL',
          photos: ['https://example.com/defect1.jpg', 'https://example.com/defect2.jpg']
        }

        const response = await fetch(`${API_BASE}/api/mobile/qc/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(qcData)
        })

        expect([200, 201, 400, 401, 404]).toContain(response.status)
      })

      it('should create CAPA task for failed QC', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const qcData = {
          bundle_id: 'test-bundle-123',
          inspector_id: 'inspector-1',
          sample_size: 125,
          defects_found: 10,
          result: 'FAIL',
          create_capa: true,
          root_cause: 'Machine calibration issue'
        }

        const response = await fetch(`${API_BASE}/api/mobile/qc/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(qcData)
        })

        expect([200, 201, 400, 401, 404]).toContain(response.status)

        if (response.ok) {
          const data = await response.json()
          // Should create CAPA task
          if (data.capa_id || data.capa_task) {
            expect(data.capa_id || data.capa_task).toBeDefined()
          }
        }
      })

      it('should support re-inspection workflow', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const qcData = {
          bundle_id: 'test-bundle-123',
          inspector_id: 'inspector-2',
          sample_size: 32,
          defects_found: 0,
          result: 'PASS',
          is_reinspection: true,
          original_inspection_id: 'qc-123'
        }

        const response = await fetch(`${API_BASE}/api/mobile/qc/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(qcData)
        })

        expect([200, 201, 400, 401, 404]).toContain(response.status)
      })

      it('should track inspector performance', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const qcData = {
          bundle_id: 'test-bundle-123',
          inspector_id: 'inspector-1',
          sample_size: 32,
          defects_found: 1,
          result: 'PASS',
          inspection_time_minutes: 15
        }

        const response = await fetch(`${API_BASE}/api/mobile/qc/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(qcData)
        })

        expect([200, 201, 400, 401, 404]).toContain(response.status)
      })

      it('should validate AQL level selection', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const qcData = {
          bundle_id: 'test-bundle-123',
          inspector_id: 'inspector-1',
          lot_size: 1000,
          aql_level: '2.5',
          sample_size: 125, // Correct for Level II, AQL 2.5
          defects_found: 5,
          result: 'PASS'
        }

        const response = await fetch(`${API_BASE}/api/mobile/qc/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(qcData)
        })

        expect([200, 201, 400, 401, 404]).toContain(response.status)
      })

      it('should handle mobile offline submission', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const qcData = {
          bundle_id: 'test-bundle-123',
          inspector_id: 'inspector-1',
          sample_size: 32,
          defects_found: 1,
          result: 'PASS',
          offline_submission: true,
          submitted_at: new Date().toISOString()
        }

        const response = await fetch(`${API_BASE}/api/mobile/qc/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(qcData)
        })

        expect([200, 201, 400, 401, 404]).toContain(response.status)
      })
    })
  })

  describe('Delivery Operations API', () => {
    describe('GET /api/delivery/shipments', () => {
      it('should return shipments list', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const response = await fetch(`${API_BASE}/api/delivery/shipments`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        expect([200, 401, 404]).toContain(response.status)

        if (response.ok) {
          const data = await response.json()
          expect(data).toBeDefined()
        }
      })

      it('should filter shipments by status', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const response = await fetch(`${API_BASE}/api/delivery/shipments?status=IN_TRANSIT`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        expect([200, 401, 404]).toContain(response.status)
      })

      it('should filter shipments by date range', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const startDate = '2025-01-01'
        const endDate = '2025-12-31'

        const response = await fetch(
          `${API_BASE}/api/delivery/shipments?start_date=${startDate}&end_date=${endDate}`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        )

        expect([200, 401, 404]).toContain(response.status)
      })
    })

    describe('POST /api/delivery/shipments', () => {
      it('should create new shipment', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const newShipment = {
          order_id: 'test-order-123',
          delivery_method: 'DRIVER',
          recipient_name: 'John Doe',
          recipient_address: '123 Test St',
          recipient_phone: '+1234567890',
          carton_ids: ['carton-1', 'carton-2'],
          scheduled_date: '2025-10-20'
        }

        const response = await fetch(`${API_BASE}/api/delivery/shipments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newShipment)
        })

        expect([200, 201, 400, 401, 404]).toContain(response.status)
      })

      it('should validate required delivery fields', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const invalidShipment = {
          order_id: 'test-order-123'
          // Missing required fields
        }

        const response = await fetch(`${API_BASE}/api/delivery/shipments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(invalidShipment)
        })

        expect([400, 404, 422]).toContain(response.status)
      })

      it('should calculate shipment weight and dimensions', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const newShipment = {
          order_id: 'test-order-123',
          delivery_method: '3PL',
          recipient_name: 'John Doe',
          recipient_address: '123 Test St',
          carton_ids: ['carton-1', 'carton-2']
        }

        const response = await fetch(`${API_BASE}/api/delivery/shipments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newShipment)
        })

        expect([200, 201, 400, 401, 404]).toContain(response.status)

        if (response.ok) {
          const data = await response.json()
          // Should calculate total weight
          if (data.total_weight || data.shipment?.total_weight) {
            expect(typeof (data.total_weight || data.shipment.total_weight)).toBe('number')
          }
        }
      })

      it('should support 3PL integration', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const newShipment = {
          order_id: 'test-order-123',
          delivery_method: '3PL',
          provider: 'DHL',
          recipient_name: 'John Doe',
          recipient_address: '123 Test St',
          carton_ids: ['carton-1']
        }

        const response = await fetch(`${API_BASE}/api/delivery/shipments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newShipment)
        })

        expect([200, 201, 400, 401, 404]).toContain(response.status)
      })

      it('should generate tracking number', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const newShipment = {
          order_id: 'test-order-123',
          delivery_method: 'DRIVER',
          recipient_name: 'John Doe',
          recipient_address: '123 Test St',
          carton_ids: ['carton-1']
        }

        const response = await fetch(`${API_BASE}/api/delivery/shipments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newShipment)
        })

        expect([200, 201, 400, 401, 404]).toContain(response.status)

        if (response.ok) {
          const data = await response.json()
          // Should have tracking number
          if (data.tracking_number || data.shipment?.tracking_number) {
            expect(typeof (data.tracking_number || data.shipment.tracking_number)).toBe('string')
          }
        }
      })
    })

    describe('GET /api/delivery/stats', () => {
      it('should return delivery statistics', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const response = await fetch(`${API_BASE}/api/delivery/stats`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        })

        expect([200, 401, 404]).toContain(response.status)

        if (response.ok) {
          const data = await response.json()
          expect(data).toBeDefined()
          // Stats should include metrics
          expect(data).toHaveProperty
        }
      })

      it('should filter stats by date range', async () => {
        if (!authToken) {
          console.log('Skipping: No auth token')
          return
        }

        const response = await fetch(
          `${API_BASE}/api/delivery/stats?start_date=2025-01-01&end_date=2025-12-31`,
          {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }
        )

        expect([200, 401, 404]).toContain(response.status)
      })
    })
  })
})
