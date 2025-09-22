"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
exports.POST = POST;
exports.PUT = PUT;
exports.DELETE = DELETE;
const server_1 = require("next/server");
const db_1 = require("../../../../lib/db");
// GET /api/automation/templates - Get notification templates
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const workspaceId = searchParams.get('workspace_id') || 'workspace_1';
        const category = searchParams.get('category');
        const type = searchParams.get('type');
        const isActive = searchParams.get('is_active');
        const where = { workspace_id: workspaceId };
        if (category)
            where.category = category;
        if (type)
            where.type = type;
        if (isActive !== null)
            where.is_active = isActive === 'true';
        const templates = await db_1.prisma.notificationTemplate.findMany({
            where,
            include: {
                user: {
                    select: { id: true, email: true, username: true }
                },
                notifications: {
                    take: 5,
                    orderBy: { created_at: 'desc' },
                    select: {
                        id: true,
                        status: true,
                        created_at: true,
                        sent_at: true
                    }
                }
            },
            orderBy: { updated_at: 'desc' }
        });
        // Add usage statistics
        const templatesWithStats = await Promise.all(templates.map(async (template) => {
            const stats = await db_1.prisma.notification.groupBy({
                by: ['status'],
                where: { template_id: template.id },
                _count: { id: true }
            });
            const usage = stats.reduce((acc, stat) => {
                acc[stat.status.toLowerCase()] = stat._count.id;
                return acc;
            }, {});
            return {
                ...template,
                usage_stats: {
                    total: Object.values(usage).reduce((sum, count) => sum + count, 0),
                    ...usage
                }
            };
        }));
        return server_1.NextResponse.json({
            success: true,
            data: templatesWithStats,
            meta: {
                total: templates.length,
                filters: { category, type, isActive }
            }
        });
    }
    catch (error) {
        console.error('Error fetching notification templates:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to fetch notification templates' }, { status: 500 });
    }
}
// POST /api/automation/templates - Create notification template
async function POST(request) {
    try {
        const body = await request.json();
        const { workspace_id = 'workspace_1', name, category, type, subject_template, body_template, variables, is_active = true, created_by = 'user_1' } = body;
        // Validate required fields
        if (!name || !category || !type || !body_template) {
            return server_1.NextResponse.json({ success: false, error: 'Missing required fields: name, category, type, body_template' }, { status: 400 });
        }
        // Validate variables array if provided
        let variablesJson = null;
        if (variables) {
            try {
                variablesJson = JSON.stringify(variables);
            }
            catch (err) {
                return server_1.NextResponse.json({ success: false, error: 'Invalid JSON in variables field' }, { status: 400 });
            }
        }
        const template = await db_1.prisma.notificationTemplate.create({
            data: {
                workspace_id,
                name,
                category,
                type,
                subject_template,
                body_template,
                variables: variablesJson,
                is_active,
                created_by
            },
            include: {
                user: {
                    select: { id: true, email: true, username: true }
                }
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: template,
            message: 'Notification template created successfully'
        });
    }
    catch (error) {
        console.error('Error creating notification template:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to create notification template' }, { status: 500 });
    }
}
// PUT /api/automation/templates - Update notification template
async function PUT(request) {
    try {
        const body = await request.json();
        const { id, ...updateData } = body;
        if (!id) {
            return server_1.NextResponse.json({ success: false, error: 'Template ID is required' }, { status: 400 });
        }
        // Convert variables to JSON string if provided
        if (updateData.variables) {
            updateData.variables = JSON.stringify(updateData.variables);
        }
        const template = await db_1.prisma.notificationTemplate.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: { id: true, email: true, username: true }
                }
            }
        });
        return server_1.NextResponse.json({
            success: true,
            data: template,
            message: 'Notification template updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating notification template:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to update notification template' }, { status: 500 });
    }
}
// DELETE /api/automation/templates - Delete notification template
async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return server_1.NextResponse.json({ success: false, error: 'Template ID is required' }, { status: 400 });
        }
        // Check if template is system template
        const template = await db_1.prisma.notificationTemplate.findUnique({
            where: { id }
        });
        if (template?.is_system) {
            return server_1.NextResponse.json({ success: false, error: 'Cannot delete system template' }, { status: 400 });
        }
        await db_1.prisma.notificationTemplate.delete({
            where: { id }
        });
        return server_1.NextResponse.json({
            success: true,
            message: 'Notification template deleted successfully'
        });
    }
    catch (error) {
        console.error('Error deleting notification template:', error);
        return server_1.NextResponse.json({ success: false, error: 'Failed to delete notification template' }, { status: 500 });
    }
}
