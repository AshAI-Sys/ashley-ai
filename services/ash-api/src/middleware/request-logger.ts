import { Request, Response, NextFunction } from 'express'
import { logger } from '@ash/shared'

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()

  // Log request
  logger.info('API Gateway Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  })

  // Log response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime
    
    logger.info('API Gateway Response', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      timestamp: new Date().toISOString()
    })
  })

  next()
}