"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET = GET;
const server_1 = require("next/server");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const metric = searchParams.get('metric') || 'defect_rate';
        const period = searchParams.get('period') || 'month';
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        switch (period) {
            case 'week':
                startDate.setDate(endDate.getDate() - 30); // Get 30 days for SPC
                break;
            case 'month':
                startDate.setDate(endDate.getDate() - 60); // Get 60 days
                break;
            case 'quarter':
                startDate.setDate(endDate.getDate() - 90); // Get 90 days
                break;
            default:
                startDate.setDate(endDate.getDate() - 30);
        }
        // Get daily aggregated data
        const dailyData = await prisma.$queryRaw `
      SELECT
        DATE(inspection_date) as date,
        COUNT(*) as total_inspections,
        AVG(CAST(sample_size AS DECIMAL)) as avg_sample_size,
        AVG(CAST(critical_found + major_found + minor_found AS DECIMAL)) as avg_defects,
        AVG(CASE WHEN result = 'ACCEPT' THEN 100.0 ELSE 0.0 END) as pass_rate
      FROM qc_inspections
      WHERE inspection_date >= ${startDate}
        AND inspection_date <= ${endDate}
      GROUP BY DATE(inspection_date)
      ORDER BY date ASC
    `;
        // Process data based on selected metric
        const spcData = dailyData.map((day) => {
            let value;
            switch (metric) {
                case 'defect_rate':
                    value = day.avg_sample_size > 0 ? (day.avg_defects / day.avg_sample_size) * 100 : 0;
                    break;
                case 'first_pass_yield':
                    value = day.pass_rate;
                    break;
                case 'cycle_time':
                    value = Math.random() * 2 + 6; // Mock cycle time data
                    break;
                default:
                    value = day.avg_defects;
            }
            return {
                date: day.date,
                value: value,
                inspections: Number(day.total_inspections)
            };
        });
        // Calculate control limits (simplified X-bar chart)
        const values = spcData.map(d => d.value).filter(v => !isNaN(v));
        if (values.length === 0) {
            return server_1.NextResponse.json([]);
        }
        const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
        const stdDev = Math.sqrt(variance);
        // Control limits (3-sigma)
        const controlLimits = {
            ucl: mean + (3 * stdDev),
            lcl: Math.max(0, mean - (3 * stdDev)),
            center_line: mean
        };
        // Add control limits and outlier detection to each point
        const finalData = spcData.map(point => ({
            date: point.date,
            value: point.value,
            inspections: point.inspections,
            is_outlier: point.value > controlLimits.ucl || point.value < controlLimits.lcl,
            control_limits: controlLimits
        }));
        return server_1.NextResponse.json(finalData);
    }
    catch (error) {
        console.error('Error generating SPC data:', error);
        return server_1.NextResponse.json({ error: 'Failed to generate SPC data' }, { status: 500 });
    }
}
