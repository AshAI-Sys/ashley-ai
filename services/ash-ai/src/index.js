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
const shared_1 = require("@ash/shared");
const error_handler_1 = require("./middleware/error-handler");
const request_logger_1 = require("./middleware/request-logger");
// Services
const ashley_ai_1 = require("./services/ashley-ai");
// Routes
const analysis_1 = require("./controllers/analysis");
const predictions_1 = require("./controllers/predictions");
const recommendations_1 = require("./controllers/recommendations");
const insights_1 = require("./controllers/insights");
const analytics_1 = require("./routes/analytics");
// Jobs
const jobs_1 = require("./jobs");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.ASH_AI_PORT || 4001;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.ASH_ALLOWED_ORIGINS?.split(',') || []
        : true,
    credentials: true
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Higher limit for AI service
    message: 'Too many requests from this IP'
});
app.use(limiter);
// Body parsing
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Logging
app.use(request_logger_1.requestLogger);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'ashley-ai',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        ai_model: 'gpt-4',
        capabilities: [
            'capacity_analysis',
            'quality_prediction',
            'route_optimization',
            'stock_forecasting',
            'anomaly_detection',
            'performance_insights'
        ]
    });
});
// API routes
app.use('/api/analysis', analysis_1.analysisRouter);
app.use('/api/predictions', predictions_1.predictionsRouter);
app.use('/api/recommendations', recommendations_1.recommendationsRouter);
app.use('/api/insights', insights_1.insightsRouter);
app.use('/api/ai', analytics_1.analyticsRouter);
// Initialize Ashley AI
const ashley = new ashley_ai_1.AshleyAI();
ashley.initialize().then(() => {
    shared_1.logger.info('Ashley AI initialized successfully');
}).catch((error) => {
    shared_1.logger.error('Failed to initialize Ashley AI:', error);
});
// Setup background jobs
(0, jobs_1.setupJobs)();
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
    ashley.shutdown();
    process.exit(0);
});
process.on('SIGINT', () => {
    shared_1.logger.info('SIGINT received, shutting down gracefully');
    ashley.shutdown();
    process.exit(0);
});
// Start server
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        shared_1.logger.info(`Ashley AI service listening on port ${PORT}`);
    });
}
exports.default = app;
