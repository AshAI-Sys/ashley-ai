import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { logger } from '@ash/shared'
import { errorHandler } from './middleware/error-handler'
import { authMiddleware } from './middleware/auth'
import { requestLogger } from './middleware/request-logger'
import { performanceMonitor, getHealthMetrics } from './middleware/performance'
import { backgroundOptimizer } from './services/background-optimizer'
import { PERFORMANCE_CONFIG } from './config/performance'

// Routes
import { healthRouter } from './routes/health'
import { authRouter } from './routes/auth'
import { clientsRouter } from './routes/clients'
import { ordersRouter } from './routes/orders'
import { designsRouter } from './routes/designs'
import { portalRouter } from './routes/portal'
import { productionRouter } from './routes/production'
import { productionStagesRouter } from './routes/production-stages'
import { financeRouter } from './routes/finance'
import { hrRouter } from './routes/hr'
import { dashboardRouter } from './routes/dashboard'
import cuttingRouter from './routes/cutting'
import printingRouter from './routes/printing'
import sewingRouter from './routes/sewing'
import qualityControlRouter from './routes/quality-control'
import capaRouter from './routes/capa'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.ASH_CORE_PORT || 4000

// Create uploads directory if it doesn't exist
import { existsSync, mkdirSync } from 'fs'
const uploadsDir = path.join(process.cwd(), 'uploads/designs')
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true })
}

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ASH_ALLOWED_ORIGINS?.split(',') || []
    : true,
  credentials: true
}))

// Rate limiting (optimized)
const limiter = rateLimit({
  windowMs: PERFORMANCE_CONFIG.CACHE.TTL.SEARCH_RESULTS * 1000,
  max: 1000, // Increased for better performance
  message: { error: 'Rate limit exceeded', retryAfter: 600 },
  standardHeaders: true,
  legacyHeaders: false
})
app.use('/api', limiter)

// Body parsing with compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false
    }
    return compression.filter(req, res)
  },
  level: PERFORMANCE_CONFIG.API.GZIP_LEVEL
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Performance monitoring
app.use(performanceMonitor)

// Static file serving for uploads (with caching)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
  maxAge: '7d',
  etag: true,
  lastModified: true
}))

// Logging
app.use(requestLogger)

// Health check (no auth required)
app.use('/health', healthRouter)

// Performance metrics endpoint
app.get('/performance', (req, res) => {
  const metrics = getHealthMetrics()
  res.json(metrics)
})

// Authentication routes (no auth required for login/register)
app.use('/api/auth', authRouter)

// Protected routes (require authentication)
app.use('/api/clients', authMiddleware, clientsRouter)
app.use('/api/orders', authMiddleware, ordersRouter)
app.use('/api/designs', authMiddleware, designsRouter)
app.use('/api/production', authMiddleware, productionRouter)
app.use('/api/production-stages', authMiddleware, productionStagesRouter)
app.use('/api/cutting', authMiddleware, cuttingRouter)
app.use('/api/printing', authMiddleware, printingRouter)
app.use('/api/sewing', authMiddleware, sewingRouter)
app.use('/api/quality-control', authMiddleware, qualityControlRouter)
app.use('/api/capa', authMiddleware, capaRouter)
app.use('/api/finance', authMiddleware, financeRouter)
app.use('/api/hr', authMiddleware, hrRouter)
app.use('/api/dashboard', dashboardRouter)

// Public portal routes (no authentication required)
app.use('/api/portal', portalRouter)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  })
})

// Global error handler
app.use(errorHandler)

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  process.exit(0)
})

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`ASH Core service listening on port ${PORT}`)
    logger.info(`File uploads available at: /uploads`)
    logger.info(`Performance metrics available at: /performance`)
    
    // Start background optimization services
    backgroundOptimizer.start()
    logger.info('Background optimization services started')
  })
}

export default app