import { Router } from 'express'
import { PredictiveAnalyticsService } from '../services/predictive-analytics'
import { authMiddleware } from '../middleware/auth'
import { validateWorkspace } from '../middleware/workspace'
import { logger } from '@ash/shared'

const router = Router()
const analyticsService = new PredictiveAnalyticsService()

// Apply authentication and workspace validation
router.use(authMiddleware)
router.use(validateWorkspace)

// AI Insights Dashboard - Main endpoint
router.get('/insights-dashboard', async (req, res) => {
  try {
    const workspaceId = req.user?.workspace_id
    const insights = await analyticsService.generateInsightsDashboard(workspaceId)
    res.json({ success: true, data: insights })
  } catch (error) {
    logger.error('Insights dashboard error:', error)
    res.status(500).json({ success: false, error: 'Failed to generate insights dashboard' })
  }
})

// Specific analysis endpoints
router.post('/analyze/capacity', async (req, res) => {
  try {
    const workspaceId = req.user?.workspace_id
    const { orderId } = req.body
    
    if (!orderId) {
      return res.status(400).json({ success: false, error: 'Order ID required' })
    }

    const analysis = await analyticsService.validateCapacityVsDeadline(workspaceId, orderId)
    res.json({ success: true, data: analysis })
  } catch (error) {
    logger.error('Capacity analysis error:', error)
    res.status(500).json({ success: false, error: 'Failed to analyze capacity' })
  }
})

router.post('/analyze/quality', async (req, res) => {
  try {
    const workspaceId = req.user?.workspace_id
    const { bundleId } = req.body
    
    if (!bundleId) {
      return res.status(400).json({ success: false, error: 'Bundle ID required' })
    }

    const prediction = await analyticsService.predictQualityIssues(workspaceId, bundleId)
    res.json({ success: true, data: prediction })
  } catch (error) {
    logger.error('Quality prediction error:', error)
    res.status(500).json({ success: false, error: 'Failed to predict quality issues' })
  }
})

router.post('/analyze/fatigue', async (req, res) => {
  try {
    const workspaceId = req.user?.workspace_id
    const analysis = await analyticsService.analyzeEmployeeFatigue(workspaceId)
    res.json({ success: true, data: analysis })
  } catch (error) {
    logger.error('Fatigue analysis error:', error)
    res.status(500).json({ success: false, error: 'Failed to analyze employee fatigue' })
  }
})

router.post('/analyze/maintenance', async (req, res) => {
  try {
    const workspaceId = req.user?.workspace_id
    const prediction = await analyticsService.predictMaintenance(workspaceId)
    res.json({ success: true, data: prediction })
  } catch (error) {
    logger.error('Maintenance prediction error:', error)
    res.status(500).json({ success: false, error: 'Failed to predict maintenance needs' })
  }
})

// Batch analysis endpoint
router.post('/analyze/batch', async (req, res) => {
  try {
    const workspaceId = req.user?.workspace_id
    const { analyses } = req.body // Array of analysis types to run
    
    if (!analyses || !Array.isArray(analyses)) {
      return res.status(400).json({ success: false, error: 'Analyses array required' })
    }

    const results = {}
    
    for (const analysisType of analyses) {
      try {
        switch (analysisType) {
          case 'fatigue':
            results[analysisType] = await analyticsService.analyzeEmployeeFatigue(workspaceId)
            break
          case 'maintenance':
            results[analysisType] = await analyticsService.predictMaintenance(workspaceId)
            break
          default:
            results[analysisType] = { error: 'Unknown analysis type' }
        }
      } catch (error) {
        results[analysisType] = { error: error.message }
      }
    }

    res.json({ success: true, data: results })
  } catch (error) {
    logger.error('Batch analysis error:', error)
    res.status(500).json({ success: false, error: 'Failed to run batch analysis' })
  }
})

// Real-time predictions endpoint
router.get('/predictions/:type/:id', async (req, res) => {
  try {
    const workspaceId = req.user?.workspace_id
    const { type, id } = req.params
    
    let prediction
    
    switch (type) {
      case 'capacity':
        prediction = await analyticsService.validateCapacityVsDeadline(workspaceId, id)
        break
      case 'quality':
        prediction = await analyticsService.predictQualityIssues(workspaceId, id)
        break
      default:
        return res.status(400).json({ success: false, error: 'Invalid prediction type' })
    }

    res.json({ success: true, data: prediction })
  } catch (error) {
    logger.error('Real-time prediction error:', error)
    res.status(500).json({ success: false, error: 'Failed to generate prediction' })
  }
})

export { router as analyticsRouter }