import { Request, Response, NextFunction } from 'express'
import { prisma } from '@ash/database'

export async function validateWorkspace(req: Request, res: Response, next: NextFunction) {
  try {
    const workspaceId = req.user?.workspace_id
    
    if (!workspaceId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Workspace ID not found in user context' 
      })
    }

    // Verify workspace exists and is active
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    })

    if (!workspace) {
      return res.status(404).json({ 
        success: false, 
        error: 'Workspace not found' 
      })
    }

    if (!workspace.is_active) {
      return res.status(403).json({ 
        success: false, 
        error: 'Workspace is inactive' 
      })
    }

    // Add workspace to request context
    req.workspace = workspace
    next()
  } catch (error) {
    console.error('Workspace validation error:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to validate workspace' 
    })
  }
}