import jwt from 'jsonwebtoken'

// CRITICAL: JWT_SECRET must be set in environment variables
// Never use a fallback in production!
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h'

if (!JWT_SECRET) {
  throw new Error('CRITICAL SECURITY ERROR: JWT_SECRET environment variable is not set!')
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
  workspaceId: string
  iat?: number
  exp?: number
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    algorithm: 'HS256'
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    }) as JWTPayload

    return decoded
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.warn('Invalid JWT token:', error.message)
    } else if (error instanceof jwt.TokenExpiredError) {
      console.warn('JWT token expired:', error.message)
    } else {
      console.error('JWT verification error:', error)
    }
    return null
  }
}

export function refreshToken(token: string): string | null {
  const payload = verifyToken(token)
  if (!payload) {
    return null
  }

  const { iat, exp, ...tokenData } = payload
  return generateToken(tokenData)
}