import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { logger } from '@ash/shared'

// Define AuthToken interface locally since it's missing from @ash/types
interface AuthToken {
  userId: string
  workspaceId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface AuthenticatedRequest extends Request {
  user?: AuthToken
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization header provided'
      })
    }

    const token = authHeader.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No token provided'
      })
    }

    const jwtSecret = process.env.ASH_JWT_SECRET
    if (!jwtSecret) {
      logger.error('JWT secret not configured')
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication configuration error'
      })
    }

    const decoded = jwt.verify(token, jwtSecret) as AuthToken
    req.user = decoded
    
    // Forward auth header to downstream services
    next()
    
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired'
      })
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      })
    }

    logger.error('Auth middleware error:', error)
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication error'
    })
  }
}