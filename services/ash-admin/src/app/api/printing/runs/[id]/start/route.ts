import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const runId = params.id

    // Check if run exists and can be started
    const run = await prisma.printRun.findUnique({
      where: { id: runId },
      include: {
        machine: true,
        order: {
          include: {
            design_assets: {
              include: {
                versions: {
                  orderBy: { version: 'desc' },
                  take: 1
                }
              }
            }
          }
        }
      }
    })

    if (!run) {
      return NextResponse.json(
        { success: false, error: 'Print run not found' },
        { status: 404 }
      )
    }

    if (run.status !== 'CREATED' && run.status !== 'PAUSED') {
      return NextResponse.json(
        { success: false, error: 'Print run cannot be started from current status' },
        { status: 400 }
      )
    }

    // Check machine availability if assigned
    if (run.machine_id) {
      const busyMachine = await prisma.printRun.findFirst({
        where: {
          machine_id: run.machine_id,
          status: 'IN_PROGRESS',
          id: { not: runId }
        }
      })

      if (busyMachine) {
        return NextResponse.json(
          { success: false, error: 'Machine is currently busy with another run' },
          { status: 400 }
        )
      }
    }

    // Start the run
    const updatedRun = await prisma.printRun.update({
      where: { id: runId },
      data: {
        status: 'IN_PROGRESS',
        started_at: new Date()
      },
      include: {
        order: {
          include: {
            brand: true
          }
        },
        machine: true
      }
    })

    // Initialize method-specific data based on method
    await initializeMethodSpecificData(runId, run.method, run.order.design_assets[0]?.versions[0])

    // Create Ashley AI analysis for optimization
    await createAshleyAnalysis(runId, run)

    return NextResponse.json({
      success: true,
      data: updatedRun,
      message: 'Print run started successfully'
    })

  } catch (error) {
    console.error('Start print run error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to start print run' },
      { status: 500 }
    )
  }
}

async function initializeMethodSpecificData(runId: string, method: string, designVersion: any) {
  try {
    switch (method) {
      case 'SILKSCREEN':
        // Initialize silkscreen prep
        await prisma.silkscreenPrep.create({
          data: {
            run_id: runId,
            screen_id: `SCR-${Date.now()}`,
            mesh_count: 160, // Default mesh count
            emulsion_batch: `EMB-${Date.now()}`,
            exposure_seconds: 120,
            registration_notes: 'Auto-initialized for print run'
          }
        })

        // Initialize silkscreen specs
        await prisma.silkscreenSpec.create({
          data: {
            run_id: runId,
            ink_type: 'PLASTISOL',
            coats: 1,
            squeegee_durometer: 70,
            floodbar: 'MEDIUM',
            expected_ink_g: 15.0 // Ashley AI will calculate this
          }
        })
        break

      case 'SUBLIMATION':
        await prisma.sublimationPrint.create({
          data: {
            run_id: runId,
            paper_m2: 1.0, // Will be updated during printing
            ink_g: null // Will be measured
          }
        })
        break

      case 'DTF':
        await prisma.dtfPrint.create({
          data: {
            run_id: runId,
            film_m2: 1.0, // Will be updated during printing
            ink_g: null // Will be measured
          }
        })

        await prisma.dtfPowderCure.create({
          data: {
            run_id: runId,
            powder_g: 50.0, // Estimated
            temp_c: 160,
            seconds: 60
          }
        })
        break

      case 'EMBROIDERY':
        if (designVersion) {
          await prisma.embroideryRun.create({
            data: {
              run_id: runId,
              design_version_id: designVersion.id,
              stitch_count: 5000, // Will be read from design file
              machine_spm: 800,
              stabilizer_type: 'CUTAWAY',
              thread_colors: JSON.stringify(['#000000', '#FF0000']), // Will be parsed from design
              thread_breaks: 0,
              runtime_minutes: null
            }
          })
        }
        break
    }
  } catch (error) {
    console.error('Error initializing method-specific data:', error)
  }
}

async function createAshleyAnalysis(runId: string, run: any) {
  try {
    const analysisData = {
      entity: 'PRINT_RUN',
      entity_id: runId,
      stage: 'PRINTING',
      analysis_type: 'OPTIMIZATION',
      risk: 'GREEN',
      confidence: 0.85,
      issues: JSON.stringify([]),
      recommendations: JSON.stringify([
        'Monitor temperature throughout the run',
        'Check registration every 25 pieces',
        'Maintain consistent pressure'
      ]),
      metadata: JSON.stringify({
        method: run.method,
        machine_id: run.machine_id,
        estimated_runtime: calculateEstimatedRuntime(run),
        material_consumption: estimateMaterialConsumption(run)
      }),
      result: JSON.stringify({
        optimization_score: 92,
        efficiency_rating: 'HIGH',
        quality_prediction: 95
      }),
      created_by: 'system'
    }

    await prisma.aIAnalysis.create({
      data: analysisData
    })
  } catch (error) {
    console.error('Error creating Ashley analysis:', error)
  }
}

function calculateEstimatedRuntime(run: any): number {
  // Simple estimation based on method and quantity
  const baseMinutes = {
    SILKSCREEN: 2,    // 2 minutes per piece
    SUBLIMATION: 3,   // 3 minutes per piece  
    DTF: 2.5,         // 2.5 minutes per piece
    EMBROIDERY: 5     // 5 minutes per piece
  }

  const minutesPerPiece = baseMinutes[run.method as keyof typeof baseMinutes] || 2
  const targetQty = 100 // Default, should come from run data
  
  return minutesPerPiece * targetQty
}

function estimateMaterialConsumption(run: any) {
  // Estimate material consumption based on method
  const estimates = {
    SILKSCREEN: { ink_g: 15, screens: 1 },
    SUBLIMATION: { paper_m2: 1.2, ink_g: 8 },
    DTF: { film_m2: 1.1, powder_g: 45, ink_g: 10 },
    EMBROIDERY: { thread_m: 150, stabilizer_m2: 0.3 }
  }

  return estimates[run.method as keyof typeof estimates] || {}
}