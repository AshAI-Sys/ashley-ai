import { Response } from 'express'
import { validationResult } from 'express-validator'
import { prisma, createWithWorkspace, logAudit } from '@ash/database'
import { AuthenticatedRequest } from '../middleware/auth'
import { logger } from '@ash/shared/logger'
import QRCode from 'qrcode'

// Stage 3: Cutting Operations
export const createCutLay = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { order_id, fabric_type, fabric_width, layer_count, total_length } = req.body

    // Verify order exists
    const order = await prisma.order.findFirst({
      where: {
        id: order_id,
        workspace_id: req.user!.workspace_id,
        deleted_at: null
      }
    })

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      })
    }

    // Generate lay number
    const layCount = await prisma.cutLay.count({
      where: { workspace_id: req.user!.workspace_id }
    })
    const lay_number = `LAY-${(layCount + 1).toString().padStart(4, '0')}`

    const cutLay = await prisma.cutLay.create({
      data: createWithWorkspace(req.user!.workspace_id, {
        order_id,
        lay_number,
        fabric_type,
        fabric_width,
        layer_count,
        total_length
      }),
      include: {
        order: {
          select: {
            order_number: true,
            client: { select: { name: true } }
          }
        }
      }
    })

    await logAudit({
      workspaceId: req.user!.workspace_id,
      userId: req.user!.user_id,
      action: 'CREATE',
      resource: 'cut_lay',
      resourceId: cutLay.id,
      newValues: cutLay,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })

    logger.info('Cut lay created', {
      cut_lay_id: cutLay.id,
      lay_number: cutLay.lay_number,
      order_id,
      workspace_id: req.user!.workspace_id
    })

    res.status(201).json(cutLay)

  } catch (error) {
    logger.error('Create cut lay error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create cut lay'
    })
  }
}

export const createBundlesFromCutting = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { cut_lay_id, bundles } = req.body

    // Verify cut lay exists
    const cutLay = await prisma.cutLay.findFirst({
      where: {
        id: cut_lay_id,
        workspace_id: req.user!.workspace_id
      },
      include: {
        order: {
          include: {
            line_items: true
          }
        }
      }
    })

    if (!cutLay) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Cut lay not found'
      })
    }

    const createdBundles = []
    const cutOutputs = []

    for (const bundleData of bundles) {
      // Generate bundle number and QR code
      const bundleCount = await prisma.bundle.count({
        where: { workspace_id: req.user!.workspace_id }
      })
      const bundle_number = `BDL-${(bundleCount + 1).toString().padStart(6, '0')}`
      const qr_code = `ASH-${bundle_number}-${Date.now()}`

      // Create bundle
      const bundle = await prisma.bundle.create({
        data: createWithWorkspace(req.user!.workspace_id, {
          order_id: cutLay.order_id,
          bundle_number,
          qr_code,
          garment_type: bundleData.garment_type,
          size: bundleData.size,
          quantity: bundleData.quantity,
          status: 'pending',
          current_stage: 'cutting',
          location: 'Cutting Department'
        })
      })

      // Create cut output record
      const cutOutput = await prisma.cutOutput.create({
        data: createWithWorkspace(req.user!.workspace_id, {
          cut_lay_id,
          bundle_id: bundle.id,
          pieces_cut: bundleData.quantity,
          wastage: bundleData.wastage || 0,
          notes: bundleData.notes,
          created_by: req.user!.user_id
        })
      })

      createdBundles.push(bundle)
      cutOutputs.push(cutOutput)
    }

    logger.info('Bundles created from cutting', {
      cut_lay_id,
      bundles_count: createdBundles.length,
      workspace_id: req.user!.workspace_id
    })

    res.status(201).json({
      message: `${createdBundles.length} bundles created successfully`,
      bundles: createdBundles,
      cut_outputs: cutOutputs
    })

  } catch (error) {
    logger.error('Create bundles from cutting error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create bundles from cutting'
    })
  }
}

