import { db } from '@ash-ai/database';
import { hash } from './crypto'
import { NextRequest } from 'next/server'

const prisma = db

/**
 * Create a new user session
 */
export async function createSession(
  userId: string,
  token: string,
  request?: NextRequest,
  expiresInHours: number = 24
): Promise<string> {
  const tokenHash = hash(token)
  const ipAddress = request?.ip || request?.headers.get('x-forwarded-for') || 'unknown'
  const userAgent = request?.headers.get('user-agent') || 'unknown'

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + expiresInHours)

  await prisma.userSession.create({
    data: {
      user_id: userId,
      token_hash: tokenHash,
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: expiresAt,
    }
  })

  return tokenHash
}

/**
 * Validate and update session activity
 */
export async function validateSession(token: string): Promise<boolean> {
  const tokenHash = hash(token)

  const session = await prisma.userSession.findUnique({
    where: { token_hash: tokenHash }
  })

  if (!session) {
    return false
  }

  // Check if session is active and not expired
  if (!session.is_active || session.revoked_at) {
    return false
  }

  if (new Date() > session.expires_at) {
    // Session expired, revoke it
    await revokeSession(tokenHash)
    return false
  }

  // Update last activity
  await prisma.userSession.update({
    where: { token_hash: tokenHash },
    data: { last_activity: new Date() }
  })

  return true
}

/**
 * Revoke a specific session
 */
export async function revokeSession(tokenHash: string): Promise<void> {
  await prisma.userSession.updateMany({
    where: { token_hash: tokenHash },
    data: {
      is_active: false,
      revoked_at: new Date()
    }
  })
}

/**
 * Revoke all sessions for a user
 */
export async function revokeAllUserSessions(userId: string): Promise<number> {
  const result = await prisma.userSession.updateMany({
    where: {
      user_id: userId,
      is_active: true
    },
    data: {
      is_active: false,
      revoked_at: new Date()
    }
  })

  return result.count
}

/**
 * Get active sessions for a user
 */
export async function getUserActiveSessions(userId: string) {
  return await prisma.userSession.findMany({
    where: {
      user_id: userId,
      is_active: true,
      expires_at: {
        gt: new Date()
      }
    },
    orderBy: {
      last_activity: 'desc'
    }
  })
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await prisma.userSession.deleteMany({
    where: {
      expires_at: {
        lt: new Date()
      }
    }
  })

  return result.count
}

/**
 * Get session statistics for a user
 */
export async function getUserSessionStats(userId: string) {
  const [activeSessions, totalSessions, recentLogins] = await Promise.all([
    prisma.userSession.count({
      where: {
        user_id: userId,
        is_active: true,
        expires_at: { gt: new Date() }
      }
    }),
    prisma.userSession.count({
      where: { user_id: userId }
    }),
    prisma.userSession.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        id: true,
        ip_address: true,
        user_agent: true,
        is_active: true,
        last_activity: true,
        created_at: true
      }
    })
  ])

  return {
    activeSessions,
    totalSessions,
    recentLogins
  }
}
