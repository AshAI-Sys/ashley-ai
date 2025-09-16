"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requirePermission = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("@ash/shared/logger");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No authorization header provided'
            });
        }
        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided'
            });
        }
        const jwtSecret = process.env.ASH_JWT_SECRET;
        if (!jwtSecret) {
            logger_1.logger.error('JWT secret not configured');
            return res.status(500).json({
                error: 'Internal Server Error',
                message: 'Authentication configuration error'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Token expired'
            });
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid token'
            });
        }
        logger_1.logger.error('Auth middleware error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Authentication error'
        });
    }
};
exports.authMiddleware = authMiddleware;
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }
        if (!req.user.permissions.includes(permission)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: `Permission ${permission} required`
            });
        }
        next();
    };
};
exports.requirePermission = requirePermission;
const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required'
            });
        }
        if (req.user.role !== role) {
            return res.status(403).json({
                error: 'Forbidden',
                message: `Role ${role} required`
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
