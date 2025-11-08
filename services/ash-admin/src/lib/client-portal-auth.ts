import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ashley-ai-client-portal-secret-key-2024';

export interface ClientPortalSession {
  client_id: string;
  workspace_id: string;
  email: string;
  name: string;
  type: 'client_portal';
}

/**
 * Get current client portal session from JWT token
 * @returns ClientPortalSession if authenticated, null otherwise
 */
export async function getClientPortalSession(): Promise<ClientPortalSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('client_portal_token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as ClientPortalSession;
    return decoded;
  } catch (error) {
    console.error('Error getting client portal session:', error);
    return null;
  }
}

/**
 * Require client portal authentication
 * Throws error if not authenticated
 */
export async function requireClientAuth(): Promise<ClientPortalSession> {
  const session = await getClientPortalSession();

  if (!session) {
    throw new Error('Unauthorized - Please log in to access client portal');
  }

  return session;
}

/**
 * Extract client session from request (useful for API routes)
 */
export async function getClientFromRequest(request: NextRequest): Promise<ClientPortalSession | null> {
  try {
    // Try to get from cookie
    const token = request.cookies.get('client_portal_token')?.value;

    if (!token) {
      // Try to get from Authorization header
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }

      const headerToken = authHeader.substring(7);
      const decoded = jwt.verify(headerToken, JWT_SECRET) as ClientPortalSession;
      return decoded;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as ClientPortalSession;
    return decoded;
  } catch (error) {
    console.error('Error getting client from request:', error);
    return null;
  }
}
