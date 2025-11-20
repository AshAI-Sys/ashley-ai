/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';

// GET /api/dashboard/floor-status - Production floor real-time status
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    const workspaceId = user.workspaceId;

    // Mock production run counts (in real implementation, these would query actual tables)
    const activeCuttingRuns = 0;
    const activePrintingRuns = await prisma.printRun.count({
      where: {
        workspace_id: workspaceId,
        status: { in: ['PENDING', 'IN_PROGRESS', 'PAUSED'] }
      }
    });
    const activeSewingRuns = await prisma.sewingRun.count({
      where: {
        status: { in: ['PENDING', 'IN_PROGRESS'] }
      }
    });
    const activeQcInspections = await prisma.qCInspection.count({
      where: {
        workspace_id: workspaceId,
        status: 'IN_PROGRESS'
      }
    });

    // Get active employees by department
    const activeEmployees = await prisma.employee.groupBy({
      by: ['department'],
      where: {
        workspace_id: workspaceId,
        is_active: true
      },
      _count: {
        id: true
      }
    });

    // Production floor stations
    const floorStations = [
      {
        station_id: 'cutting-01',
        name: 'Cutting Station 1',
        type: 'CUTTING',
        status: activeCuttingRuns > 0 ? 'ACTIVE' : 'IDLE',
        current_run: activeCuttingRuns > 0 ? 'CTR-001' : null,
        operator: 'John Doe',
        efficiency: 87.5,
        units_today: 245
      },
      {
        station_id: 'print-01',
        name: 'Silkscreen Printer 1',
        type: 'PRINTING',
        status: activePrintingRuns > 0 ? 'ACTIVE' : 'IDLE',
        current_run: activePrintingRuns > 0 ? 'PRT-002' : null,
        operator: 'Jane Smith',
        efficiency: 92.1,
        units_today: 180
      },
      {
        station_id: 'sewing-01',
        name: 'Sewing Line A',
        type: 'SEWING',
        status: activeSewingRuns > 0 ? 'ACTIVE' : 'IDLE',
        current_run: activeSewingRuns > 0 ? 'SEW-003' : null,
        operator: 'Maria Garcia',
        efficiency: 85.3,
        units_today: 312
      },
      {
        station_id: 'qc-01',
        name: 'QC Station 1',
        type: 'QUALITY_CONTROL',
        status: activeQcInspections > 0 ? 'ACTIVE' : 'IDLE',
        current_inspection: activeQcInspections > 0 ? 'QC-004' : null,
        inspector: 'Robert Lee',
        pass_rate: 96.8,
        inspections_today: 28
      }
    ];

    // Department summaries
    const getCuttingCount = activeEmployees.find(e => e.department === 'CUTTING');
    const getPrintingCount = activeEmployees.find(e => e.department === 'PRINTING');
    const getSewingCount = activeEmployees.find(e => e.department === 'SEWING');
    const getQcCount = activeEmployees.find(e => e.department === 'QC');

    const departments = [
      {
        name: 'Cutting',
        active_runs: activeCuttingRuns,
        employees_count: getCuttingCount ? getCuttingCount._count.id : 0,
        efficiency: 87.5,
        status: activeCuttingRuns > 0 ? 'ACTIVE' : 'IDLE'
      },
      {
        name: 'Printing',
        active_runs: activePrintingRuns,
        employees_count: getPrintingCount ? getPrintingCount._count.id : 0,
        efficiency: 92.1,
        status: activePrintingRuns > 0 ? 'ACTIVE' : 'IDLE'
      },
      {
        name: 'Sewing',
        active_runs: activeSewingRuns,
        employees_count: getSewingCount ? getSewingCount._count.id : 0,
        efficiency: 85.3,
        status: activeSewingRuns > 0 ? 'ACTIVE' : 'IDLE'
      },
      {
        name: 'Quality Control',
        active_inspections: activeQcInspections,
        employees_count: getQcCount ? getQcCount._count.id : 0,
        pass_rate: 96.8,
        status: activeQcInspections > 0 ? 'ACTIVE' : 'IDLE'
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        floor_stations: floorStations,
        departments,
        overall_status: {
          total_active_stations: floorStations.filter(s => s.status === 'ACTIVE').length,
          total_stations: floorStations.length,
          overall_efficiency: 88.2,
          units_produced_today: 737,
          shift: 'Day Shift',
          shift_start: '07:00',
          shift_end: '15:00'
        },
        alerts: [
          {
            level: 'WARNING',
            station: 'sewing-01',
            message: 'Efficiency below target',
            timestamp: new Date().toISOString()
          }
        ]
      },
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching floor status:", error);
    return NextResponse.json(
      { error: "Failed to fetch floor status" },
      { status: 500 }
    );
  }
});
