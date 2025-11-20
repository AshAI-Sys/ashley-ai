/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';

// POST /api/ashley/validate-design - AI-powered design validation
export const POST = requireAuth(async (request: NextRequest, _user) => {
  try {
    const data = await request.json();
    const {
      design_url,
      design_type,
      garment_type,
      print_method,
      colors_count,
      dimensions
    } = data;

    if (!design_url) {
      return NextResponse.json(
        { error: "Design URL is required" },
        { status: 400 }
      );
    }

    // Mock AI validation checks
    const validationResults = {
      overall_score: 85,
      status: 'APPROVED_WITH_WARNINGS',
      checks: [
        {
          category: 'Resolution',
          status: 'PASS',
          score: 95,
          message: 'Image resolution is sufficient for printing',
          details: 'Detected: 300 DPI, Recommended: 300 DPI minimum'
        },
        {
          category: 'Color Profile',
          status: 'WARNING',
          score: 75,
          message: 'Color profile may need adjustment',
          details: 'RGB detected, CMYK recommended for printing'
        },
        {
          category: 'File Format',
          status: 'PASS',
          score: 100,
          message: 'File format is compatible',
          details: 'PNG format detected, suitable for all print methods'
        },
        {
          category: 'Dimensions',
          status: 'PASS',
          score: 90,
          message: 'Design dimensions are within acceptable range',
          details: dimensions ? `${dimensions.width}x${dimensions.height}mm` : 'Standard size detected'
        },
        {
          category: 'Print Method Compatibility',
          status: print_method ? 'PASS' : 'INFO',
          score: print_method ? 95 : 80,
          message: print_method
            ? `Design is compatible with ${print_method} printing`
            : 'Print method not specified',
          details: 'Recommended: Silkscreen or DTF for best results'
        }
      ],
      recommendations: [
        'Convert color profile to CMYK for accurate color reproduction',
        'Add 3mm bleed area for edge-to-edge prints',
        'Consider simplifying design for better silkscreen results',
        'Test print recommended before full production run'
      ],
      estimated_costs: {
        setup_cost: colors_count ? colors_count * 250 : 500,
        unit_cost: print_method === 'SILKSCREEN' ? 15 :
                   print_method === 'DTF' ? 25 :
                   print_method === 'SUBLIMATION' ? 30 : 20,
        currency: 'PHP'
      },
      ashley_confidence: 0.87,
      processing_time_ms: 1245
    };

    // Determine overall approval status
    const hasErrors = validationResults.checks.some(c => c.status === 'FAIL');
    const hasWarnings = validationResults.checks.some(c => c.status === 'WARNING');

    let approvalStatus = 'APPROVED';
    if (hasErrors) {
      approvalStatus = 'REJECTED';
    } else if (hasWarnings) {
      approvalStatus = 'APPROVED_WITH_WARNINGS';
    }

    return NextResponse.json({
      success: true,
      message: 'Design validation completed',
      validation: {
        ...validationResults,
        approval_status: approvalStatus,
        design_info: {
          url: design_url,
          type: design_type || 'unknown',
          garment_type: garment_type || 'unknown',
          print_method: print_method || 'not_specified',
          colors_count: colors_count || 0
        },
        validated_at: new Date().toISOString(),
        validator: 'Ashley AI Design Validator v2.1'
      }
    });
  } catch (error) {
    console.error("Error validating design:", error);
    return NextResponse.json(
      { error: "Failed to validate design" },
      { status: 500 }
    );
  }
});

// GET /api/ashley/validate-design - Get validation history
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    // Mock validation history
    const history = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      id: `val-${i + 1}`,
      design_url: `https://example.com/design-${i + 1}.png`,
      overall_score: 80 + Math.floor(Math.random() * 20),
      approval_status: i % 3 === 0 ? 'REJECTED' : i % 2 === 0 ? 'APPROVED_WITH_WARNINGS' : 'APPROVED',
      validated_at: new Date(Date.now() - i * 86400000).toISOString(),
      workspace_id: user.workspaceId
    }));

    return NextResponse.json({
      success: true,
      data: {
        validations: history,
        total: history.length
      }
    });
  } catch (error) {
    console.error("Error fetching validation history:", error);
    return NextResponse.json(
      { error: "Failed to fetch validation history" },
      { status: 500 }
    );
  }
});
