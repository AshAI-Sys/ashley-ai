import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthToken } from '@ash/types'
import { logger } from '@ash/shared/logger'

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

export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      })
    }

    if (!req.user.permissions.includes(permission as any)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Permission ${permission} required`
      })
    }

    next()
  }
}

export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      })
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Role ${role} required`
      })
    }

    next()
  }
}