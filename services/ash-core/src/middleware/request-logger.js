"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = require("@ash/shared/logger");
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    // Log request
    logger_1.logger.info('HTTP Request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentLength: req.get('Content-Length'),
        timestamp: new Date().toISOString()
    });
    // Log response when it finishes
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        logger_1.logger.info('HTTP Response', {
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
