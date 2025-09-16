import { Router } from 'express'
import { param, body, validationResult } from 'express-validator'
import { AshleyAI } from '../services/ashley-ai'
import { logger } from '@ash/shared/logger'

const router = Router()
const ashley = new AshleyAI()

// Analyze capacity vs deadline for an order
router.post('/capacity/:orderId', [
  param('orderId').isUUID(),
  body('workspace_id').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { orderId } = req.params
    const { workspace_id } = req.body

    const analysis = await ashley.analyzeCapacityVsDeadline(orderId, workspace_id)

    res.json({
      order_id: orderId,
      analysis,
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Capacity analysis error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to analyze capacity'
    })
  }
})

// Predict quality risk for an order
router.post('/quality-risk/:orderId', [
  param('orderId').isUUID(),
  body('workspace_id').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { orderId } = req.params
    const { workspace_id } = req.body

    const prediction = await ashley.predictQualityRisk(orderId, workspace_id)

    res.json({
      order_id: orderId,
      prediction,
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Quality risk prediction error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to predict quality risk'
    })
  }
})

// Validate production route for an order
router.post('/route-validation/:orderId', [
  param('orderId').isUUID(),
  body('workspace_id').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { orderId } = req.params
    const { workspace_id } = req.body

    const validation = await ashley.validateProductionRoute(orderId, workspace_id)

    res.json({
      order_id: orderId,
      validation,
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Route validation error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to validate route'
    })
  }
})

// Generate stock alerts
router.post('/stock-alerts', [
  body('workspace_id').isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { workspace_id } = req.body

    const alerts = await ashley.generateStockAlerts(workspace_id)

    res.json({
      workspace_id,
      alerts,
      generated_at: new Date().toISOString()
    })

  } catch (error) {
    logger.error('Stock alerts error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate stock alerts'
    })
  }
})

export { router as analysisRouter }