// Stage 4: Printing Operations
export const createPrintRun = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { order_id, printing_method, machine_id, materials, notes } = req.body

    // Verify order exists
    const order = await prisma.order.findFirst({
      where: {
        id: order_id,
        workspace_id: req.user!.workspace_id,
        deleted_at: null
      }
    })

    if (!order) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Order not found'
      })
    }

    // Generate print run number
    const runCount = await prisma.printRun.count({
      where: { workspace_id: req.user!.workspace_id }
    })
    const run_number = `PR-${printing_method.toUpperCase()}-${(runCount + 1).toString().padStart(4, '0')}`

    const printRun = await prisma.$transaction(async (tx) => {
      // Create print run
      const run = await tx.printRun.create({
        data: createWithWorkspace(req.user!.workspace_id, {
          order_id,
          run_number,
          printing_method,
          machine_id,
          status: 'pending',
          notes,
          metadata: {
            created_by: req.user!.user_id,
            setup_requirements: printing_method
          }
        })
      })

      // Create material records
      if (materials && materials.length > 0) {
        const materialData = materials.map((material: any) => 
          createWithWorkspace(req.user!.workspace_id, {
            print_run_id: run.id,
            material: material.name,
            quantity: material.quantity,
            unit: material.unit,
            cost: material.cost || null
          })
        )

        await tx.printRunMaterial.createMany({
          data: materialData
        })
      }

      return run
    })

    const completeRun = await prisma.printRun.findUnique({
      where: { id: printRun.id },
      include: {
        materials: true,
        order: {
          select: {
            order_number: true,
            client: { select: { name: true } }
          }
        }
      }
    })

    logger.info('Print run created', {
      print_run_id: printRun.id,
      run_number: printRun.run_number,
      printing_method,
      order_id,
      workspace_id: req.user!.workspace_id
    })

    res.status(201).json(completeRun)

  } catch (error) {
    logger.error('Create print run error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create print run'
    })
  }
}

export const processPrintingBundles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { print_run_id, bundle_outputs } = req.body

    // Verify print run exists
    const printRun = await prisma.printRun.findFirst({
      where: {
        id: print_run_id,
        workspace_id: req.user!.workspace_id
      }
    })

    if (!printRun) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Print run not found'
      })
    }

    const printOutputs = []
    const bundleUpdates = []

    for (const output of bundle_outputs) {
      // Verify bundle exists
      const bundle = await prisma.bundle.findFirst({
        where: {
          id: output.bundle_id,
          workspace_id: req.user!.workspace_id
        }
      })

      if (!bundle) {
        logger.warn('Bundle not found for print output', { bundle_id: output.bundle_id })
        continue
      }

      // Create print output
      const printOutput = await prisma.printOutput.create({
        data: createWithWorkspace(req.user!.workspace_id, {
          print_run_id,
          bundle_id: output.bundle_id,
          pieces_printed: output.pieces_printed,
          quality_grade: output.quality_grade || 'A',
          notes: output.notes,
          created_by: req.user!.user_id
        })
      })

      // Update bundle status and location
      const updatedBundle = await prisma.bundle.update({
        where: { id: output.bundle_id },
        data: {
          current_stage: 'printing_completed',
          location: 'Printing Department - QC Queue'
        }
      })

      printOutputs.push(printOutput)
      bundleUpdates.push(updatedBundle)
    }

    // Update print run with completion data if all bundles processed
    const totalPrinted = printOutputs.reduce((sum, output) => sum + output.pieces_printed, 0)
    
    await prisma.printRun.update({
      where: { id: print_run_id },
      data: {
        pieces_printed: totalPrinted,
        status: 'completed',
        completed_at: new Date()
      }
    })

    logger.info('Printing bundles processed', {
      print_run_id,
      outputs_count: printOutputs.length,
      total_pieces: totalPrinted,
      workspace_id: req.user!.workspace_id
    })

    res.json({
      message: `${printOutputs.length} bundles processed successfully`,
      print_outputs: printOutputs,
      total_pieces_printed: totalPrinted
    })

  } catch (error) {
    logger.error('Process printing bundles error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process printing bundles'
    })
  }
}

