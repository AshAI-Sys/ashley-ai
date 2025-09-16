import { Request, Response, NextFunction } from 'express'
import { body, param, query, validationResult } from 'express-validator'
import { logger } from '@ash/shared'

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }))

    logger.warn('Validation errors:', { errors: errorMessages, ip: req.ip })
    
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errorMessages
    })
  }
  next()
}

// Common validation rules
export const validateId = [
  param('id').isUUID().withMessage('Invalid ID format'),
  handleValidationErrors
]

export const validateWorkspaceId = [
  body('workspace_id').optional().isUUID().withMessage('Invalid workspace ID format'),
  handleValidationErrors
]

// Order validation
export const validateCreateOrder = [
  body('client_id').isUUID().withMessage('Valid client ID required'),
  body('brand_id').optional().isUUID().withMessage('Invalid brand ID format'),
  body('order_number').trim().isLength({ min: 1, max: 50 }).withMessage('Order number must be 1-50 characters'),
  body('total_amount').isFloat({ min: 0 }).withMessage('Total amount must be a positive number'),
  body('delivery_date').optional().isISO8601().withMessage('Invalid delivery date format'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes must not exceed 1000 characters'),
  handleValidationErrors
]

// Analytics validation
export const validateAnalysisRequest = [
  body('orderId').optional().isUUID().withMessage('Invalid order ID format'),
  body('bundleId').optional().isUUID().withMessage('Invalid bundle ID format'),
  body('employeeId').optional().isUUID().withMessage('Invalid employee ID format'),
  handleValidationErrors
]

// Query parameter validation
export const validatePaginationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().escape().isLength({ max: 100 }).withMessage('Search term too long'),
  handleValidationErrors
]

// File upload validation
export const validateFileUpload = [
  body('name').trim().isLength({ min: 1, max: 255 }).withMessage('File name must be 1-255 characters'),
  body('file_type').isIn(['image/jpeg', 'image/png', 'image/gif', 'application/pdf']).withMessage('Invalid file type'),
  handleValidationErrors
]

// Dashboard query validation
export const validateDashboardQuery = [
  query('period').optional().isIn(['7', '30', '90', '365']).withMessage('Period must be 7, 30, 90, or 365 days'),
  query('department').optional().trim().isIn(['cutting', 'printing', 'sewing', 'qc']).withMessage('Invalid department'),
  handleValidationErrors
]

// Sanitization helpers
export const sanitizeSearchTerm = (term: string): string => {
  return term.replace(/[<>"'%;()&+]/g, '').trim().substring(0, 100)
}

export const sanitizeOrderNumber = (orderNumber: string): string => {
  return orderNumber.replace(/[^a-zA-Z0-9-_]/g, '').trim().substring(0, 50)
}

// Rate limiting validation (additional security layer)
export const validateRateLimit = (windowMs: number, maxRequests: number) => {
  const requestLog = new Map<string, number[]>()
  
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip + ':' + (req.user?.id || 'anonymous')
    const now = Date.now()
    const windowStart = now - windowMs
    
    // Clean old requests
    if (requestLog.has(clientId)) {
      const requests = requestLog.get(clientId)!.filter(time => time > windowStart)
      requestLog.set(clientId, requests)
    } else {
      requestLog.set(clientId, [])
    }
    
    const currentRequests = requestLog.get(clientId)!
    
    if (currentRequests.length >= maxRequests) {
      logger.warn('Rate limit exceeded', { clientId, requests: currentRequests.length })
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs/1000} seconds.`,
        retryAfter: Math.ceil((currentRequests[0] + windowMs - now) / 1000)
      })
    }
    
    currentRequests.push(now)
    next()
  }
}

// Input sanitization for AI prompts (prevent injection)
export const sanitizeAIInput = (input: string): string => {
  return input
    .replace(/[<>"'&]/g, '') // Remove potential XSS characters
    .replace(/\bjavascript:/gi, '') // Remove javascript: protocol
    .replace(/\bon\w+=/gi, '') // Remove event handlers
    .trim()
    .substring(0, 2000) // Limit length for AI processing
}