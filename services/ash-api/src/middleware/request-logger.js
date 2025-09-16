"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const shared_1 = require("@ash/shared");
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    // Log request
    shared_1.logger.info('API Gateway Request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    });
    // Log response when it finishes
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        shared_1.logger.info('API Gateway Response', {
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            timestamp: new Date().toISOString()
        });
    });
    next();
};
exports.requestLogger = requestLogger;
