import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import { logger } from '@ash/shared'
import { errorHandler } from './middleware/error-handler'
import { requestLogger } from './middleware/request-logger'

// Services
import { AshleyAI } from './services/ashley-ai'

// Routes
import { analysisRouter } from './controllers/analysis'
import { predictionsRouter } from './controllers/predictions'
import { recommendationsRouter } from './controllers/recommendations'
import { insightsRouter } from './controllers/insights'
import { analyticsRouter } from './routes/analytics'

// Jobs
import { setupJobs } from './jobs'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.ASH_AI_PORT || 4001

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ASH_ALLOWED_ORIGINS?.split(',') || []
    : true,
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for AI service
  message: 'Too many requests from this IP'
})
app.use(limiter)

// Body parsing
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Logging
app.use(requestLogger)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ashley-ai',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    ai_model: 'gpt-4',
    capabilities: [
      'capacity_analysis',
      'quality_prediction',
      'route_optimization',
      'stock_forecasting',
      'anomaly_detection',
      'performance_insights'
    ]
  })
})

// API routes
app.use('/api/analysis', analysisRouter)
app.use('/api/predictions', predictionsRouter)
app.use('/api/recommendations', recommendationsRouter)
app.use('/api/insights', insightsRouter)
app.use('/api/ai', analyticsRouter)

// Initialize Ashley AI
const ashley = new AshleyAI()
ashley.initialize().then(() => {
  logger.info('Ashley AI initialized successfully')
}).catch((error) => {
  logger.error('Failed to initialize Ashley AI:', error)
})

// Setup background jobs
setupJobs()

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
  ashley.shutdown()
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully')
  ashley.shutdown()
  process.exit(0)
})

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Ashley AI service listening on port ${PORT}`)
  })
}

export default app