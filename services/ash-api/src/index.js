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
const http_proxy_middleware_1 = require("http-proxy-middleware");
const dotenv_1 = __importDefault(require("dotenv"));
const shared_1 = require("@ash/shared");
const auth_1 = require("./middleware/auth");
const request_logger_1 = require("./middleware/request-logger");
const error_handler_1 = require("./middleware/error-handler");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.ASH_API_PORT || 3000;
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
    max: 1000, // Higher limit for API gateway
    message: 'Too many requests from this IP'
});
app.use(limiter);
// Body parsing
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Logging
app.use(request_logger_1.requestLogger);
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'ash-api',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});
// Service endpoints
const CORE_SERVICE_URL = process.env.ASH_CORE_URL || 'http://localhost:4000';
const AI_SERVICE_URL = process.env.ASH_AI_URL || 'http://localhost:4001';
// Auth routes (proxy to core service, no auth required)
app.use('/api/auth', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: CORE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': '/api/auth'
    },
    onError: (err, req, res) => {
        shared_1.logger.error('Core service proxy error:', err);
        res.status(503).json({
            error: 'Service Unavailable',
            message: 'Core service is unavailable'
        });
    }
}));
// Protected routes (require authentication)
app.use('/api', auth_1.authMiddleware);
// Core service routes
app.use('/api/clients', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: CORE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/clients': '/api/clients'
    },
    onError: (err, req, res) => {
        shared_1.logger.error('Core service proxy error:', err);
        res.status(503).json({
            error: 'Service Unavailable',
            message: 'Core service is unavailable'
        });
    }
}));
app.use('/api/orders', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: CORE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/orders': '/api/orders'
    },
    onError: (err, req, res) => {
        shared_1.logger.error('Core service proxy error:', err);
        res.status(503).json({
            error: 'Service Unavailable',
            message: 'Core service is unavailable'
        });
    }
}));
app.use('/api/production', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: CORE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/production': '/api/production'
    },
    onError: (err, req, res) => {
        shared_1.logger.error('Core service proxy error:', err);
        res.status(503).json({
            error: 'Service Unavailable',
            message: 'Core service is unavailable'
        });
    }
}));
app.use('/api/finance', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: CORE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/finance': '/api/finance'
    },
    onError: (err, req, res) => {
        shared_1.logger.error('Core service proxy error:', err);
        res.status(503).json({
            error: 'Service Unavailable',
            message: 'Core service is unavailable'
        });
    }
}));
app.use('/api/hr', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: CORE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/hr': '/api/hr'
    },
    onError: (err, req, res) => {
        shared_1.logger.error('Core service proxy error:', err);
        res.status(503).json({
            error: 'Service Unavailable',
            message: 'Core service is unavailable'
        });
    }
}));
// Ashley AI service routes
app.use('/api/ai', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: AI_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
        '^/api/ai': '/api'
    },
    onError: (err, req, res) => {
        shared_1.logger.error('AI service proxy error:', err);
        res.status(503).json({
            error: 'Service Unavailable',
            message: 'AI service is unavailable'
        });
    }
}));
// Aggregated endpoints (BFF pattern)
app.get('/api/dashboard', async (req, res) => {
    try {
        // Aggregate data from multiple services for dashboard
        const [ordersResponse, productionResponse] = await Promise.allSettled([
            fetch(`${CORE_SERVICE_URL}/api/orders?limit=5`, {
                headers: { Authorization: req.headers.authorization }
            }),
            fetch(`${CORE_SERVICE_URL}/api/production/summary`, {
                headers: { Authorization: req.headers.authorization }
            })
        ]);
        const dashboard = {
            recent_orders: ordersResponse.status === 'fulfilled'
                ? await ordersResponse.value.json()
                : [],
            production_summary: productionResponse.status === 'fulfilled'
                ? await productionResponse.value.json()
                : {}
        };
        res.json(dashboard);
    }
    catch (error) {
        shared_1.logger.error('Dashboard aggregation error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to fetch dashboard data'
        });
    }
});
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
        shared_1.logger.info(`ASH API Gateway listening on port ${PORT}`);
    });
}
exports.default = app;
