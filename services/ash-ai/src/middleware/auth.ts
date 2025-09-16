import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface AuthenticatedUser {
  id: string
  workspace_id: string
  email: string
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser
      workspace?: any
    }
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      })
    }

    const token = authHeader.substring(7)
    const secret = process.env.ASH_JWT_SECRET

    if (!secret) {
      return res.status(500).json({ 
        success: false, 
        error: 'JWT secret not configured' 
      })
    }

    const decoded = jwt.verify(token, secret) as any
    req.user = decoded
    next()
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      })
    }
    
    console.error('Auth middleware error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Authentication failed' 
    })
  }
}