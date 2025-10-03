import { NextRequest, NextResponse } from 'next/server'
import { backupService } from '@/lib/backup/service'
import { backupScheduler } from '@/lib/backup/scheduler'

// GET /api/backups - List all backups
export async function GET(request: NextRequest) {
  try {
    const backups = await backupService.listBackups()
    const totalSize = await backupService.getTotalBackupSize()
    const schedulerConfig = backupScheduler.getConfig()

    return NextResponse.json({
      success: true,
      backups,
      total: backups.length,
      totalSize,
      scheduler: {
        ...schedulerConfig,
        running: backupScheduler.isRunning(),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to list backups', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/backups - Create new backup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { name, compress = true, includeData = true, includeSchema = true } = body

    const backup = await backupService.createBackup({
      name,
      compress,
      includeData,
      includeSchema,
    })

    return NextResponse.json({
      success: true,
      backup,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create backup', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/backups?id={backupId} - Delete backup
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const backupId = searchParams.get('id')

    if (!backupId) {
      return NextResponse.json({ error: 'Backup ID is required' }, { status: 400 })
    }

    await backupService.deleteBackup(backupId)

    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete backup', details: error.message },
      { status: 500 }
    )
  }
}
