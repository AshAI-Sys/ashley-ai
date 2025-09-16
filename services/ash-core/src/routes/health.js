"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthRouter = void 0;
const express_1 = require("express");
const database_1 = require("@ash/database");
const router = (0, express_1.Router)();
exports.healthRouter = router;
router.get('/', async (req, res) => {
    try {
        // Check database connection
        await database_1.prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'healthy',
            service: 'ash-core',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            database: 'connected'
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            service: 'ash-core',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: 'Database connection failed'
        });
    }
});
