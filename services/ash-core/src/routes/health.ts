import { Router } from 'express'
import { prisma } from '@ash/database'

const router = Router()

router.get('/', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    res.json({
      status: 'healthy',
      service: 'ash-core',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      database: 'connected'
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'ash-core',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: 'Database connection failed'
    })
  }
})

export { router as healthRouter }