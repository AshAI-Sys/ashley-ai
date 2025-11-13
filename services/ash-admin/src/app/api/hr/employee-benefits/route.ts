import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requirePermission } from '@/lib/auth-middleware';

export const dynamic = 'force-dynamic';

/**
 * GET /api/hr/employee-benefits
 * Fetch employee benefits with filters
 * Requires: hr:view permission
 */
export const GET = requirePermission('hr:view')(
  async (request: NextRequest, user) => {
    try {
      const { searchParams } = new URL(request.url);
      const workspace_id = user.workspaceId;

      const employee_id = searchParams.get('employee_id');
      const benefit_type_id = searchParams.get('benefit_type_id');
      const status = searchParams.get('status');

      // Build where clause
      const where: any = { workspace_id };

      if (employee_id) {
        where.employee_id = employee_id;
      }

      if (benefit_type_id) {
        where.benefit_type_id = benefit_type_id;
      }

      if (status) {
        where.status = status;
      }

      // Fetch employee benefits
      const benefits = await db.employeeBenefit.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employee_number: true,
              first_name: true,
              last_name: true,
              email: true,
              position: true,
              department: true,
            },
          },
          benefit_type: true,
        },
        orderBy: [
          { employee: { first_name: 'asc' } },
          { benefit_type: { name: 'asc' } },
        ],
      });

      return NextResponse.json({
        success: true,
        data: benefits,
      });
    } catch (error: any) {
      console.error('[HR] Employee benefits fetch error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch employee benefits' },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/hr/employee-benefits
 * Enroll employee in a benefit
 * Requires: hr:manage permission
 */
export const POST = requirePermission('hr:manage')(
  async (request: NextRequest, user) => {
    try {
      const body = await request.json();
      const {
        employee_id,
        benefit_type_id,
        enrollment_date,
        effective_start_date,
        effective_end_date,
        employee_contribution,
        employer_contribution,
        policy_number,
        notes,
      } = body;

      // Validate required fields
      if (!employee_id || !benefit_type_id || !enrollment_date || !effective_start_date ||
          employee_contribution === undefined || employer_contribution === undefined) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const workspace_id = user.workspaceId;

      // Validate employee exists
      const employee = await db.employee.findFirst({
        where: { id: employee_id, workspace_id },
      });

      if (!employee) {
        return NextResponse.json(
          { error: 'Employee not found' },
          { status: 404 }
        );
      }

      // Validate benefit type exists
      const benefitType = await db.benefitType.findFirst({
        where: { id: benefit_type_id, workspace_id, is_active: true },
      });

      if (!benefitType) {
        return NextResponse.json(
          { error: 'Benefit type not found or inactive' },
          { status: 404 }
        );
      }

      // Check if employee already enrolled in this benefit
      const existing = await db.employeeBenefit.findUnique({
        where: {
          workspace_id_employee_id_benefit_type_id: {
            workspace_id,
            employee_id,
            benefit_type_id,
          },
        },
      });

      if (existing && existing.status === 'ACTIVE') {
        return NextResponse.json(
          { error: 'Employee is already enrolled in this benefit' },
          { status: 400 }
        );
      }

      // Create or reactivate employee benefit
      const benefit = existing
        ? await db.employeeBenefit.update({
            where: { id: existing.id },
            data: {
              enrollment_date: new Date(enrollment_date),
              effective_start_date: new Date(effective_start_date),
              effective_end_date: effective_end_date ? new Date(effective_end_date) : null,
              employee_contribution: parseFloat(employee_contribution),
              employer_contribution: parseFloat(employer_contribution),
              policy_number,
              status: 'ACTIVE',
              notes,
            },
            include: {
              employee: {
                select: {
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
              benefit_type: true,
            },
          })
        : await db.employeeBenefit.create({
            data: {
              workspace_id,
              employee_id,
              benefit_type_id,
              enrollment_date: new Date(enrollment_date),
              effective_start_date: new Date(effective_start_date),
              effective_end_date: effective_end_date ? new Date(effective_end_date) : null,
              employee_contribution: parseFloat(employee_contribution),
              employer_contribution: parseFloat(employer_contribution),
              policy_number,
              status: 'ACTIVE',
              notes,
            },
            include: {
              employee: {
                select: {
                  first_name: true,
                  last_name: true,
                  email: true,
                },
              },
              benefit_type: true,
            },
          });

      return NextResponse.json({
        success: true,
        data: benefit,
      });
    } catch (error: any) {
      console.error('[HR] Employee benefit enrollment error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to enroll employee in benefit' },
        { status: 500 }
      );
    }
  }
);
