import { Router } from 'express'
import { DashboardController } from '../controllers/dashboard-controller'
import { authMiddleware } from '../middleware/auth'
import { validateWorkspace } from '../middleware/workspace'

const router = Router()
const dashboardController = new DashboardController()

// Apply authentication and workspace validation to all dashboard routes
router.use(authMiddleware)
router.use(validateWorkspace)

// Real-time production dashboard routes
router.get('/overview', dashboardController.getProductionOverview.bind(dashboardController))
router.get('/floor-status', dashboardController.getProductionFloorStatus.bind(dashboardController))
router.get('/analytics', dashboardController.getAdvancedAnalytics.bind(dashboardController))

export { router as dashboardRouter }