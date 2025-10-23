/* eslint-disable */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { requireAuth } from "@/lib/auth-middleware";

const prisma = db;

// GET /api/reports - List all reports for workspace
export const GET = requireAuth(async (req: NextRequest, _user) => {
  try {
    const workspaceId =
      req.headers.get("x-workspace-id") || "default-workspace";
    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const dataSource = url.searchParams.get("dataSource");
    const createdBy = url.searchParams.get("createdBy");
    const isPublic = url.searchParams.get("isPublic");
    const isFavorite = url.searchParams.get("isFavorite");

    const where: any = { workspace_id: workspaceId };

    if (type) where.report_type = type;
    if (dataSource) where.data_source = dataSource;
    if (createdBy) where.created_by = createdBy;
    if (isPublic !== null) where.is_public = isPublic === "true";
    if (isFavorite !== null) where.is_favorite = isFavorite === "true";

    const reports = await prisma.customReport.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        _count: {
          select: {
            executions: true,
            exports: true,
            shares: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      });

    return NextResponse.json({
      success: true,
      reports: reports.map(r => ({
        ...r,
        query_config: JSON.parse(r.query_config),
        visualization: r.visualization ? JSON.parse(r.visualization) : null,
        columns: JSON.parse(r.columns),
        filters: r.filters ? JSON.parse(r.filters) : null,
        sort_order: r.sort_order ? JSON.parse(r.sort_order) : null,
        schedule_config: r.schedule_config
          ? JSON.parse(r.schedule_config)
          : null,
      })),
  } catch (error: any) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

// POST /api/reports - Create new report
export const POST = requireAuth(async (req: NextRequest, user) => {
  try {
    const workspaceId =
      req.headers.get("x-workspace-id") || "default-workspace";
    const userId = req.headers.get("x-user-id") || "system";
    const body = await req.json();

    const {
      name,
      description,
      report_type,
      data_source,
      query_config,
      visualization,
      columns,
      filters,
      sort_order,
      schedule,
      schedule_config,
      is_public,
    } = body;

    // Validate required fields
    if (!name || !report_type || !data_source || !query_config || !columns) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const report = await prisma.customReport.create({
      data: {
        workspace_id: workspaceId,
        name,
        description,
        report_type,
        data_source,
        query_config: JSON.stringify(query_config),
        visualization: visualization ? JSON.stringify(visualization) : null,
        columns: JSON.stringify(columns),
        filters: filters ? JSON.stringify(filters) : null,
        sort_order: sort_order ? JSON.stringify(sort_order) : null,
        schedule,
        schedule_config: schedule_config
          ? JSON.stringify(schedule_config)
          : null,
        is_public: is_public || false,
        created_by: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
      });

    return NextResponse.json({
      success: true,
      report: {
        ...report,
        query_config: JSON.parse(report.query_config),
        visualization: report.visualization
          ? JSON.parse(report.visualization)
          : null,
        columns: JSON.parse(report.columns),
        filters: report.filters ? JSON.parse(report.filters) : null,
        sort_order: report.sort_order ? JSON.parse(report.sort_order) : null,
        schedule_config: report.schedule_config
          ? JSON.parse(report.schedule_config)
          : null,
      },
});
} catch (error: any) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});