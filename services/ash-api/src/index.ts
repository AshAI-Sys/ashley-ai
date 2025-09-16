import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { createProxyMiddleware } from 'http-proxy-middleware'
import dotenv from 'dotenv'
import { logger } from '@ash/shared'
import { authMiddleware } from './middleware/auth'
import { requestLogger } from './middleware/request-logger'
import { errorHandler } from './middleware/error-handler'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.ASH_API_PORT || 3000

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
  max: 1000, // Higher limit for API gateway
  message: 'Too many requests from this IP'
})
app.use(limiter)

// Body parsing
app.use(compression())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Logging
app.use(requestLogger)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ash-api',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  })
})

// Service endpoints
const CORE_SERVICE_URL = process.env.ASH_CORE_URL || 'http://localhost:4000'
const AI_SERVICE_URL = process.env.ASH_AI_URL || 'http://localhost:4001'

// Auth routes (proxy to core service, no auth required)
app.use('/api/auth', createProxyMiddleware({
  target: CORE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  },
  onError: (err, req, res) => {
    logger.error('Core service proxy error:', err)
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Core service is unavailable'
    })
  }
}))

// Protected routes (require authentication)
app.use('/api', authMiddleware)

// Core service routes
app.use('/api/clients', createProxyMiddleware({
  target: CORE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/clients': '/api/clients'
  },
  onError: (err, req, res) => {
    logger.error('Core service proxy error:', err)
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Core service is unavailable'
    })
  }
}))

app.use('/api/orders', createProxyMiddleware({
  target: CORE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/orders': '/api/orders'
  },
  onError: (err, req, res) => {
    logger.error('Core service proxy error:', err)
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Core service is unavailable'
    })
  }
}))

app.use('/api/production', createProxyMiddleware({
  target: CORE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/production': '/api/production'
  },
  onError: (err, req, res) => {
    logger.error('Core service proxy error:', err)
    res.status(503).json({
      error: 'Service Unavailable', 
      message: 'Core service is unavailable'
    })
  }
}))

app.use('/api/finance', createProxyMiddleware({
  target: CORE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/finance': '/api/finance'
  },
  onError: (err, req, res) => {
    logger.error('Core service proxy error:', err)
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Core service is unavailable'
    })
  }
}))

app.use('/api/hr', createProxyMiddleware({
  target: CORE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/hr': '/api/hr'
  },
  onError: (err, req, res) => {
    logger.error('Core service proxy error:', err)
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Core service is unavailable'
    })
  }
}))

// Ashley AI service routes
app.use('/api/ai', createProxyMiddleware({
  target: AI_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/ai': '/api'
  },
  onError: (err, req, res) => {
    logger.error('AI service proxy error:', err)
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'AI service is unavailable'
    })
  }
}))

// Aggregated endpoints (BFF pattern)
app.get('/api/dashboard', async (req, res) => {
  try {
    // Aggregate data from multiple services for dashboard
    const [ordersResponse, productionResponse] = await Promise.allSettled([
      fetch(`${CORE_SERVICE_URL}/api/orders?limit=5`, {
        headers: { Authorization: req.headers.authorization! }
      }),
      fetch(`${CORE_SERVICE_URL}/api/production/summary`, {
        headers: { Authorization: req.headers.authorization! }
      })
    ])

    const dashboard = {
      recent_orders: ordersResponse.status === 'fulfilled' 
        ? await ordersResponse.value.json() 
        : [],
      production_summary: productionResponse.status === 'fulfilled'
        ? await productionResponse.value.json()
        : {}
    }

    res.json(dashboard)
  } catch (error) {
    logger.error('Dashboard aggregation error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch dashboard data'
    })
  }
})

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
    logger.info(`ASH API Gateway listening on port ${PORT}`)
  })
}

export default app