// Stage 5: Sewing Operations
export const startSewingOperation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { bundle_id, operation, employee_id, piece_rate } = req.body

    // Verify bundle exists and is ready for sewing
    const bundle = await prisma.bundle.findFirst({
      where: {
        id: bundle_id,
        workspace_id: req.user!.workspace_id
      },
      include: {
        order: {
          select: {
            order_number: true,
            client: { select: { name: true } }
          }
        }
      }
    })

    if (!bundle) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Bundle not found'
      })
    }

    // Verify employee exists if provided
    if (employee_id) {
      const employee = await prisma.employee.findFirst({
        where: {
          id: employee_id,
          workspace_id: req.user!.workspace_id,
          department: 'Sewing',
          is_active: true,
          deleted_at: null
        }
      })

      if (!employee) {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Employee not found or not in Sewing department'
        })
      }
    }

    const sewingRun = await prisma.sewingRun.create({
      data: createWithWorkspace(req.user!.workspace_id, {
        bundle_id,
        operation,
        employee_id: employee_id || null,
        piece_rate: piece_rate || null,
        started_at: new Date()
      }),
      include: {
        bundle: {
          include: {
            order: {
              select: {
                order_number: true,
                client: { select: { name: true } }
              }
            }
          }
        }
      }
    })

    // Update bundle status
    await prisma.bundle.update({
      where: { id: bundle_id },
      data: {
        status: 'in_progress',
        current_stage: `sewing_${operation}`,
        location: 'Sewing Department'
      }
    })

    logger.info('Sewing operation started', {
      sewing_run_id: sewingRun.id,
      bundle_id,
      operation,
      employee_id,
      workspace_id: req.user!.workspace_id
    })

    res.status(201).json(sewingRun)

  } catch (error) {
    logger.error('Start sewing operation error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to start sewing operation'
    })
  }
}

export const completeSewingOperation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation Error',
        details: errors.array()
      })
    }

    const { sewing_run_id } = req.params
    const { pieces_completed, quality_notes } = req.body

    // Verify sewing run exists
    const sewingRun = await prisma.sewingRun.findFirst({
      where: {
        id: sewing_run_id,
        workspace_id: req.user!.workspace_id
      },
      include: {
        bundle: true
      }
    })

    if (!sewingRun) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Sewing run not found'
      })
    }

    if (sewingRun.completed_at) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Sewing run already completed'
      })
    }

    // Calculate earnings for piece-rate workers
    let earnings = 0
    if (sewingRun.piece_rate && pieces_completed) {
      earnings = sewingRun.piece_rate.toNumber() * pieces_completed
    }

    const updatedRun = await prisma.$transaction(async (tx) => {
      // Update sewing run
      const run = await tx.sewingRun.update({
        where: { id: sewing_run_id },
        data: {
          pieces_completed,
          earnings,
          completed_at: new Date(),
          notes: quality_notes
        }
      })

      // Update bundle status
      await tx.bundle.update({
        where: { id: sewingRun.bundle_id },
        data: {
          current_stage: 'sewing_completed',
          location: 'QC Queue'
        }
      })

      // Create earnings record for employee if piece-rate
      if (sewingRun.employee_id && earnings > 0) {
        // This would typically be aggregated into payroll periods
        // For now, we'll log it for future payroll processing
        logger.info('Piece-rate earnings generated', {
          employee_id: sewingRun.employee_id,
          sewing_run_id,
          pieces_completed,
          earnings,
          operation: sewingRun.operation
        })
      }

      return run
    })

    logger.info('Sewing operation completed', {
      sewing_run_id,
      pieces_completed,
      earnings,
      workspace_id: req.user!.workspace_id
    })

    res.json(updatedRun)

  } catch (error) {
    logger.error('Complete sewing operation error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to complete sewing operation'
    })
  }
}

// Generate QR codes for bundles
export const generateBundleQR = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bundle_id } = req.params

    const bundle = await prisma.bundle.findFirst({
      where: {
        id: bundle_id,
        workspace_id: req.user!.workspace_id
      },
      include: {
        order: {
          select: {
            order_number: true,
            client: { select: { name: true } }
          }
        }
      }
    })

    if (!bundle) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Bundle not found'
      })
    }

    // Generate QR code data
    const qrData = {
      type: 'bundle',
      id: bundle.id,
      bundle_number: bundle.bundle_number,
      order_number: bundle.order.order_number,
      workspace_id: req.user!.workspace_id,
      scan_url: `${process.env.ASH_STAFF_URL || 'http://localhost:3002'}/scan/${bundle.qr_code}`
    }

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    res.json({
      bundle,
      qr_code_data: qrData,
      qr_code_image: qrCodeDataUrl
    })

  } catch (error) {
    logger.error('Generate bundle QR error:', error)
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to generate QR code'
    })
  }
}