import { NextRequest, NextResponse } from 'next/server';
import { defectDetectionAI } from '@/lib/ai/defect-detection';
import { prisma } from '@/lib/db';

// POST /api/ai/defect-detection - Detect defects in image
export async function POST(req: NextRequest) {
  try {
    const { image_url, image_base64, garment_type, bundle_id } = await req.json();

    if (!image_url && !image_base64) {
      return NextResponse.json(
        { error: 'Either image_url or image_base64 is required' },
        { status: 400 }
      );
    }

    const image = {
      url: image_url || '',
      base64: image_base64,
    };

    // Perform defect detection
    const result = await defectDetectionAI.detectDefects(image, garment_type);

    // Optionally save results to database if bundle_id provided
    if (bundle_id && result.defects_found > 0) {
      // Create QC check record
      const qcCheck = await prisma.qCInspection.create({
        data: {
          workspace_id: 'default',
          order_id: 'unknown', // TODO: Get from bundle if available
          inspector_id: 'AI-SYSTEM',
          stage: 'FINAL',
          inspection_level: 'GII',
          aql: 2.5,
          lot_size: 1,
          sample_size: 1,
          acceptance: 0,
          rejection: 1,
          inspection_date: new Date(),
          status: result.pass_fail === 'PASS' ? 'PASSED' : 'FAILED',
          result: result.pass_fail === 'PASS' ? 'PASSED' : 'FAILED',
          critical_found: 0,
          major_found: result.defects_found,
          minor_found: 0,
          notes: `AI detected ${result.defects_found} defect(s). Quality score: ${result.quality_score}%. Confidence: ${result.confidence}%`,
        },
      });

      // Create defect records
      for (const defect of result.detected_defects) {
        await prisma.qCDefectType.upsert({
          where: {
            workspace_id_code: {
              workspace_id: 'default',
              code: defect.type
            }
          },
          update: {},
          create: {
            workspace_id: 'default',
            code: defect.type,
            name: defect.description,
            severity: defect.severity,
            category: defect.type.includes('PRINT') ? 'PRINT' : defect.type.includes('STITCH') || defect.type.includes('SEAM') ? 'SEWING' : 'FABRIC',
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error('Defect detection error:', error);
    return NextResponse.json(
      { error: 'Failed to detect defects', details: error.message },
      { status: 500 }
    );
  }
}

// GET /api/ai/defect-detection/batch?bundle_ids=xxx,yyy - Batch defect detection
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const bundleIdsParam = searchParams.get('bundle_ids');

    if (!bundleIdsParam) {
      return NextResponse.json(
        { error: 'bundle_ids parameter required' },
        { status: 400 }
      );
    }

    const bundleIds = bundleIdsParam.split(',');

    // Get QC checks with photos for these bundles
    const qcChecks = await prisma.qCInspection.findMany({
      where: {
        workspace_id: 'default',
      },
      include: {
        order: true,
      },
    });

    if (qcChecks.length === 0) {
      return NextResponse.json({
        success: true,
        results: [],
        message: 'No QC photos found for provided bundles',
      });
    }

    // Perform batch defect detection
    const images = qcChecks.flatMap(qc =>
      qc.photos.map((photo: any) => ({ url: photo, base64: undefined }))
    );

    const results = await defectDetectionAI.detectDefectsBatch(images);

    // Combine with QC check info
    const response = results.map((result, idx) => ({
      qc_check_id: qcChecks[Math.floor(idx / qcChecks[0].photos.length)]?.id,
      bundle_id: qcChecks[Math.floor(idx / qcChecks[0].photos.length)]?.bundle_id,
      image_url: images[idx].url,
      ...result,
    }));

    return NextResponse.json({
      success: true,
      results: response,
      total_analyzed: results.length,
    });
  } catch (error: any) {
    console.error('Batch defect detection error:', error);
    return NextResponse.json(
      { error: 'Failed to detect defects', details: error.message },
      { status: 500 }
    );
  }
}
