"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const shared_1 = require("@ash/shared");
const error_handler_1 = require("./middleware/error-handler");
const auth_1 = require("./middleware/auth");
const request_logger_1 = require("./middleware/request-logger");
const performance_1 = require("./middleware/performance");
const background_optimizer_1 = require("./services/background-optimizer");
const performance_2 = require("./config/performance");
// Routes
const health_1 = require("./routes/health");
const auth_2 = require("./routes/auth");
const clients_1 = require("./routes/clients");
const orders_1 = require("./routes/orders");
const designs_1 = require("./routes/designs");
const portal_1 = require("./routes/portal");
const production_1 = require("./routes/production");
const production_stages_1 = require("./routes/production-stages");
const finance_1 = require("./routes/finance");
const hr_1 = require("./routes/hr");
const dashboard_1 = require("./routes/dashboard");
const cutting_1 = __importDefault(require("./routes/cutting"));
const printing_1 = __importDefault(require("./routes/printing"));
const sewing_1 = __importDefault(require("./routes/sewing"));
const quality_control_1 = __importDefault(require("./routes/quality-control"));
const capa_1 = __importDefault(require("./routes/capa"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.ASH_CORE_PORT || 4000;
// Create uploads directory if it doesn't exist
const fs_1 = require("fs");
const uploadsDir = path_1.default.join(process.cwd(), 'uploads/designs');
if (!(0, fs_1.existsSync)(uploadsDir)) {
    (0, fs_1.mkdirSync)(uploadsDir, { recursive: true });
}
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.ASH_ALLOWED_ORIGINS?.split(',') || []
        : true,
    credentials: true
}));
// Rate limiting (optimized)
const limiter = (0, express_rate_limit_1.default)({
    windowMs: performance_2.PERFORMANCE_CONFIG.CACHE.TTL.SEARCH_RESULTS * 1000,
    max: 1000, // Increased for better performance
    message: { error: 'Rate limit exceeded', retryAfter: 600 },
    standardHeaders: true,
    legacyHeaders: false
});
app.use('/api', limiter);
// Body parsing with compression
app.use((0, compression_1.default)({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression_1.default.filter(req, res);
    },
    level: performance_2.PERFORMANCE_CONFIG.API.GZIP_LEVEL
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Performance monitoring
app.use(performance_1.performanceMonitor);
// Static file serving for uploads (with caching)
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads'), {
    maxAge: '7d',
    etag: true,
    lastModified: true
}));
// Logging
app.use(request_logger_1.requestLogger);
// Health check (no auth required)
app.use('/health', health_1.healthRouter);
// Performance metrics endpoint
app.get('/performance', (req, res) => {
    const metrics = (0, performance_1.getHealthMetrics)();
    res.json(metrics);
});
// Authentication routes (no auth required for login/register)
app.use('/api/auth', auth_2.authRouter);
// Protected routes (require authentication)
app.use('/api/clients', auth_1.authMiddleware, clients_1.clientsRouter);
app.use('/api/orders', auth_1.authMiddleware, orders_1.ordersRouter);
app.use('/api/designs', auth_1.authMiddleware, designs_1.designsRouter);
app.use('/api/production', auth_1.authMiddleware, production_1.productionRouter);
app.use('/api/production-stages', auth_1.authMiddleware, production_stages_1.productionStagesRouter);
app.use('/api/cutting', auth_1.authMiddleware, cutting_1.default);
app.use('/api/printing', auth_1.authMiddleware, printing_1.default);
app.use('/api/sewing', auth_1.authMiddleware, sewing_1.default);
app.use('/api/quality-control', auth_1.authMiddleware, quality_control_1.default);
app.use('/api/capa', auth_1.authMiddleware, capa_1.default);
app.use('/api/finance', auth_1.authMiddleware, finance_1.financeRouter);
app.use('/api/hr', auth_1.authMiddleware, hr_1.hrRouter);
app.use('/api/dashboard', dashboard_1.dashboardRouter);
// Public portal routes (no authentication required)
app.use('/api/portal', portal_1.portalRouter);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`
    });
});
// Global error handler
app.use(error_handler_1.errorHandler);
// Graceful shutdown
process.on('SIGTERM', () => {
    shared_1.logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    shared_1.logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});
// Start server
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        shared_1.logger.info(`ASH Core service listening on port ${PORT}`);
        shared_1.logger.info(`File uploads available at: /uploads`);
        shared_1.logger.info(`Performance metrics available at: /performance`);
        // Start background optimization services
        background_optimizer_1.backgroundOptimizer.start();
        shared_1.logger.info('Background optimization services started');
    });
}
exports.default = app;
